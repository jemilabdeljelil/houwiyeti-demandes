import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';



class CoordinatesDTO {

  coordinates: [number, number];
}
class Location {
 
  type: 'Point';

  coordinates: CoordinatesDTO;
}
//logs
@Schema({ collection: 'logs' })
export class Log extends Document {
  @Prop({ required: true })
  deviceToken: string;

  @Prop()
  nni: string;

  @Prop()
  phoneNumber: string;

  @Prop({ required: true })
  dateTime: Date;

  @Prop()
  errorCode: string;

  @Prop()
  successCode: string;

  @Prop({ required: true })
  uid: string;

  @Prop()
  IP: string;

  @Prop()
  userId: string;

  @Prop()
  pathMatchingPhoto: string; 

  @Prop()
  endpoint: string; 

  @Prop({
    type: { type: String, enum: ['Point'] },
    coordinates: { type: [Number], required: true },
  })
  position: Location;
}

export const LogSchema = SchemaFactory.createForClass(Log);
