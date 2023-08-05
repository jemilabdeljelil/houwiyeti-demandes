import { Body, Controller, HttpException, HttpStatus, Post } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { CacService } from './cac.service';
import { MessageDTO } from './dto/message.dto';
import { getCacDTO } from './dto/getCacs.dto';
import { getLivraisonDetailsDTO } from './dto/getLivraisonDetails.dto';
import { Log } from './schemas/logs.schema';
import { validate } from 'class-validator';
import { DemandeTitreDTO } from './dto/demandeTitre.dto';
import { UpdateDemandeTitreDTO } from './dto/updateDemandeTitre.dto';
import { DemandeTitre } from './schemas/demandeTitre.schema';
import { NudSigpt } from './schemas/nudSigpts.schema';
import { CheckDemandeDTO } from './dto/checkDemande.dto';
import { DemandeExtraitsDTO } from './dto/demandeExtraitsDTO.dto';
import { DemandeExtrait } from './schemas/demandeExtrait.schema';
import { SuiviNudDTO } from './dto/suiviNud.dto';
import { AnnulerDemandeDTO } from './dto/annulerDemande.dto';




@Controller('cac')
export class CacController {
    constructor(private cacService: CacService,
        @InjectModel(Log.name) private LogeModel: mongoose.Model<Log>, @InjectModel(DemandeTitre.name) private DemandeTitreModel: mongoose.Model<DemandeTitre>,
        @InjectModel(DemandeExtrait.name) private DemandeExtraitModel: mongoose.Model<DemandeExtrait>,
        @InjectModel(NudSigpt.name) private NudSigptModel: mongoose.Model<NudSigpt>,
    ) { }





    @Post('getCacs')
    async getCacs(@Body() cacDTO: getCacDTO): Promise<any> {
        const errors = await validate(cacDTO);
        if (errors.length > 0) {
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        }

        const longitude = cacDTO.location.coordinates[0];
        const latitude = cacDTO.location.coordinates[1];

        const cacsNearby = await this.cacService.getCacsNearby(longitude, latitude);

        return cacsNearby;
    }





    @Post('getLivresonDeteals')
    async getLivresonDeteals(@Body() livraisonDetailsDTO: getLivraisonDetailsDTO): Promise<any> {
        const errors = await validate(livraisonDetailsDTO);
        if (errors.length > 0) {
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        }

        const longitude = livraisonDetailsDTO.location.coordinates[0];
        const latitude = livraisonDetailsDTO.location.coordinates[1];

        const deliveryDetails = await this.cacService.getLocationDetails(longitude, latitude);

        if (!deliveryDetails) {

            return new MessageDTO('errorCode', 10);
        }

        return {
            price: deliveryDetails.price,
            delay: deliveryDetails.delay,
            currency: 'MRU',
            successCode: 4,
        };
    }




    @Post('registerDemandeTitre')
    async registerDemandeTitre(@Body() demandeTitreDTO: DemandeTitreDTO): Promise<any> {

        const errors = await validate(demandeTitreDTO);
        if (errors.length > 0) {
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        }
        const paramsMap = await this.cacService.getParams();
        const photosDemandsPath = paramsMap.get('PHOTOS_DEMANDES_PATH');
        const photosSigptsPath = paramsMap.get('PHOTOS_SIGPTS_PATH');
        const piecesPath = paramsMap.get('PIECES_PATH');
        const preuvPieces = demandeTitreDTO.preuve;
        const nniMaster = await this.cacService.getNniByUid(demandeTitreDTO.uid);
        const nniDemande = demandeTitreDTO.nni;
        const TypeDocumentDemande = demandeTitreDTO.typeDocumentDemande;
        const codeDemand = demandeTitreDTO.codeDemande;
        const livraisonType = demandeTitreDTO.livraisonDetails.livraisonType;
        const demandeGeoLocation = demandeTitreDTO.position;
        const longitude = demandeTitreDTO.livraisonDetails.Location.coordinates[0];
        const latitude = demandeTitreDTO.livraisonDetails.Location.coordinates[1];
        const photoIcao = demandeTitreDTO.photoIcao;
        const photoIcaoData = Buffer.from(photoIcao, 'base64');
        const hashedNni = await this.cacService.hashNni(nniDemande);


        //ckeck if exste demande en cours
        if (await this.cacService.existDemendeEncours(nniDemande, TypeDocumentDemande)) {
            const log = { deviceToken: demandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: demandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 9, uid: demandeTitreDTO.uid, endpoint: 'registerDemandeTitre', position: demandeGeoLocation }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
            return new MessageDTO('errorCode', 9);
        }   

        //ckeck if  NNI  Authorized

        if (!await this.cacService.IsNniAuthorized(nniMaster, nniDemande, TypeDocumentDemande)) {
            const log = { deviceToken: demandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: demandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 8, uid: demandeTitreDTO.uid, endpoint: 'registerDemandeTitre', position: demandeGeoLocation }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
            return new MessageDTO('errorCode', 8);
        }

        if (!await this.cacService.demandeIsAuthorized(nniDemande, codeDemand)) {
            const log = { deviceToken: demandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: demandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 9, uid: demandeTitreDTO.uid, endpoint: 'registerDemandeTitre', position: demandeGeoLocation }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
            return new MessageDTO('errorCode', 9);
        }
        
        if (livraisonType == 'LAD') {
            if (!await this.cacService.zoneLivraisonExiste(longitude, latitude)) {
                const log = { deviceToken: demandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: demandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 10, uid: demandeTitreDTO.uid, endpoint: 'registerDemandeTitre', position: demandeGeoLocation }
                try {
                    const createdLog = await this.LogeModel.create(log);
                    console.log('Log created:', createdLog);
                } catch (error) {
                    console.error('Error creating log:', error);
                }

                return new MessageDTO('errorCode', 10);
            }
        }
        if (livraisonType == 'CAC') {
            if (!this.cacService.CacExiste) {
                const log = { deviceToken: demandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: demandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 10, uid: demandeTitreDTO.uid, endpoint: 'registerDemandeTitre', position: demandeGeoLocation }
                try {
                    const createdLog = await this.LogeModel.create(log);
                    console.log('Log created:', createdLog);
                } catch (error) {
                    console.error('Error creating log:', error);
                }
                return new MessageDTO('errorCode', 10);
            }
        }

        // Write the photoIcao to a file
        const photoIcaoName = `${hashedNni}_${new Date().toISOString()}.jpg`;
        try {
            await this.cacService.setImage(photoIcao, photoIcaoName, photosDemandsPath);
        } catch (error) {
            console.error('Error  writing file:', error);
            const log = {
                deviceToken: demandeTitreDTO.deviceToken,
                nni: nniDemande,
                phoneNumber: demandeTitreDTO.livraisonDetails.livraisonPhoneNumber,
                dateTime: new Date(),
                errorCode: 6,
                uid: demandeTitreDTO.uid,
                operation:"write_icaoFile",
                endpoint: 'registerDemandeTitre',
                position: demandeGeoLocation,
            };

            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }

            return new MessageDTO('errorCode', 6); // Photoicao not saved
        }

        //enregistrer les pieces envoyés avec la demandes
        const piecesNames = [];//les noms des pieces envoyés avec la demandes
        if (preuvPieces) {
            for (let i = 0; i < preuvPieces.length; i++) {
                try {
                    // Generate a unique filename

                    const fileName = `${hashedNni}_${new Date().toISOString()}_${i}.jpg`;

                    //  write it to the file

                    await this.cacService.setImage(preuvPieces[i], fileName, piecesPath);
                    piecesNames.push(fileName);
                } catch (error) {
                    // Handle any errors that occur during file writing
                    console.error(`Error writing preuvPiece ${i} to file: ${error}`);

                    const log = {
                        deviceToken: demandeTitreDTO.deviceToken,
                        nni: nniDemande,
                        phoneNumber: demandeTitreDTO.livraisonDetails.livraisonPhoneNumber,
                        dateTime: new Date(),
                        errorCode: 6,
                        uid: demandeTitreDTO.uid,
                        operation:"write_PieceJointe",
                        endpoint: 'registerDemandeTitre',
                        position: demandeGeoLocation,
                    };

                    try {
                        const createdLog = await this.LogeModel.create(log);
                        console.log('Log created:', createdLog);
                    } catch (error) {
                        console.error('Error creating log:', error);
                    }

                    return new MessageDTO('errorCode', 6); // pieces not saved

                }
            }
        }

        // Get Photo by NNI from photosSigptsPath 


        const photoSigName = `${hashedNni}.jpeg`

        let photoSig;
        try {

            photoSig = await this.cacService.getBinaryImage(photoSigName, photosSigptsPath);
        } catch (error) {
            const log = {
                deviceToken: demandeTitreDTO.deviceToken,
                nni: nniDemande,
                phoneNumber: demandeTitreDTO.livraisonDetails.livraisonPhoneNumber,
                dateTime: new Date(),
                errorCode: 6,
                uid: demandeTitreDTO.uid,
                operation:"get_SigBineryImage",
                endpoint: 'registerDemandeTitre',
                position: demandeGeoLocation,
            };

            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }

            return new MessageDTO('errorCode', 6); // Photo not found


        }

        //******************Envoi au matching **********************************************************************

        //  const deepfaceMatch = await this.cacService.callDeepfaceAPI(photoIcaoPath, photoSigPath);

        let comparefacResult = false;
        let OpenCvResult = false;
        let comparefaceScore = 0;
        let opencvScore = 0;
        const comparefaceMatch = await this.cacService.callComparefaceAPI(photoIcaoData, photoSig);
        if (comparefaceMatch) {
            if (comparefaceMatch.similarity > parseFloat(paramsMap.get('MATCH_ACCEPTED_SCORE'))) {
                comparefacResult = true;
            }
            comparefaceScore = comparefaceMatch.similarity * 100;
        }

        const openCvMatch = await this.cacService.callOpenCvAPI(photoIcaoData, photoSig);
        if (openCvMatch) {
            if (openCvMatch.distance < parseFloat(paramsMap.get('OPENCV_MAX_DISTANCE'))) {
                OpenCvResult = true;
            }

            opencvScore = (1 - openCvMatch.distance) * 100;
        }
        //
        if (!(comparefacResult && OpenCvResult)) {
            const log = { deviceToken: demandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: demandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 7, uid: demandeTitreDTO.uid, endpoint: 'registerDemandeTitre', position: demandeGeoLocation, comparefaceMatch: comparefaceMatch, openCvMatch: openCvMatch }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
            return new MessageDTO('errorCode', 7);

        }
        let orderData: string[];
        try {
            orderData = await this.cacService.generateNOrdreP(nniDemande, await this.cacService.convertTypeDoc(TypeDocumentDemande), await this.cacService.convertCodeDemande(codeDemand), 0);
        } catch (error) {
            const log = { deviceToken: demandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: demandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 6, uid: demandeTitreDTO.uid, operation:"Genrate_Order", endpoint: 'registerDemandeTitre', position: demandeGeoLocation, comparefaceMatch: comparefaceMatch, openCvMatch: openCvMatch }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
            return new MessageDTO('errorCode', 6); // Photo not found
        }
        const livraisonPin = await this.cacService.generateDeliveryPin();
        const personType = await this.cacService.getTypePersonneByNni(nniDemande);
        const nud = await this.cacService.generateNUD(personType);
        const user = await this.cacService.getUserByUid(demandeTitreDTO.uid);


        //enregistrer la nouvell demande
        const session = await this.DemandeTitreModel.startSession();
        session.startTransaction();
        try {
            const newDemande = await this.DemandeTitreModel.create({
                deviceToken: demandeTitreDTO.deviceToken,
                userId: user._id,
                nni: nniDemande,
                uid: user.uid,
                TypeDocumentDemande: TypeDocumentDemande,
                CodeDemande: codeDemand,
                DateDemande: new Date(),
                numOrdreRecette: orderData[0],
                montant: Number(orderData[1]),
                raison: demandeTitreDTO.raison,
                preuve: piecesNames,
                photoIcaoName: photoIcaoName,
                photoSigName: photoSigName,
                matchingScore1: comparefaceScore,
                matchingScore2: opencvScore,
                position: demandeTitreDTO.position,
                livraisonDetails: demandeTitreDTO.livraisonDetails,
                livraisonPin: livraisonPin,
            })

            const newNud = await this.NudSigptModel.create({
                nud: nud,
                idDemande: newDemande._id,
                nni: nniDemande,
                TypeDocumentDemande: TypeDocumentDemande,
                createdAt: new Date(),
                demandeStatus: 0,
                commentaire: 'En attente de paiement',

            });
            await session.commitTransaction();
            session.endSession();
            const retour = { numOrderDeRecette: orderData[0], Montant: orderData[1], demandeStatus: 0, successCode: 2, livresonPin: livraisonPin, NUD: nud, demandeId: newDemande._id };
            const log = { deviceToken: demandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: demandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), successCode: 2, uid: demandeTitreDTO.uid, endpoint: 'registerDemandeTitre', position: demandeGeoLocation, nudId: newNud._id, comparefaceMatch: comparefaceMatch, openCvMatch: openCvMatch }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }

            return retour;



        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            const log = { deviceToken: demandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: demandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 6, uid: demandeTitreDTO.uid, operation:"Enregistremet_du_demandes", endpoint: 'registerDemandeTitre', position: demandeGeoLocation, comparefaceMatch: comparefaceMatch, openCvMatch: openCvMatch }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
            session.endSession();
            return new MessageDTO('errorCode', 6);
        }


    }

    @Post('checkDemande')
    async checkDemande(@Body() checkDemandeDTO: CheckDemandeDTO): Promise<any> {
        const errors = await validate(checkDemandeDTO);
        if (errors.length > 0) {
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        }
        const uid = checkDemandeDTO.uid;


        const demandeStatus = await this.cacService.getDemandeStatusByNumOrdreRecette(checkDemandeDTO.numOrdreRecette);

        if (!demandeStatus) {
            const log = { deviceToken: checkDemandeDTO.deviceToken, numOrdreRecette: checkDemandeDTO.numOrdreRecette, dateTime: new Date(), errorCode: 6, uid: uid, endpoint: 'checkDemande' }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
            return new MessageDTO('errorCode', 6);


        }

        const log = { deviceToken: checkDemandeDTO.deviceToken, numOrdreRecette: checkDemandeDTO.numOrdreRecette, dateTime: new Date(), successCode: 3, uid: uid, endpoint: 'checkDemande' }
        try {
            const createdLog = await this.LogeModel.create(log);
            console.log('Log created:', createdLog);
        } catch (error) {
            console.error('Error creating log:', error);
        }

        return {
            demandeStatus: demandeStatus.demandeStatus,
            successCode: 3,
            commentaire: demandeStatus.commentaire,
        };
    }






    @Post('updateDemandeTitre')
    async updateDemandeTitre(@Body() updateDemandeTitreDTO: UpdateDemandeTitreDTO): Promise<any> {
        const errors = await validate(updateDemandeTitreDTO);
        if (errors.length > 0) {
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        }
        const paramsMap = await this.cacService.getParams();
        const photosDemandsPath = paramsMap.get('PHOTOS_DEMANDES_PATH');
        const photosSigptsPath = paramsMap.get('PHOTOS_SIGPTS_PATH');
        const piecesPath = paramsMap.get('PIECES_PATH');
        const demandeId = updateDemandeTitreDTO.demandeId;
        const updatedDemande = await this.cacService.getDemandeByid(demandeId);
        const preuvPieces = updateDemandeTitreDTO.preuve;
        const nniMaster = await this.cacService.getNniByUid(updateDemandeTitreDTO.uid);
        const nniDemande = updatedDemande.nni;
        const TypeDocumentDemande = updatedDemande.TypeDocumentDemande;
        const codeDemand = updateDemandeTitreDTO.codeDemande;   //type demande PR
        const livraisonType = updateDemandeTitreDTO.livraisonDetails.livraisonType;
        const demandeGeoLocation = updateDemandeTitreDTO.position;
        const longitude = updateDemandeTitreDTO.livraisonDetails.Location.coordinates[0]
        const latitude = updateDemandeTitreDTO.livraisonDetails.Location.coordinates[1];
        const photoIcao = updateDemandeTitreDTO.photoIcao;
        const photoIcaoData = Buffer.from(photoIcao, 'base64');
        const hashedNni = await this.cacService.hashNni(nniDemande);

        // Write the photoIcao to a file

        // Write the photoIcao to a file
        const photoIcaoName = `${hashedNni}_${new Date().toISOString()}.jpg`;
        try {
            await this.cacService.setImage(photoIcao, photoIcaoName, photosDemandsPath);
        } catch (error) {
            console.error('Error  writing file:', error);
            const log = { deviceToken: updateDemandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: updateDemandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 6, uid: updateDemandeTitreDTO.uid, endpoint: 'updateDemandeTitre', position: demandeGeoLocation }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
            return new MessageDTO('errorCode', 6); // Photoico not saved

        }

        const piecesNames = [];//les noms despieces envoyés avec la demandes

        for (let i = 0; i < preuvPieces.length; i++) {
            try {
                // Generate a unique filename
                const fileName = `${hashedNni}_${new Date().toISOString()}_${i}.jpg`;

                // Decode the base64 string and write it to the file

                await this.cacService.setImage(preuvPieces[i], fileName, piecesPath);
                piecesNames.push(fileName);

            } catch (error) {
                // Handle any errors that occur during file writing
                console.error(`Error writing preuvPiece ${i} to file: ${error}`);
            }
        }

        if (this.cacService.existDemendeEncours(nniDemande, TypeDocumentDemande)) {
            const log = { deviceToken: updateDemandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: updateDemandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 9, uid: updateDemandeTitreDTO.uid, endpoint: 'updateDemandeTitre', position: demandeGeoLocation }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
            return new MessageDTO('errorCode', 9);
        }

        if (!await this.cacService.IsNniAuthorized(nniMaster, nniDemande, TypeDocumentDemande)) {
            const log = { deviceToken: updateDemandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: updateDemandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 8, uid: updateDemandeTitreDTO.uid, endpoint: 'updateDemandeTitre', position: demandeGeoLocation }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
            return new MessageDTO('errorCode', 8);
        }

        if (! await this.cacService.demandeIsAuthorized(nniDemande, codeDemand)) {
            const log = { deviceToken: updateDemandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: updateDemandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 9, uid: updateDemandeTitreDTO.uid, endpoint: 'updateDemandeTitre', position: demandeGeoLocation }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
            return new MessageDTO('errorCode', 9);
        }
        if (livraisonType == 'LAD') {
            if (!this.cacService.zoneLivraisonExiste(longitude, latitude)) {
                const log = { deviceToken: updateDemandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: updateDemandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 10, uid: updateDemandeTitreDTO.uid, endpoint: 'updateDemandeTitre', position: demandeGeoLocation }
                try {
                    const createdLog = await this.LogeModel.create(log);
                    console.log('Log created:', createdLog);
                } catch (error) {
                    console.error('Error creating log:', error);
                }

                return new MessageDTO('errorCode', 10);
            }
        }
        if (livraisonType == 'CAC') {
            if (!this.cacService.CacExiste) {
                const log = { deviceToken: updateDemandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: updateDemandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 10, uid: updateDemandeTitreDTO.uid, endpoint: 'updateDemandeTitre', position: demandeGeoLocation }
                try {
                    const createdLog = await this.LogeModel.create(log);
                    console.log('Log created:', createdLog);
                } catch (error) {
                    console.error('Error creating log:', error);
                }
                return new MessageDTO('errorCode', 10);
            }
        }

        // Get Photo by NNI from photosSigptsPath 


        const photoSigName = `${hashedNni}.jpeg`
        let photoSig;
        try {
            // photoSig = fs.readFile(photoSigPath);
            photoSig = await this.cacService.getBinaryImage(photoSigName, photosSigptsPath);
        } catch (error) {
            const log = { deviceToken: updateDemandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: updateDemandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 6, uid: updateDemandeTitreDTO.uid, endpoint: 'updateDemandeTitre', position: demandeGeoLocation }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
            return new MessageDTO('errorCode', 6); // Photo not found
        }

        //const deepfaceMatch = await this.cacService.callDeepfaceAPI(photoIcaoPath, photoSigPath);



        let comparefacResult = false;
        let OpenCvResult = false;
        let comparefaceScore = 0;
        let opencvScore = 0;
        const comparefaceMatch = await this.cacService.callComparefaceAPI(photoIcaoData, photoSig);
        if (comparefaceMatch) {
            if (comparefaceMatch.similarity > parseFloat(process.env.MATCH_ACCEPTED_SCORE)) {
                comparefacResult = true;
            }
            comparefaceScore = comparefaceMatch.similarity * 100;
        }

        const openCvMatch = await this.cacService.callOpenCvAPI(photoIcaoData, photoSig);
        if (openCvMatch) {
            if (openCvMatch.distance < parseFloat(process.env.OPENCV_MAX_DISTANCE)) {
                OpenCvResult = true;
            }
            opencvScore = (1 - openCvMatch.distance) * 100;
        }
        // les deux api doit matcher le result
        if (!(comparefacResult && OpenCvResult)) {
            const log = { deviceToken: updateDemandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: updateDemandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 7, uid: updateDemandeTitreDTO.uid, endpoint: 'updateDemandeTitre', position: demandeGeoLocation, comparefaceMatch: comparefaceMatch, openCvMatch: openCvMatch }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
            return new MessageDTO('errorCode', 7);

        }

        const livraisonPin = await this.cacService.generateDeliveryPin();
        const personType = await this.cacService.getTypePersonneByNni(nniDemande);
        const nud = await this.cacService.generateNUD(personType);
        const user = await this.cacService.getUserByUid(updateDemandeTitreDTO.uid);
        //const newDemande = new DemandeTitre();
        updatedDemande.deviceToken = updateDemandeTitreDTO.deviceToken;

        updatedDemande.uid = user.uid;

        updatedDemande.raison = updateDemandeTitreDTO.raison;
        updatedDemande.preuve = piecesNames;// path des pieces de preuve
        updatedDemande.photoIcaoName = photoIcaoName;
        updatedDemande.photoSigName = photoSigName;
        updatedDemande.matchingScore1 = comparefaceScore;
        updatedDemande.matchingScore2 = opencvScore;
        updatedDemande.position = updateDemandeTitreDTO.position;
        updatedDemande.livraisonDetails = updateDemandeTitreDTO.livraisonDetails;
        updatedDemande.livraisonPin = livraisonPin;

        //enregistrer la nouvell demande
        const session = await this.DemandeTitreModel.startSession();
        session.startTransaction();
        try {
            await updatedDemande.updateOne({ session });
            const newNud = await this.NudSigptModel.create({
                nud: nud,
                idDemande: updatedDemande._id,
                nni: nniDemande,
                TypeDocumentDemande: TypeDocumentDemande,
                createdAt: new Date(),
                demandeStatus: 1,
                commentaire: 'Payée. En attente de validation',
            });
            await session.commitTransaction();
            session.endSession();
            const retour = { demandeStatus: 1, successCode: 2, livresonPin: livraisonPin, NUD: nud };
            const log = { deviceToken: updateDemandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: updateDemandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), successCode: 2, uid: updateDemandeTitreDTO.uid, endpoint: 'updateDemandeTitre', position: demandeGeoLocation, nudId: newNud._id, comparefaceMatch: comparefaceMatch, openCvMatch: openCvMatch }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }

            return retour;



        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            const log = { deviceToken: updateDemandeTitreDTO.deviceToken, nni: nniDemande, phoneNumber: updateDemandeTitreDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 6, uid: updateDemandeTitreDTO.uid, endpoint: 'updateDemandeTitre', demandeGeoLocation: location, comparefaceMatch: comparefaceMatch, openCvMatch: openCvMatch }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
            return new MessageDTO('errorCode', 6);
        }


    }



    @Post('registerDemandeExtraits')
    async registerDemandeExtraits(@Body() demandeExtraitsDTO: DemandeExtraitsDTO): Promise<any> {
        const errors = await validate(demandeExtraitsDTO);
        if (errors.length > 0) {
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        }
        const nniMaster = await this.cacService.getNniByUid(demandeExtraitsDTO.uid);
        const user = await this.cacService.getUserByUid(demandeExtraitsDTO.uid);
        const extraitsDemandes = demandeExtraitsDTO.extraits;
        const totalExtrait = await this.cacService.getTotalQty(extraitsDemandes);
        const longitude = demandeExtraitsDTO.location.coordinates[0];
        const latitude = demandeExtraitsDTO.location.coordinates[1];
        const allNnisAuthorized = await this.cacService.verifyAllNnisAuthorized(nniMaster, extraitsDemandes);
        if (!allNnisAuthorized) {
            const log = { deviceToken: demandeExtraitsDTO.deviceToken, nni: nniMaster, phoneNumber: demandeExtraitsDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 17, uid: demandeExtraitsDTO.uid, endpoint: 'registerDemandeExtraits', position: demandeExtraitsDTO.location }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }

            return new MessageDTO('errorCode', 17);
        }
        if (!this.cacService.zoneLivraisonExiste(longitude, latitude)) {
            const log = { deviceToken: demandeExtraitsDTO.deviceToken, nni: nniMaster, phoneNumber: demandeExtraitsDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 10, uid: demandeExtraitsDTO.uid, endpoint: 'registerDemandeExtraits', position: demandeExtraitsDTO.location }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }

            return new MessageDTO('errorCode', 10);
        } ''
        let orderData: string[];
        // const orderData = ['1302458792','100'];
        try {
            orderData = await this.cacService.generateNOrdreP(nniMaster, 10, 1, totalExtrait);
        } catch (error) {
            const log = { deviceToken: demandeExtraitsDTO.deviceToken, nni: nniMaster, phoneNumber: demandeExtraitsDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 6, uid: demandeExtraitsDTO.uid, endpoint: 'registerDemandeExtraits', position: demandeExtraitsDTO.location }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
            return new MessageDTO('errorCode', 6); // problem intern
        }
        const livraisonPin = await this.cacService.generateDeliveryPin();

        //enregistrer la nouvell demande
        const session = await this.DemandeExtraitModel.startSession();
        session.startTransaction();
        try {
            const NewDemandeExtrait = await this.DemandeExtraitModel.create({
                deviceToken: demandeExtraitsDTO.deviceToken,
                userId: user._id,
                nni: nniMaster,
                uid: demandeExtraitsDTO.uid,
                numOrdreRecette: orderData[0],
                montant: Number(orderData[1]),
                demandeStatus: 0,
                livraisonDetails: demandeExtraitsDTO.livraisonDetails,
                position: demandeExtraitsDTO.location,
                livraisonPin: livraisonPin,
                extraits: extraitsDemandes

            });
            await session.commitTransaction();
            session.endSession();
            const retour = { numOrdreRecette: orderData[0], montant: orderData[1], demandeStatus: 0, successCode: 2, livresonPin: livraisonPin };
            const log = { deviceToken: demandeExtraitsDTO.deviceToken, nni: nniMaster, phoneNumber: demandeExtraitsDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), successCode: 2, uid: demandeExtraitsDTO.uid, endpoint: 'registerDemandeExtraits', position: demandeExtraitsDTO.location, demandeExtraitId: NewDemandeExtrait._id }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }

            return retour;



        } catch (error) {
            await session.abortTransaction();
            session.endSession();

            const log = { deviceToken: demandeExtraitsDTO.deviceToken, nni: nniMaster, phoneNumber: demandeExtraitsDTO.livraisonDetails.livraisonPhoneNumber, dateTime: new Date(), errorCode: 6, uid: demandeExtraitsDTO.uid, endpoint: 'registerDemandeExtraits', position: demandeExtraitsDTO.location }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
            return new MessageDTO('errorCode', 6);
        }



    }

    @Post('suiviNud')
    async suiviNud(@Body() suiviNudDTO: SuiviNudDTO): Promise<any> {
        const errors = await validate(suiviNudDTO);
        if (errors.length > 0) {
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        }
        const uid = suiviNudDTO.uid;


        const nudInfo = await this.cacService.getNudInfo(suiviNudDTO.nud);

        if (!nudInfo) {
            const log = { deviceToken: suiviNudDTO.deviceToken, dateTime: new Date(), errorCode: 19, uid: uid, endpoint: 'suiviNud' }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
            return new MessageDTO('errorCode', 19);


        }

        const log = { deviceToken: suiviNudDTO.deviceToken, dateTime: new Date(),successCode: 5, uid: uid, endpoint: 'suiviNud' }
        try {
            const createdLog = await this.LogeModel.create(log);
            console.log('Log created:', createdLog);
        } catch (error) {
            console.error('Error creating log:', error);
        }

        return nudInfo;
    }

    @Post('annulerDemande')
    async annulerDemande(@Body() annlerDemandeDTO: AnnulerDemandeDTO): Promise<any> {
        const errors = await validate(annlerDemandeDTO);
        if (errors.length > 0) {
            throw new HttpException('Bad Request', HttpStatus.BAD_REQUEST);
        }
        const uid = annlerDemandeDTO.uid;
        const nud = annlerDemandeDTO.nud;

        const isAnnuler = await this.cacService.annulerDemande(nud);

        if (isAnnuler) {
          

            const log = { deviceToken: annlerDemandeDTO.deviceToken, dateTime: new Date(),successCode: 5, uid: uid, endpoint: 'annulerDemande' }
            try {
                const createdLog = await this.LogeModel.create(log);
                console.log('Log created:', createdLog);
            } catch (error) {
                console.error('Error creating log:', error);
            }
    
            return new MessageDTO('successCode', 5);


        }


        const log = { deviceToken: annlerDemandeDTO.deviceToken, dateTime: new Date(), errorCode: 20, uid: uid, endpoint: 'annulerDemande' }
        try {
            const createdLog = await this.LogeModel.create(log);
            console.log('Log created:', createdLog);
        } catch (error) {
            console.error('Error creating log:', error);
        }
        return new MessageDTO('errorCode', 20);
    }

}
