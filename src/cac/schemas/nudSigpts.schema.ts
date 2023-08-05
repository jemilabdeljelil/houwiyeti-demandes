import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ collection: 'nudSigpts' })
export class NudSigpt extends Document {
  @Prop({ required: true })
  nud: string;


  @Prop({ required: true })
  nni: string;

  @Prop({ required: true})
  idDemande: string;

  @Prop({ required: true })
  TypeDocumentDemande: string;

  @Prop({ required: true, default: Date.now })
  createdAt: Date;

  @Prop()
  requestId: string;

  @Prop()
  commentaire: string;

  @Prop({ required: true })
  demandeStatus: number; /*
   0 :cree / En attente de paiement
	1 : Payée./ En attente de validation
	2 :validé / En production
	3 : produit /En expédition
	4 : Livrée (delivre)
	5: Rejetée
	6 : annulée  
   7  :disponible aucentre //*/

  
  @Prop({default:0})
  verifLock: number;
}

export const NudSigptSchema = SchemaFactory.createForClass(NudSigpt);

