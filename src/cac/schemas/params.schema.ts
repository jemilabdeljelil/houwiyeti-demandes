import { Prop, Schema } from "@nestjs/mongoose";
import { SchemaFactory } from "@nestjs/mongoose/dist";


//params
@Schema({ collection: 'params' })
export default class Params{

    @Prop()
    key :string;

    @Prop()
    value :string;
}
export const ParamsSchema=SchemaFactory.createForClass(Params)