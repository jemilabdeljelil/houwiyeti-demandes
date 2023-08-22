import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import axios from 'axios';
import mongoose from 'mongoose';
import { AuthorizedNni } from './schemas/authorizedNnis.schema';
import { Cac } from './schemas/cacs.schema';
import { DemandeExtrait } from './schemas/demandeExtrait.schema';
import { DemandeTitre } from './schemas/demandeTitre.schema';
import { Device } from './schemas/devices.schema';
import { LivraisonDetails } from './schemas/livraisonDetails.schema';
import { Log } from './schemas/logs.schema';
import { NudSigpt } from './schemas/nudSigpts.schema';
import Params from './schemas/params.schema';
import { Personne } from './schemas/personnes.schemas';
import { Titre } from './schemas/titres.schema';
import { User } from './schemas/users.schemas';
import { SequentialNumber } from './schemas/sequentialNumber.schema';
import { ConfigService } from '@nestjs/config';
import * as FormData from 'form-data';
import * as crypto from 'crypto';
import { NudInfoDTO } from './dto/nudInfo.dto';





interface OpenCvResult {
  code: string;
  match: boolean;
  distance: number;
}

enum ExtraitType {
  EN = 'EN',
  EM = 'EM',
  EV = 'EV',
  ED = 'ED',
}

export class Extrait {
  nni: string;
  NumeroActe: string;
  extraitType: ExtraitType;
  qtyAr: number;
  qtyFr: number;
}

@Injectable()
export class CacService {
  constructor(
    @InjectModel(Params.name) private ParamsModel: mongoose.Model<Params>,
    @InjectModel(Personne.name) private personneModel: mongoose.Model<Personne>,
    @InjectModel(User.name) private UserModel: mongoose.Model<User>,
    @InjectModel(Device.name) private DeviceModel: mongoose.Model<Device>,
    @InjectModel(Log.name) private LogeModel: mongoose.Model<Log>,
    @InjectModel(Titre.name) private TitreModel: mongoose.Model<Titre>,
    @InjectModel(NudSigpt.name) private NudSigptModel: mongoose.Model<NudSigpt>,
    @InjectModel(DemandeTitre.name) private DemandeTitreModel: mongoose.Model<DemandeTitre>,
    @InjectModel(DemandeExtrait.name) private DemandeExtraitModel: mongoose.Model<DemandeExtrait>,
    @InjectModel(Cac.name) private CacModel: mongoose.Model<Cac>,
    @InjectModel(LivraisonDetails.name) private LivraisonDetailsModel: mongoose.Model<LivraisonDetails>,
    @InjectModel(AuthorizedNni.name) private AuthorizedNniModel: mongoose.Model<AuthorizedNni>,
    @InjectModel(SequentialNumber.name) private SequentialNumberModel: mongoose.Model<SequentialNumber>,
    
    private configService: ConfigService,
    //private httpService: HttpService
  ) { }


  // methode that get all params set

  async getParams(): Promise<Map<string, string>> {
    const params = await this.ParamsModel.find({}).exec();
    const paramMap = new Map<string, string>();

    params.forEach(param => {
      paramMap.set(param.key, param.value);
    });

    return paramMap;
  }
  //type de perssone
  async getTypePersonneByNni(nni: string): Promise<string> {
    const personne = await this.personneModel.findOne({ nni }).exec();

    if (!personne) {
      throw new NotFoundException('Personne not found');
    }

    return personne.typePersonne;
  }

  //get nni by user.uid from users
  async getNniByUid(uid: string): Promise<string> {
    const user = await this.UserModel.findOne({ uid }).exec();
    if (!user) {
      throw new Error(`User with UID ${uid} not found`);
    }
    return user.nni;
  }

  //get user by user.uid from users
  async getUserByUid(uid: string): Promise<User> {
    const user = await this.UserModel.findOne({ uid }).exec();
    if (!user) {
      throw new Error(`User with UID ${uid} not found`);
    }
    return user;
  }
  // Devices of an user
  async findDevicesByUid(uid: string): Promise<Device[]> {
    const user = await this.UserModel.findOne({ uid }).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const devices = await this.DeviceModel.find({ uid: uid }).exec();
    return devices;
  }

  //get personne by id

  async findOne(id: string): Promise<Personne> {
    const personne = await this.personneModel.findById(id);
    return personne;
  }

  //get personne by nni

  async findByNni(nni: string): Promise<Personne> {
    const personne = await this.personneModel.findOne({ nni }).exec();
    if (!personne) {
      throw new NotFoundException(`Personne with NNI '${nni}' not found`);
    }
    return personne;
  }
  //cacs  from near  to far
  async getCacsNearby(longitude: number, latitude: number): Promise<Cac[]> {
    const cacs = await this.CacModel.aggregate([
      {
        $geoNear: {
          near: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
          distanceField: 'distance',
          spherical: true,
        },
      },
      {
        $sort: {
          distance: 1,
        },
      },
    ]).exec();

    return cacs;
  }
  // get zone by point
  async getLocationDetails(longitude: number, latitude: number): Promise<any> {
    const locationDetails = await this.LivraisonDetailsModel.findOne({
      'zonne.coordinates': {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        },
      },
    });

    if (!locationDetails) {
      throw new NotFoundException(`locationDetails  not found`);
      // return { errorCode: 10 };
    }

    return {
      price: locationDetails.price,
      delay: locationDetails.delay,
      currency: 'MRU',
      successCode: 4,
    };
  }
  // zone de Livraison existe
  async zoneLivraisonExiste(longitude: number, latitude: number): Promise<boolean> {
    const locationDetails = await this.LivraisonDetailsModel.findOne({
      'zonne.coordinates': {
        $nearSphere: {
          $geometry: {
            type: 'Point',
            coordinates: [longitude, latitude],
          },
        },
      },
    });

    return !!locationDetails; // Returns true if locationDetails exists, otherwise false.
  }

  //cac existe
  async CacExiste(codeCentre: string): Promise<boolean> {
    const cac = await this.CacModel.findOne({ codeCentre }).exec();
    if (!cac) {
      throw new NotFoundException(`cac with code '${codeCentre}' not found`);
    }
    return true;
  }

  // le nni et la demande est autorisé
  async IsNniAuthorized(nniMaster: string, nniSlave: string, flag: string): Promise<boolean> {
    // check if nniMaster exists in the authorizedNni collection
    const authorizedNni = await this.AuthorizedNniModel.findOne({ nni: nniMaster });
    if (!authorizedNni) {
      return false;
    }
    // check if nniSlave exists in the authorizedList of authorizedNni
    const authorizedListItem = authorizedNni.authorizedList.find(item => item.nni === nniSlave);
    if (!authorizedListItem) {
      return false;
    }
    // check if the specified flag is exists
    if (!authorizedListItem[flag]) {
      return false;
    }
    return true;
  }

  // tous les nni et extrait demandes sont autorisé

  async verifyAllNnisAuthorized(nniMaster: string, extraitsDemandes: Extrait[]): Promise<boolean> {
    for (const extrait of extraitsDemandes) {
      const isAuthorized = await this.IsNniAuthorized(nniMaster, extrait.nni, extrait.extraitType);
      if (!isAuthorized) {
        return false; // return false as soon as one NNI is not authorized
      }
    }
    return true; // all NNIs are authorized
  }
  async existDemendeEncours(nni: string, typeDocumentDemande: string): Promise<boolean> {
    const query = {
      nni: nni,
      TypeDocumentDemande: typeDocumentDemande,
      demandeStatus: { $in: [0, 1, 2, 3] } // Use the $in operator to match the demanded status values
    };
    //console.log(query);

    const count = await this.NudSigptModel.countDocuments(query);

    return count > 0;
  }


  // demende est autorisé
  async demandeIsAuthorized(nni: string, codeDemand: string,typeDocumentDemande: string): Promise<boolean> {
    const titre = await this.TitreModel.findOne({
      nni,
      typeTitre: typeDocumentDemande,
      expiryDT: { $gte: new Date() }, // filter out expired titres
    }).sort({ expiryDT: -1 }).exec(); // sort by descending expiry date
    // delai avant expiration en ms
    const delaiAvantExpirationMs = Number((await this.getParams()).get('delaiAvantExpiration_NP')) * 86400000;


    if (codeDemand === 'RN') {
      if (titre && titre.expiryDT.getTime() - Date.now() < delaiAvantExpirationMs) {
        return true;
      } else {
        return false;
      }
    } else if (codeDemand === 'PR') {
      if (!titre) {
        return true;
      } else {
        return false;
      }
    } else if (codeDemand === 'RP') {
      if (titre) {
        return true;
      } else {
        return false;
      }
    } else {
      throw new Error(`Invalid codeDemand: ${codeDemand}`);
    }
  }
  // generate random id
  async generateId(length: number): Promise<string> {
    const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    const id = [];
    for (let i = 0; i < length; i++) {
      id.push(characters[Math.floor(Math.random() * characters.length)]);
    }
    return id.join("");
  }

  // matching

  // Make HTTP request to deepface API    //urls images
  async callDeepfaceAPI(urlPhoto1: string, urlPhoto2: string): Promise<any> {
    try {
      const response = await axios.post(process.env.DEEPFACE_URL, {
        urlPhoto1,
        urlPhoto2,
      });
      return response.data.match;
    } catch (error) {
      console.error('Error calling DeepFace API', error);
      return false;
    }
  }


  // Make HTTP request to compareface API   // images base64
  async callComparefaceAPI(sourceImage: Buffer, targetImage: Buffer): Promise<{ similarity: number } | null> {
    const serviceApiKey = '077a7384-b348-4bc8-ac1c-dfe6bfb74915';
    const comparfaceUrl = (await this.ParamsModel.findOne({ key: "COMPAREFACE_URL" }).exec()).value;

    const formData = new FormData();
    formData.append('source_image', sourceImage, { filename: 'photo1.jpeg' });
    formData.append('target_image', targetImage, { filename: 'photo2.jpeg' });

    const headers = {
      ...formData.getHeaders(),
      'x-api-key': serviceApiKey,
    };

    try {
      const response = await axios.post(comparfaceUrl, formData, { headers });
      const similarity = response.data?.result?.[0]?.face_matches?.[0]?.similarity;
      return { similarity } as { similarity: number };
    } catch (error) {
      console.error(error); // Handle any errors that occur during the request
      return null;
    }
  }

  // Make HTTP request to OpenCV API  will take images binery
  async callOpenCvAPI(photo1: Buffer, photo2: Buffer): Promise<OpenCvResult> {
    const opencvUrl = (await this.ParamsModel.findOne({ key: "OPENCV_URL" }).exec()).value;
    try {
      const formData = new FormData();
      formData.append('file1', photo1, 'photo1.jpg');
      formData.append('file2', photo2, 'photo2.jpg');

      const response = await axios.post<OpenCvResult>(opencvUrl, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      return response.data;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async convertTypeDoc(typDoc: string): Promise<number> {
    switch (typDoc) {
      case 'ID':
        return 5;
      case 'NP':
        return 6;
      case 'VP':
        return 7;
      case 'CR':
        return 8;
      default:
        throw new Error(`Invalid type document: ${typDoc}`);
    }
  }
  async convertCodeDemande(codeDemande: string): Promise<number> {
    switch (codeDemande) {
      case 'PR':
        return 1;
      case 'RP':
        return 2;
      case 'RN':
        return 3;

      default:
        throw new Error(`Invalid Code demande: ${codeDemande}`);
    }
  }

  // private url = 'http://localhost:8084/orders/generateOrdre';
  public async generateNOrdreP(nni: string, typDoc: number, typDemand: number, nbrExtrait: number): Promise<string[]> {
    const url = (await this.ParamsModel.findOne({ key: "ORDERS_API_URL" }).exec()).value;
    const urlAuth = (await this.ParamsModel.findOne({ key: "ORDERS_API_AUTH" }).exec()).value;

    const orderDto = {
      nni: nni,
      typeDocument: typDoc,
      typeDemande: typDemand,
      nbrExtrait: nbrExtrait,
      login: 'houwiyeti',
      cac: '130000',
    };

    const credentials = {
      login: "exp",
      password: "12345678",
    };

    const authHeaders = {
      'Content-Type': 'application/json',
    };

    // Call urlAuth to get the token
    const authResponse = await axios.post<{ token: string }>(urlAuth, credentials, { headers: authHeaders });
    const authToken = authResponse.data;

    // Set the headers with bearer token and request body
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${authToken}`, // Include the bearer token in the Authorization header
    };

    // Send the POST request with the updated headers and get the response
    const response = await axios.post<string[]>(url, orderDto, { headers });
    const responseBody = response.data; // Get the response body

    return responseBody;
  }


  async generateDeliveryPin(): Promise<string> {

    let pin = "";
    for (let i = 0; i < 4; i++) {
      pin += Math.floor(Math.random() * 10).toString();
    }
    return pin;
  }

  async incrementAndGetSequentialNumber(date: Date): Promise<number> {
    // Get the start and end of the current day
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const endOfDay = new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000 - 1);

    // Find the document for the current day, or create it if it doesn't exist
    const filter = { date: { $gte: startOfDay, $lte: endOfDay } };
    const update = { $inc: { sequentialNumber: 1 } };
    const options = { upsert: true, new: true };
    const result = await this.SequentialNumberModel.findOneAndUpdate(filter, update, options).exec();

    // Return the sequential number
    return result.sequentialNumber;
  }


  async generateNUD(personType: string): Promise<string> {
    const machineCode = '555';
    const now = new Date();
    const dateString = `${now.getDate().toString().padStart(2, '0')}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear()}${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}${now.getSeconds().toString().padStart(2, '0')}`;
    const sequentialNumber = (await this.incrementAndGetSequentialNumber(now)).toString().padStart(4, '0');
    const nud = `${machineCode}${dateString}${personType}${sequentialNumber}`;
    return nud;
  }

  //get demande status
  async getDemandeStatusByNumOrdreRecette(numOrdreRecette: string): Promise<{ demandeStatus: number, commentaire: string }> {
    // find the corresponding demandeTitre
    const demandeTitre = await this.DemandeTitreModel.findOne({ numOrdreRecette }).exec();
    if (!demandeTitre) {
      throw new Error(`No demandeTitre found for numOrdreRecette ${numOrdreRecette}`);
    }

    // find the corresponding nudSigpt
    const nudSigpt = await this.NudSigptModel.findOne({ demandeId: demandeTitre._id }).exec();
    if (!nudSigpt) {
      throw new Error(`No nudSigpt found for demandeId ${demandeTitre._id}`);
    }

    return { demandeStatus: nudSigpt.demandeStatus, commentaire: nudSigpt.commentaire };
  }

  //get NUD info
  async getNudInfo(nud: string): Promise<NudInfoDTO> {


    // find the corresponding nudSigpt
    const nudSigpt = await this.NudSigptModel.findOne({ nud: nud }).exec();
    if (!nudSigpt) {
      throw new Error(`No nudSigpt found for demandeId ${nud}`);
    }

    return { nud: nudSigpt.nud, nni: nudSigpt.nni, date_creation: nudSigpt.createdAt, demandeStatus: nudSigpt.demandeStatus, commentaire: nudSigpt.commentaire };
  }

  //get demande by id
  async getDemandeByid(idDemande: string): Promise<DemandeTitre> {
    const demandeTitre = await this.DemandeTitreModel.findOne({ idDemande }).exec();
    if (!demandeTitre) {
      throw new Error(`No demandeTitre found for idDemande ${idDemande}`);
    }
    return demandeTitre;
  }
  // le nombre total des extraits
  async getTotalQty(extraitsDemandes: Extrait[]): Promise<number> {
    let totalQty = 0;
    for (const extrait of extraitsDemandes) {
      totalQty += extrait.qtyAr + extrait.qtyFr;
    }
    return totalQty;
  }

  async hashNni(nni: string): Promise<string> {
    const hash = crypto.createHash('sha256');
    hash.update(nni + '@nrpts_Salt-for+generating_ph0t0$');
    return hash.digest('hex');
  }

  //set image to houwiyeti-file-cloud
  async setImage(base64Image: string, imageName: string, imagePath: string) {
    const url = (await this.ParamsModel.findOne({ key: "setImageUrl" }).exec()).value;
    try {
      const response = await axios.post(url, {
        base64Image,
        imageName,
        imagePath
      });

      console.log('Image set successfully:', response.data);
    } catch (error) {
      console.error('Error setting image:', error);
    }
  }
  //get binery image from http url
  async getBinaryImage(imageName: string, imageDirectory: string): Promise<Buffer> {
    const url = (await this.ParamsModel.findOne({ key: "getBinaryImageUrl" }).exec()).value;
    try {
      const response = await axios.get(`${url}/${imageName}/${imageDirectory}`, { responseType: 'arraybuffer' });
      console.log("sigpts image geted  successfully");
      return Buffer.from(response.data, 'binary');

    } catch (error) {
      console.error('Error geting image:', error);
    }
  }

  async annulerDemande(nud: string): Promise<boolean> {
    if (!nud || !nud.startsWith('555')) {
      return false;
    }

    const nudSigpt = await this.NudSigptModel.updateOne(
      { nud: nud, demandeStatus: 0 },
      {
        demandeStatus: 6,
        commentaire: "Cette demande a été annulée par son émetteur"
      },
      {
        new: true, // Return the updated document
        runValidators: true, // Validate the update operation against the model's schema
        upsert: false // Do not create a new document if not found
      }
    );

    if (nudSigpt.modifiedCount == 0) {
      return false;
    }

    return true;
  }
}
