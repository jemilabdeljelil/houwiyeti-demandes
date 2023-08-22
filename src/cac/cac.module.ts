import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CacController } from './cac.controller';
import { CacService } from './cac.service';
import { AuthMiddleware } from './middleware/auth.middleware';
import { AuthorizedNniSchema } from './schemas/authorizedNnis.schema';
import { CacSchema } from './schemas/cacs.schema';
import { DemandeExtraitSchema } from './schemas/demandeExtrait.schema';
import { DemandeTitreSchema } from './schemas/demandeTitre.schema';
import { DeviceSchema } from './schemas/devices.schema';
import { LivraisonDetailsSchema } from './schemas/livraisonDetails.schema';
import { LogSchema } from './schemas/logs.schema';
import { NudSigptSchema } from './schemas/nudSigpts.schema';
import { ParamsSchema } from './schemas/params.schema';
import { PersonneSchema } from './schemas/personnes.schemas';
import { ReclamationSchema } from './schemas/reclamations.schemas';
import { SequentialNumberSchema } from './schemas/sequentialNumber.schema';
import { TitreSchema } from './schemas/titres.schema';
import { UserSchema } from './schemas/users.schemas';

@Module({
  imports: [MongooseModule.forFeature([{ name: 'Params', schema: ParamsSchema }, { name: 'Personne', schema: PersonneSchema }, { name: 'User', schema: UserSchema }, { name: 'Device', schema: DeviceSchema }, { name: 'Log', schema: LogSchema },{ name: 'Titre', schema: TitreSchema },{ name: 'NudSigpt', schema: NudSigptSchema },{ name: 'DemandeTitre', schema: DemandeTitreSchema },{ name: 'DemandeExtrait', schema: DemandeExtraitSchema },{ name: 'Cac', schema: CacSchema },{ name: 'LivraisonDetails', schema: LivraisonDetailsSchema },{ name: 'AuthorizedNni', schema: AuthorizedNniSchema },{ name: 'SequentialNumber', schema: SequentialNumberSchema },{ name: 'Reclamation', schema: ReclamationSchema }])],
  controllers: [CacController],
  providers: [CacService]
})


export class CacModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(CacController)
  }

}