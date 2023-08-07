import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacModule } from './cac/cac.module';

@Module({
  imports: [ConfigModule.forRoot({
    envFilePath: '.env',
    isGlobal: true,
  }),
  MongooseModule.forRoot(`mongodb://anrpts_houwiyeti_user:hgTR125TFRG265POI@mongo1:30001,mongo2:30002,mongo3:30003/anrpts?replicaSet=rs0&authSource=admin`,
    {
      dbName: 'anrpts', // Set the database name
      authSource: 'admin',// Specify the authentication source database
      authMechanism: 'SCRAM-SHA-256', // Set the authentication mechanism to SCRAM-SHA-256
    },
  ),
    CacModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }


//`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@102.216.219.44:27017/${process.env.DB_NAME}`    internet
//`mongodb://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`
//process.env.DB_URl_local
//`mongodb://anrpts_houwiyeti_user:hgTR125TFRG265POI@mongo1:30001,mongo2:30002,mongo3:30003/anrpts?replicaSet=rs0&authSource=admin`