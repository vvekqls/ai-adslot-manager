import { Router } from 'express';
import { generateRecommendations, listRecommendations } from '../services/recommendationService.js';

export const aiRouter = Router();

aiRouter.post('/recommend', async (_req, res) => {
  const recommendations = await generateRecommendations();
  res.json({ recommendations });
});

aiRouter.get('/recommend', async (req, res) => {
  const refreshParam = req.query.refresh;
  const shouldRefresh =
    refreshParam === 'true' ||
    refreshParam === '1' ||
    (Array.isArray(refreshParam) && refreshParam.some((value) => value === 'true' || value === '1'));

  if (shouldRefresh) {
    const recommendations = await generateRecommendations();
    return res.json({ recommendations });
  }

  const recommendations = await listRecommendations();

  if (recommendations.length === 0) {
    const regenerated = await generateRecommendations();
    return res.json({ recommendations: regenerated });
  }

  res.json({ recommendations });
});
