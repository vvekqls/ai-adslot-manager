import { Recommendation } from '../types/recommendation.js';
import type { SlotMetricSummary } from '../services/metricsService.js';

export type AdSlotConfig = {
  id: string;
  name: string;
  placement: string;
  sizes: string[];
  prebidTimeoutMs: number;
  lazyLoad: boolean;
  order: number;
};

type RuleContext = {
  metrics: SlotMetricSummary[];
  adSlots: AdSlotConfig[];
};

type Rule = (context: RuleContext) => Recommendation[];

const reorderSlowSlotsRule: Rule = ({ metrics, adSlots }) => {
  const recommendations: Recommendation[] = [];
  const slowSlots = metrics.filter((metric) => metric.avgAdLoadTime > 2500);
  slowSlots.forEach((metric) => {
    const slot = adSlots.find((s) => s.id === metric.slotId);
    if (!slot) return;
    recommendations.push({
      slotId: slot.id,
      action: 'Reorder slot to prioritize faster creatives or move lower on the page.',
      rationale: `Average ad load time is ${metric.avgAdLoadTime.toFixed(
        0
      )}ms, which exceeds the 2500ms budget. Consider moving this slot lower in the waterfall.`,
      priority: metric.avgAdLoadTime > 4000 ? 'high' : 'medium'
    });
  });
  return recommendations;
};

const adjustTimeoutRule: Rule = ({ metrics, adSlots }) => {
  const recommendations: Recommendation[] = [];
  metrics
    .filter((metric) => metric.avgTimeoutRate > 0.2)
    .forEach((metric) => {
      const slot = adSlots.find((s) => s.id === metric.slotId);
      if (!slot) return;
      recommendations.push({
        slotId: slot.id,
        action: `Increase Prebid timeout by 200ms (current ${slot.prebidTimeoutMs}ms).`,
        rationale: `Timeout rate is ${(metric.avgTimeoutRate * 100).toFixed(
          1
        )}%, indicating bidders need more time.`,
        priority: 'high'
      });
    });
  return recommendations;
};

const lazyLoadRule: Rule = ({ metrics, adSlots }) => {
  const recommendations: Recommendation[] = [];
  metrics
    .filter((metric) => metric.avgViewability < 0.45)
    .forEach((metric) => {
      const slot = adSlots.find((s) => s.id === metric.slotId);
      if (!slot || slot.placement === 'aboveFold') return;
      if (!slot.lazyLoad) {
        recommendations.push({
          slotId: slot.id,
          action: 'Enable lazy loading below-the-fold to reduce wasted impressions.',
          rationale: `Viewability is ${(metric.avgViewability * 100).toFixed(
            1
          )}%. Lazy loading can improve engagement for lower placements.`,
          priority: 'medium'
        });
      }
    });
  return recommendations;
};

const clsRule: Rule = ({ metrics, adSlots }) => {
  const recommendations: Recommendation[] = [];
  metrics
    .filter((metric) => metric.avgCls > 0.1)
    .forEach((metric) => {
      const slot = adSlots.find((s) => s.id === metric.slotId);
      if (!slot) return;
      recommendations.push({
        slotId: slot.id,
        action: 'Audit creatives causing layout shifts and enforce fixed sizes.',
        rationale: `Cumulative layout shift average is ${metric.avgCls.toFixed(
          3
        )}, breaching the 0.1 threshold.`,
        priority: metric.avgCls > 0.2 ? 'high' : 'medium'
      });
    });
  return recommendations;
};

const defaultRules: Rule[] = [reorderSlowSlotsRule, adjustTimeoutRule, lazyLoadRule, clsRule];

export class RulesEngine {
  private rules: Rule[];

  constructor(rules: Rule[] = defaultRules) {
    this.rules = rules;
  }

  evaluate(context: RuleContext): Recommendation[] {
    return this.rules.flatMap((rule) => rule(context));
  }

  registerRule(rule: Rule) {
    this.rules.push(rule);
  }
}
