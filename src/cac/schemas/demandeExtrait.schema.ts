import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


enum ExtraitType {
  EN = 'EN',
  EM = 'EM',
  EV = 'EV',
  ED = 'ED',
}

interface Coordinates {
  coordinates: [number, number];
}

interface Location {
  type: 'Point';
  coordinates: Coordinates;
}

interface LivraisonDetails {
  livraisonType: string;
  Location: Location;
  livraisonPhoneNumber: string;
  address?: string;
  zipCode?: string;
}

interface Extrait {
  nni: string;
  NumeroActe:string;
  extraitType: ExtraitType;
  qtyAr: number;
  qtyFr: number;
}

@Schema({ collection: 'demandeExtrait' })
export class DemandeExtrait extends Document {
  @Prop({ required: true })
  deviceToken: string;

  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  nni: string;

  @Prop({ required: true })
  uid: string;

  @Prop({ required: true })
  numOrdreRecette: string;

  @Prop({ required: true })
  montant: number;

  @Prop({ required: true })
  demandeStatus: number;

  @Prop({ type: Object })
  livraisonDetails: LivraisonDetails;

  @Prop({ type: Object, required: true })
  position: Location;

  @Prop({ required: true })
  livraisonPin: string;

  @Prop({ required: true, type: [Object] })
  extraits: Extrait[];
}

export const DemandeExtraitSchema = SchemaFactory.createForClass(DemandeExtrait);
