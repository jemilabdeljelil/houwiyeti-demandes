import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';


interface Zonne {
  type: "Polygon";
  coordinates: number[][][]; // the coordinates of the vertices of the polygon
}
//livraisonDetails

@Schema({ collection: 'livraisonDetails' })
export class LivraisonDetails extends Document {

    @Prop({ required: true })
    name: string;
    @Prop({ required: true })
    price: number;
    @Prop({ required: true })
    delay: number;

    @Prop({ type: Object ,required: true })
    zonne: Zonne;


}
export const LivraisonDetailsSchema = SchemaFactory.createForClass(LivraisonDetails);