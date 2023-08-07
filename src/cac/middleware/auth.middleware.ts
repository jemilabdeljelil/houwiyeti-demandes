import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { CacService } from '../cac.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private cacService: CacService) { }

  async use(req: Request, res: Response, next: NextFunction) {

    try {
      //if (process.env.TESTE === 'true') { // Add this condition to skip all checks
      // console.log('Firebase is skiped.');
      // next();
      //  return;
      // }

      const authToken = req.headers['authtoken'] as string;
      const appcheckToken = req.headers['appchecktoken'] as string;
      const devicetoken = req.headers['devicetoken'] as string;
      const appversion = req.headers['appversion'] as string;

      const paramsMap = await this.cacService.getParams();
      // Check auth token and extract UID authTOken from herader
      //const authToken = authorization?.split(' ')[1];
      if (authToken) {
        const decodedToken = await admin.auth().verifyIdToken(authToken);
        req.body.uid = decodedToken.uid;
      } else {
        throw new Error('Missing auth token');
      }

      // Check appcheck token
      if (appcheckToken) {
        await admin.appCheck().verifyToken(appcheckToken);
      } else {
        throw new Error('Missing appcheck token');
      }
      // Check app version
      const minVersion = Number(paramsMap.get('minVersion'));
      if (!isNaN(minVersion) && appversion && Number(appversion) < minVersion) {
        throw new Error('This version of the mobile application is obsolete.');
      }

      if (devicetoken) {
        req.body.deviceToken = devicetoken;
      } else {
        throw new Error('Missing deviceToken');
      }

      // Check device token
      const userDevices = await this.cacService.findDevicesByUid(req.body.uid);
      const device = userDevices.find((d) => d.deviceToken === devicetoken && d.actif);

      if (!device) {
        throw new Error('Invalid or inactive device token');
      }

      // Matching status
      if (device.matchingStatus !== 1) {
        throw new Error('Invalid matching status');
      }

      next();
    } catch (error) {
      res.status(401).send({ message: error.message });
    }
  }
}
