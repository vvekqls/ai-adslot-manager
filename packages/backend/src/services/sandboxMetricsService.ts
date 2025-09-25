import { MetricPayload, SlotMetricSummary } from '../types/metrics.js';
import { computePerformanceScore } from './metricScoring.js';

type SandboxAccumulator = {
  totalCls: number;
  totalLcp: number;
  totalFid: number;
  totalTbt: number;
  totalAdLoadTime: number;
  totalTimeoutRate: number;
  totalViewability: number;
  samples: number;
};

const sandboxMetrics = new Map<string, SandboxAccumulator>();

const toSummary = (slotId: string, aggregate: SandboxAccumulator): SlotMetricSummary => {
  const summary: SlotMetricSummary = {
    slotId,
    avgCls: aggregate.samples ? aggregate.totalCls / aggregate.samples : 0,
    avgLcp: aggregate.samples ? aggregate.totalLcp / aggregate.samples : 0,
    avgFid: aggregate.samples ? aggregate.totalFid / aggregate.samples : 0,
    avgTbt: aggregate.samples ? aggregate.totalTbt / aggregate.samples : 0,
    avgAdLoadTime: aggregate.samples ? aggregate.totalAdLoadTime / aggregate.samples : 0,
    avgTimeoutRate: aggregate.samples ? aggregate.totalTimeoutRate / aggregate.samples : 0,
    avgViewability: aggregate.samples ? aggregate.totalViewability / aggregate.samples : 0,
    samples: aggregate.samples,
    origin: 'sandbox',
    performanceScore: 0
  };

  summary.performanceScore = computePerformanceScore(summary);
  return summary;
};

export const ingestSandboxMetric = (payload: MetricPayload): SlotMetricSummary => {
  const current = sandboxMetrics.get(payload.slotId) ?? {
    totalCls: 0,
    totalLcp: 0,
    totalFid: 0,
    totalTbt: 0,
    totalAdLoadTime: 0,
    totalTimeoutRate: 0,
    totalViewability: 0,
    samples: 0
  };

  current.totalCls += payload.cls;
  current.totalLcp += payload.lcp;
  current.totalFid += payload.fid;
  current.totalTbt += payload.tbt;
  current.totalAdLoadTime += payload.adLoadTime;
  current.totalTimeoutRate += payload.timeoutRate;
  current.totalViewability += payload.viewability;
  current.samples += 1;

  sandboxMetrics.set(payload.slotId, current);
  return toSummary(payload.slotId, current);
};

export const getSandboxSummaries = (): SlotMetricSummary[] => {
  return Array.from(sandboxMetrics.entries()).map(([slotId, aggregate]) => toSummary(slotId, aggregate));
};

export const resetSandboxMetrics = () => {
  sandboxMetrics.clear();
};
