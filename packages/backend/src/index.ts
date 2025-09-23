import { createServer } from 'http';
import { createApp } from './app.js';
import { logger } from './logger.js';

const port = Number(process.env.PORT) || 4000;

const app = createApp();
const server = createServer(app);

server.listen(port, () => {
  logger.info(`API listening on http://localhost:${port}`);
});
