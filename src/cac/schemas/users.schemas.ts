import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
//users
@Schema({ collection: 'users' })
export class User extends Document {
    @Prop({ required: true })
    uid: string;

    @Prop({ required: true })
    nni: string;

    @Prop({ required: true })
    phoneNumber: string;
    
    @Prop({ required: true })
    actif: boolean;

    @Prop({ default: 0 })
    matchingTentatives: number;

    @Prop({ required: false })
    notifToken?: string;
}

export const UserSchema = SchemaFactory.createForClass(User);
