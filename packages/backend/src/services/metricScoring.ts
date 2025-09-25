import { SlotMetricSummary } from '../types/metrics.js';

type ScoreInput = Pick<
  SlotMetricSummary,
  'avgAdLoadTime' | 'avgCls' | 'avgTimeoutRate' | 'avgViewability' | 'avgTbt'
>;

const clamp = (value: number, min: number, max: number) => {
  return Math.min(max, Math.max(min, value));
};

export const computePerformanceScore = ({
  avgAdLoadTime,
  avgCls,
  avgTimeoutRate,
  avgViewability,
  avgTbt
}: ScoreInput) => {
  const loadScore = (1 - clamp(avgAdLoadTime / 4000, 0, 1)) * 30;
  const clsScore = (1 - clamp(avgCls / 0.25, 0, 1)) * 20;
  const timeoutScore = (1 - clamp(avgTimeoutRate, 0, 1)) * 20;
  const viewabilityScore = clamp(avgViewability, 0, 1) * 30;
  const tbtScore = (1 - clamp(avgTbt / 600, 0, 1)) * 10;

  const score = loadScore + clsScore + timeoutScore + viewabilityScore + tbtScore;
  return Math.round(score);
};
