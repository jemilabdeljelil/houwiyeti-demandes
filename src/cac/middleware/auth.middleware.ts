import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import * as admin from 'firebase-admin';
import { CacService } from '../cac.service';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private cacService: CacService) { }

  async use(req: Request, res: Response, next: NextFunction) {

    try {
      //  if (process.env.TESTE === 'true') { // Add this condition to skip all checks
      //  next();
      //   return;
      //}
      console.log('Wellcom to demandes middlware');
      const authToken = req.headers['authtoken'] as string;
      const appcheckToken = req.headers['appchecktoken'] as string;
      const devicetoken = req.headers['devicetoken'] as string;
      const appversion = req.headers['appversion'] as string;
      //const { authorization, appversion, devicetoken } = req.headers;
      const paramsMap = await this.cacService.getParams();

      // Check auth token and extract UID

      if (authToken) {
        console.log("verfication de l'auth token");
        try {
          const decodedToken = await admin.auth().verifyIdToken(authToken);
          req.body.uid = decodedToken.uid;
        } catch (error) {
          return res.status(440).send({ message: error.message });
        }
      } else {
        console.log('Missing auth token');
        return res.status(441).send({ message: 'Missing auth token' });
      }

      // Check appcheck token
      if (appcheckToken) {
        console.log("verfication de l'appCheck token");
        try {
          await admin.appCheck().verifyToken(appcheckToken);
        } catch (error) {
          return res.status(450).send({ message: error.message });
        }
      } else {
        console.log('Missing appcheck token');
        return res.status(451).send({ message: 'Missing appcheck token' });
      }

      // Check app version
      const minVersion = Number(paramsMap.get('minVersion'));
      if (!isNaN(minVersion) && appversion && Number(appversion) < minVersion) {
        console.log('This version of the mobile application is obsolete.');
        return res
          .status(452)
          .send({ message: 'This version of the mobile application is obsolete.' });
      }

      if (!devicetoken) {
        return res.status(471).send({ message: 'Missing deviceToken' });
      }
      req.body.deviceToken = devicetoken;

      // Check device token
      const userDevices = await this.cacService.findDevicesByUid(req.body.uid);
      const device = userDevices.find((d) => d.deviceToken === devicetoken && d.actif);

      if (!device) {
        console.log('Invalid or inactive device');
        return res.status(483).send({ message: 'Invalid or inactive device' });
      }

      // Matching status
      if (device.matchingStatus !== 1) {
        console.log('Invalid matching status');
        return res.status(484).send({ message: 'Invalid matching status' });
      }

      next();
    } catch (error) {
      console.log('code : 491  message :', error.message);
      res.status(491).send({ message: error.message });
    }
  }
}
