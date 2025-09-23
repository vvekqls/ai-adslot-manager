import { MetricPayload } from '../types/metrics.js';
import { prisma } from '../prismaClient.js';

export type SlotMetricSummary = {
  slotId: string;
  avgCls: number;
  avgLcp: number;
  avgFid: number;
  avgTbt: number;
  avgAdLoadTime: number;
  avgTimeoutRate: number;
  avgViewability: number;
  samples: number;
};

export const recordMetric = async (payload: MetricPayload) => {
  const metric = await prisma.metric.create({
    data: {
      slotId: payload.slotId,
      cls: payload.cls,
      lcp: payload.lcp,
      fid: payload.fid,
      tbt: payload.tbt,
      adLoadTime: payload.adLoadTime,
      timeoutRate: payload.timeoutRate,
      viewability: payload.viewability,
      timestamp: payload.timestamp ?? new Date()
    }
  });

  return metric;
};

export const getSlotMetricsSummary = async (): Promise<SlotMetricSummary[]> => {
  const metrics = await prisma.metric.groupBy({
    by: ['slotId'],
    _avg: {
      cls: true,
      lcp: true,
      fid: true,
      tbt: true,
      adLoadTime: true,
      timeoutRate: true,
      viewability: true
    },
    _count: {
      slotId: true
    }
  });

  return metrics.map((metric) => ({
    slotId: metric.slotId,
    avgCls: metric._avg.cls ?? 0,
    avgLcp: metric._avg.lcp ?? 0,
    avgFid: metric._avg.fid ?? 0,
    avgTbt: metric._avg.tbt ?? 0,
    avgAdLoadTime: metric._avg.adLoadTime ?? 0,
    avgTimeoutRate: metric._avg.timeoutRate ?? 0,
    avgViewability: metric._avg.viewability ?? 0,
    samples: metric._count.slotId
  }));
};
