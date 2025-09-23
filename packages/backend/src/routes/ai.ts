import { Router } from 'express';
import { generateRecommendations, listRecommendations } from '../services/recommendationService.js';

export const aiRouter = Router();

aiRouter.post('/recommend', async (_req, res) => {
  const recommendations = await generateRecommendations();
  res.json({ recommendations });
});

aiRouter.get('/recommend', async (_req, res) => {
  const recommendations = await listRecommendations();
  res.json({ recommendations });
});
