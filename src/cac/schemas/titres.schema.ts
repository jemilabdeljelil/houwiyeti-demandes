import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'titres' })
export class Titre extends Document {
  @Prop({ required: true })
  nni: string;

  @Prop({ required: true })
  typeTitre: string;

  @Prop({ required: true })
  docNumber: string;

  @Prop({ required: true })
  expiryDT: Date;

  @Prop({ required: true })
  issueDT: Date;

  @Prop({ required: true })
  statut: string;  // expire resilier
}

export const TitreSchema = SchemaFactory.createForClass(Titre);
