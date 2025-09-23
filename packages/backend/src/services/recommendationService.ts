import { prisma } from '../prismaClient.js';
import { RulesEngine } from '../rulesEngine/index.js';
import type { Recommendation } from '../types/recommendation.js';
import { getSlotMetricsSummary } from './metricsService.js';
import { listAdSlots } from './adSlotService.js';

const engine = new RulesEngine();

export const generateRecommendations = async (): Promise<Recommendation[]> => {
  const [metrics, adSlots] = await Promise.all([getSlotMetricsSummary(), listAdSlots()]);
  const recommendations = engine.evaluate({
    metrics,
    adSlots: adSlots.map((slot) => ({
      id: slot.id,
      name: slot.name,
      placement: slot.placement,
      sizes: slot.sizes,
      prebidTimeoutMs: slot.prebidTimeoutMs,
      lazyLoad: slot.lazyLoad,
      order: slot.order
    }))
  });

  await prisma.$transaction([
    prisma.recommendation.deleteMany({}),
    ...recommendations.map((rec) =>
      prisma.recommendation.create({
        data: {
          slotId: rec.slotId,
          action: rec.action,
          rationale: rec.rationale,
          priority: rec.priority
        }
      })
    )
  ]);

  return recommendations;
};

export const listRecommendations = () =>
  prisma.recommendation.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });
