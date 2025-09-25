import { prisma } from '../prismaClient.js';
import { RulesEngine } from '../rulesEngine/index.js';
import type { Recommendation } from '../types/recommendation.js';
import { getSlotMetricsSummary } from './metricsService.js';
import { listAdSlots } from './adSlotService.js';
import { getSandboxAdSlots } from './sandboxMetricsService.js';

const engine = new RulesEngine();

export type RecommendationWithOrigin = Recommendation & { origin: 'catalog' | 'sandbox' };

let sandboxRecommendationCache: RecommendationWithOrigin[] = [];

export const generateRecommendations = async (): Promise<RecommendationWithOrigin[]> => {
  const [metrics, adSlots, sandboxSlots] = await Promise.all([
    getSlotMetricsSummary(),
    listAdSlots(),
    Promise.resolve(getSandboxAdSlots())
  ]);

  const catalogSlots = adSlots.map((slot) => ({
    id: slot.id,
    name: slot.name,
    placement: slot.placement,
    sizes: slot.sizes,
    prebidTimeoutMs: slot.prebidTimeoutMs,
    lazyLoad: slot.lazyLoad,
    order: slot.order
  }));

  const sandboxForEngine = sandboxSlots.map((slot) => ({
    id: slot.id,
    name: slot.name,
    placement: slot.placement,
    sizes: slot.sizes.map((size) => `${size.width}x${size.height}`),
    prebidTimeoutMs: slot.prebidTimeoutMs,
    lazyLoad: slot.lazyLoad,
    order: slot.order
  }));

  const recommendations = engine.evaluate({
    metrics,
    adSlots: [...catalogSlots, ...sandboxForEngine]
  });

  const catalogSlotIds = new Set(catalogSlots.map((slot) => slot.id));

  const catalogRecommendations = recommendations.filter((rec) => catalogSlotIds.has(rec.slotId));
  const sandboxRecommendations = recommendations.filter((rec) => !catalogSlotIds.has(rec.slotId));

  await prisma.$transaction([
    prisma.recommendation.deleteMany({}),
    ...catalogRecommendations.map((rec) =>
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

  sandboxRecommendationCache = sandboxRecommendations.map((rec) => ({ ...rec, origin: 'sandbox' as const }));

  return [
    ...catalogRecommendations.map((rec) => ({ ...rec, origin: 'catalog' as const })),
    ...sandboxRecommendationCache
  ];
};

export const listRecommendations = async (): Promise<RecommendationWithOrigin[]> => {
  const stored = await prisma.recommendation.findMany({ orderBy: { createdAt: 'desc' }, take: 50 });

  const catalog = stored.map((rec) => ({
    slotId: rec.slotId,
    action: rec.action,
    rationale: rec.rationale,
    priority: rec.priority as Recommendation['priority'],
    origin: 'catalog' as const
  }));

  return [...catalog, ...sandboxRecommendationCache];
};
