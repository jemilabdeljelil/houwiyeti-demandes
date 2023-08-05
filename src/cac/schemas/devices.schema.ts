import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

//devices

@Schema({ collection: 'devices' })
export class Device extends Document {
  @Prop()
  deviceToken: string;

  @Prop()
  uid: string;

  @Prop()
  actif: boolean;

  @Prop()
  matchingStatus: number;

  @Prop()
  notifToken: string;

  @Prop()
  nni: string;
}

export const DeviceSchema = SchemaFactory.createForClass(Device);
