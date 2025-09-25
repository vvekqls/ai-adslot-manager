import { PrismaClient, Placement } from '@prisma/client';

/**
 * Seed script that populates the database with realistic ad slots, metrics, and
 * AI recommendations so the frontend and API can be exercised without manual
 * data entry. The dataset reflects common performance patterns we use in demos
 * and regression tests.
 */
const prisma = new PrismaClient();

const slotSeeds: Array<{
  name: string;
  placement: Placement;
  sizes: string[];
  prebidTimeoutMs: number;
  lazyLoad: boolean;
  order: number;
}> = [
  {
    name: 'Top Leaderboard',
    placement: Placement.aboveFold,
    sizes: ['970x250', '728x90'],
    prebidTimeoutMs: 1200,
    lazyLoad: false,
    order: 0
  },
  {
    name: 'In-Article Rectangle',
    placement: Placement.inline,
    sizes: ['300x250', '336x280'],
    prebidTimeoutMs: 1600,
    lazyLoad: false,
    order: 1
  },
  {
    name: 'Sticky Sidebar',
    placement: Placement.sidebar,
    sizes: ['300x600', '160x600'],
    prebidTimeoutMs: 1500,
    lazyLoad: true,
    order: 2
  },
  {
    name: 'Footer Banner',
    placement: Placement.footer,
    sizes: ['970x250', '320x100'],
    prebidTimeoutMs: 1200,
    lazyLoad: true,
    order: 3
  }
];

type MetricSeed = {
  slotName: string;
  cls: number;
  lcp: number;
  fid: number;
  tbt: number;
  adLoadTime: number;
  timeoutRate: number;
  viewability: number;
  daysAgo: number;
};

const metricSeeds: MetricSeed[] = [
  {
    slotName: 'Top Leaderboard',
    cls: 0.01,
    lcp: 2.1,
    fid: 12,
    tbt: 110,
    adLoadTime: 1.05,
    timeoutRate: 0.04,
    viewability: 0.9,
    daysAgo: 1
  },
  {
    slotName: 'Top Leaderboard',
    cls: 0.015,
    lcp: 2.3,
    fid: 18,
    tbt: 125,
    adLoadTime: 1.1,
    timeoutRate: 0.05,
    viewability: 0.87,
    daysAgo: 0
  },
  {
    slotName: 'In-Article Rectangle',
    cls: 0.03,
    lcp: 2.8,
    fid: 24,
    tbt: 150,
    adLoadTime: 1.45,
    timeoutRate: 0.08,
    viewability: 0.72,
    daysAgo: 1
  },
  {
    slotName: 'In-Article Rectangle',
    cls: 0.028,
    lcp: 3.1,
    fid: 28,
    tbt: 165,
    adLoadTime: 1.6,
    timeoutRate: 0.09,
    viewability: 0.7,
    daysAgo: 0
  },
  {
    slotName: 'Sticky Sidebar',
    cls: 0.022,
    lcp: 2.4,
    fid: 19,
    tbt: 135,
    adLoadTime: 1.2,
    timeoutRate: 0.1,
    viewability: 0.81,
    daysAgo: 2
  },
  {
    slotName: 'Sticky Sidebar',
    cls: 0.025,
    lcp: 2.5,
    fid: 20,
    tbt: 138,
    adLoadTime: 1.25,
    timeoutRate: 0.12,
    viewability: 0.79,
    daysAgo: 0
  },
  {
    slotName: 'Footer Banner',
    cls: 0.012,
    lcp: 2.6,
    fid: 16,
    tbt: 118,
    adLoadTime: 1.15,
    timeoutRate: 0.06,
    viewability: 0.66,
    daysAgo: 1
  },
  {
    slotName: 'Footer Banner',
    cls: 0.011,
    lcp: 2.4,
    fid: 14,
    tbt: 112,
    adLoadTime: 1.1,
    timeoutRate: 0.05,
    viewability: 0.68,
    daysAgo: 0
  }
];

type RecommendationSeed = {
  slotName: string;
  action: string;
  rationale: string;
  priority: 'low' | 'medium' | 'high';
};

const recommendationSeeds: RecommendationSeed[] = [
  {
    slotName: 'In-Article Rectangle',
    action: 'Reorder slot below Top Leaderboard on long-form articles',
    rationale:
      'Average LCP is 3.0s and timeout rate is above 8%, indicating heavy creatives that should not block primary content.',
    priority: 'high'
  },
  {
    slotName: 'Sticky Sidebar',
    action: 'Increase Prebid timeout to 1800ms for sidebar inventory',
    rationale:
      'Timeout rate sits at 12% while viewability remains strong; extending the auction window should improve bid density.',
    priority: 'medium'
  },
  {
    slotName: 'Footer Banner',
    action: 'Enable more aggressive lazy loading',
    rationale: 'Viewability is under 70% with solid CLS; defer loading until the slot nears the viewport to save bandwidth.',
    priority: 'low'
  }
];

const daysAgoToDate = (daysAgo: number) => {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return date;
};

async function main() {
  console.info('Resetting database and loading demo fixtures...');

  await prisma.recommendation.deleteMany();
  await prisma.metric.deleteMany();
  await prisma.adSlot.deleteMany();

  const slotMap = new Map<string, { id: string }>();

  for (const slot of slotSeeds) {
    const created = await prisma.adSlot.create({ data: slot });
    slotMap.set(slot.name, created);
  }

  for (const metric of metricSeeds) {
    const slot = slotMap.get(metric.slotName);
    if (!slot) {
      continue;
    }

    await prisma.metric.create({
      data: {
        slotId: slot.id,
        cls: metric.cls,
        lcp: metric.lcp,
        fid: metric.fid,
        tbt: metric.tbt,
        adLoadTime: metric.adLoadTime,
        timeoutRate: metric.timeoutRate,
        viewability: metric.viewability,
        timestamp: daysAgoToDate(metric.daysAgo)
      }
    });
  }

  for (const recommendation of recommendationSeeds) {
    const slot = slotMap.get(recommendation.slotName);
    if (!slot) {
      continue;
    }

    await prisma.recommendation.create({
      data: {
        slotId: slot.id,
        action: recommendation.action,
        rationale: recommendation.rationale,
        priority: recommendation.priority
      }
    });
  }

  console.info(
    `Seed complete: ${slotMap.size} ad slots, ${metricSeeds.length} metrics, ${recommendationSeeds.length} recommendations.`
  );
}

main()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
