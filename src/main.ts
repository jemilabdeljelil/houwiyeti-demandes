import { NestApplicationOptions, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

import * as admin from 'firebase-admin';
import { ServiceAccount } from "firebase-admin";
import { ConfigService } from '@nestjs/config';

//import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const NEST_LOGGING = true;
async function bootstrap() {
  const opts: NestApplicationOptions = {}
  if (!NEST_LOGGING) { opts.logger = false }
  //const server = express();
  //const app = await NestFactory.create(AppModule, new ExpressAdapter(server));
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);
   // Set the config options
   const adminConfig: ServiceAccount = {
    "projectId": configService.get<string>('FIREBASE_PROJECT_ID'),
    "privateKey": configService.get<string>('FIREBASE_PRIVATE_KEY')
                               .replace(/\\n/g, '\n'),
    "clientEmail": configService.get<string>('FIREBASE_CLIENT_EMAIL'),
  };
   // Initialize the firebase admin app
   admin.initializeApp({
    credential: admin.credential.cert(adminConfig),
    databaseURL: "https://xxxxx.firebaseio.com",
  });
  app.enableCors();
  app.use(express.json({ limit: '20mb' }));
  app.useGlobalPipes(new ValidationPipe());
  await app.listen(configService.get<string>('API_PORT') || 3002);
}
bootstrap();
