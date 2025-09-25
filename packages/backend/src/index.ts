import { createServer } from 'http';
import { createApp } from './app.js';
import { logger } from './logger.js';
import { generateRecommendations } from './services/recommendationService.js';

const port = Number(process.env.PORT) || 4000;

const app = createApp();
const server = createServer(app);

server.listen(port, async () => {
  logger.info(`API listening on http://localhost:${port}`);

  try {
    const recommendations = await generateRecommendations();
    logger.info(`Precomputed ${recommendations.length} AI recommendations on startup.`);
  } catch (error) {
    logger.error(`Failed to prime AI recommendations: ${(error as Error).message}`);
  }
});
