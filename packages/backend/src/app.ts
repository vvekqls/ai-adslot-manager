import 'express-async-errors';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { json } from 'express';
import { router } from './routes/index.js';
import { logger } from './logger.js';

export const createApp = () => {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
      credentials: true
    })
  );
  app.use(morgan('combined'));
  app.use(json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/', router);

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
    logger.error(err.message);
    res.status(500).json({ message: 'Internal server error' });
  });

  return app;
};
