import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

interface AuthorizedListItem {
  nni: string;
  ID: boolean;
  NP: boolean;
  VP: boolean;
  RC: boolean;
  EN: boolean;
  EM: [];
  EV: [];
  ED: boolean;
}

@Schema({ collection: 'authorizedNnis' })
export class AuthorizedNni extends Document {
  @Prop({ required: true })
  nni: string;

  @Prop({ required: true, type: [Object] })
  authorizedList: AuthorizedListItem[];
}

export const AuthorizedNniSchema = SchemaFactory.createForClass(AuthorizedNni);
