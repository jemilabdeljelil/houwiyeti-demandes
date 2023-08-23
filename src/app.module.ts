import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CacModule } from './cac/cac.module';

@Module({
  imports: [ConfigModule.forRoot({
    //envFilePath: process.env.NODE_ENV === 'production' ? '.env.prod' : '.env.dev',
    //envFilePath: '.env.dev',
    envFilePath: '.env.prod',
    isGlobal: true,
  }),
  MongooseModule.forRoot(process.env.DB_URL,
    {
      dbName: 'anrpts', // Set the database name
      authMechanism: 'SCRAM-SHA-256', // Set the authentication mechanism to SCRAM-SHA-256
    },
  ),
    CacModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }





