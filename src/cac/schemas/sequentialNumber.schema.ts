import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class SequentialNumber extends Document {
  @Prop({ default: () => new Date() })
  date: Date;

  @Prop({ default: 0 })
  sequentialNumber: number;
}

export const SequentialNumberSchema = SchemaFactory.createForClass(SequentialNumber);
