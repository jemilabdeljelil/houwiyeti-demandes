import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

//reclamations

@Schema({ collection: 'reclamations' })
export class Reclamation extends Document {

    @Prop()
    nni: string;

    @Prop()
    deviceToken: string; 

    @Prop()
    phoneNumber: string;

    @Prop()
    description: string;

    @Prop()
    preuvePieceName: string;

    @Prop()
    piecesDirectory: string;


    @Prop({default : new Date})
    dateTime: Date;
  



}

export const ReclamationSchema = SchemaFactory.createForClass(Reclamation);
