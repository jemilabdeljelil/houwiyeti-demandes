import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


interface Coordinates {
 
  coordinates: [number, number];
}
interface Location {
  type: string;
  coordinates: Coordinates;
}

interface LivraisonDetails {
  livraisonType: string;
  Location?: Location;
  livraisonPhoneNumber: string;
  address?: string;
  zipCode?: string;
}

@Schema({ collection: 'demandeTitre' })
export class DemandeTitre extends Document {
  @Prop({ required: true })
  deviceToken: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  nni: string;

  @Prop({ required: true })
  uid: string;

  @Prop({ required: true })
  TypeDocumentDemande: string; // ID NP RC

  @Prop({ required: true })
  CodeDemande: string;      // PR RP RN

  
  @Prop({ required: true })
  DateDemande: Date; 

 

  @Prop({ required: true })
  numOrdreRecette: string;

  @Prop({ required: true })
  montant: number;

  @Prop({ required: true })
  raison: string;

  @Prop()
  preuve: string[];

  @Prop()
  photoIcaoName: string;

  @Prop()
  photoSigName: string;

  @Prop()
  matchingScore1: number;

  @Prop()
  matchingScore2: number;

  @Prop({ required: true, type: Object })
  position: Location;

  @Prop({ required: true, type: Object })
  livraisonDetails: LivraisonDetails;

  @Prop({ required: true })
  livraisonPin: string;

  @Prop(  )
  verifDecision: string; // hit,noHit,badImage
}

export const DemandeTitreSchema = SchemaFactory.createForClass(DemandeTitre);
