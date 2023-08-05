import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'personnes' })
export class Personne extends Document {
  @Prop({ required: true })
  nni: string;

  @Prop({ required: true })
  prenomAr: string;

  @Prop({ required: true })
  prenomFr: string;

  @Prop({ required: true })
  perePrenomAr: string;

  @Prop({ required: true })
  perePrenomFr: string;

  @Prop({ required: true })
  patronymeAr: string;

  @Prop({ required: true })
  patronymeFr: string;

  @Prop({ required: true })
  sexeCode: string;

  @Prop({ required: true })
  dateNaissance: Date;

  @Prop({ required: true })
  lieuNaissanceAr: string;

  @Prop({ required: true })
  lieuNaissanceFr: string;

  @Prop({ type: [String], required: true })
  nationalities: string[];

  @Prop({ required: true })
  typePersonne: string;

  @Prop()
  status: string; // valid
}

export const PersonneSchema = SchemaFactory.createForClass(Personne);

