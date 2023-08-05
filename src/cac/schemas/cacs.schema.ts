import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


interface GeoLocation {
  type: string;
  coordinates: number[];
}
//cacs

@Schema({ collection: 'cacs' })
export class Cac extends Document {


  @Prop({ required: true })
  codeCentre: string;
  @Prop({ required: true })
  nomCentreFr: string;
  @Prop({ required: true })
  nomCentreAr: string;
  @Prop({ type: Object, required: false })
  location: GeoLocation;



}
export const CacSchema = SchemaFactory.createForClass(Cac);