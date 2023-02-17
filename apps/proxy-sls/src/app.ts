import { getInfoController } from '@controllers/getInfo';
import { bedkingdomStgProxy } from '@middlewares/bedkingdom-stg-proxy.middleware';
import { errorHandler } from '@middlewares/handle-error';
import compression from 'compression';
import cors from 'cors';
import type { Express } from 'express';
import express from 'express';

const app: Express = express();

/* ____________________MIDDLEWARES____________________ */
app.use(compression()); // compresses requests
app.use('*', cors());
app.use('*', bedkingdomStgProxy);
app.use(errorHandler);

/* ____________________CONTROLLERS____________________ */
app.get('/getinfo', getInfoController);

export default app;
