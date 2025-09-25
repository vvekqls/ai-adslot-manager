'use client';

import { useEffect, useMemo, useState } from 'react';
import type { SlotSummary } from '@/lib/api';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

type StrategyPlaygroundProps = {
  summaries: SlotSummary[];
};

export const StrategyPlayground = ({ summaries }: StrategyPlaygroundProps) => {
  const [prebidTimeout, setPrebidTimeout] = useState(1200);
  const [lazyLoading, setLazyLoading] = useState(true);
  const [focusSlot, setFocusSlot] = useState<string>('');

  useEffect(() => {
    if (summaries.length && !focusSlot) {
      setFocusSlot(summaries[0].slotId);
    }
  }, [summaries, focusSlot]);

  const slowestSlot = useMemo(() => {
    if (!summaries.length) {
      return null;
    }

    return summaries.reduce((slowest, current) => {
      if (!slowest) {
        return current;
      }

      return current.avgAdLoadTime > slowest.avgAdLoadTime ? current : slowest;
    }, summaries[0]);
  }, [summaries]);

  const { projectedOrder, scores } = useMemo(() => {
    const orderSource = [...summaries];

    const slotScores = orderSource.reduce<Record<string, number>>((acc, slot) => {
      const viewabilityScore = slot.avgViewability * 120;
      const latencyRelief = Math.max(0, 1 - slot.avgAdLoadTime / (prebidTimeout + 500)) * 40;
      const clsPenalty = slot.avgCls * 80;
      const timeoutDrag = slot.avgTimeoutRate > 0.25 ? (slot.avgTimeoutRate - 0.25) * (prebidTimeout > 1500 ? 10 : 20) : 0;
      const lazyLoadBonus = lazyLoading ? (slot.avgViewability > 0.6 ? 10 : 6) : slot.avgViewability < 0.5 ? -8 : 4;
      const focusBoost = slot.slotId === focusSlot ? 12 : 0;

      const score = viewabilityScore + latencyRelief + lazyLoadBonus + focusBoost - clsPenalty - timeoutDrag;
      acc[slot.slotId] = Math.round(score * 10) / 10;
      return acc;
    }, {});

    const ordered = orderSource
      .sort((a, b) => {
        return (slotScores[b.slotId] ?? 0) - (slotScores[a.slotId] ?? 0);
      })
      .map((slot) => slot.slotId);

    return { projectedOrder: ordered, scores: slotScores };
  }, [summaries, prebidTimeout, lazyLoading, focusSlot]);

  const insights = useMemo(() => {
    if (!slowestSlot) {
      return ['Load the page and record telemetry to explore optimization scenarios.'];
    }

    const items: string[] = [];
    const latencyDelta = slowestSlot.avgAdLoadTime - prebidTimeout;

    if (latencyDelta > 200) {
      items.push(
        `Raising Prebid timeout to ${prebidTimeout}ms should recover roughly ${Math.min(25, Math.round(latencyDelta / 20))}% of bids for ${slowestSlot.slotId}.`
      );
    } else if (latencyDelta < -250) {
      items.push(
        `Timeout at ${prebidTimeout}ms may be too generous—consider trimming ${Math.abs(Math.round(latencyDelta / 20)) * 20}ms to tighten UX.`
      );
    } else {
      items.push(`Timeout of ${prebidTimeout}ms tracks with ${slowestSlot.slotId}'s load pattern, balancing UX and yield.`);
    }

    if (lazyLoading) {
      items.push(`Lazy loading stays enabled, protecting CLS (~${slowestSlot.avgCls.toFixed(2)}) while focusing above-the-fold viewability.`);
    } else {
      items.push(`Disabling lazy loading may lift impressions; monitor CLS around ${slowestSlot.avgCls.toFixed(2)} for volatility.`);
    }

    if (focusSlot) {
      const focusSummary = summaries.find((summary) => summary.slotId === focusSlot);
      if (focusSummary) {
        const projectedLift = Math.max(2, Math.round((1 - focusSummary.avgViewability) * 30));
        items.push(`Boosting ${focusSlot} is projected to lift viewability by ~${projectedLift}% once fresh creatives cycle in.`);
      }
    }

    return items;
  }, [slowestSlot, prebidTimeout, lazyLoading, focusSlot, summaries]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Strategy playground</CardTitle>
        <CardDescription>
          Adjust the levers below to simulate how operational tweaks could influence recommendations before shipping
          them to production.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm font-medium text-slate-700">
            <label htmlFor="prebid-timeout">Prebid timeout</label>
            <span>{prebidTimeout}ms</span>
          </div>
          <input
            id="prebid-timeout"
            type="range"
            min={400}
            max={2500}
            step={50}
            value={prebidTimeout}
            onChange={(event) => setPrebidTimeout(Number(event.target.value))}
            className="w-full accent-emerald-500"
          />
          <p className="text-xs text-slate-500">
            Extend the timeout when you see elevated timeout rate; pull it back when load times spike.
          </p>
        </div>

        <div className="space-y-2">
          <span className="text-sm font-medium text-slate-700">Below-the-fold lazy loading</span>
          <div className="flex gap-2">
            <Button
              type="button"
              variant={lazyLoading ? 'default' : 'outline'}
              aria-pressed={lazyLoading}
              onClick={() => setLazyLoading(true)}
            >
              Enabled
            </Button>
            <Button
              type="button"
              variant={!lazyLoading ? 'default' : 'outline'}
              aria-pressed={!lazyLoading}
              onClick={() => setLazyLoading(false)}
            >
              Disabled
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Toggle to see how relaxing lazy loading impacts CLS and the projected slot stack ordering.
          </p>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-slate-700" htmlFor="focus-slot">
            Boost a slot for creative testing
          </label>
          <select
            id="focus-slot"
            value={focusSlot}
            onChange={(event) => setFocusSlot(event.target.value)}
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            {summaries.map((summary) => (
              <option key={summary.slotId} value={summary.slotId}>
                {summary.slotId}
              </option>
            ))}
          </select>
          <p className="text-xs text-slate-500">Elevate a slot to preview how prioritisation reshuffles the waterfall.</p>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-800">Projected insights</h4>
          <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600" data-testid="projected-insights">
            {insights.map((insight) => (
              <li key={insight}>{insight}</li>
            ))}
          </ul>
        </div>

        <div className="space-y-3">
          <h4 className="text-sm font-semibold text-slate-800">Projected priority order</h4>
          <ol className="list-decimal space-y-2 pl-5 text-sm text-slate-700" data-testid="projected-order">
            {projectedOrder.map((slotId) => (
              <li key={slotId} className="flex items-center justify-between gap-4">
                <span className="font-medium">{slotId}</span>
                <span className="text-xs text-slate-500">
                  {focusSlot === slotId ? 'Boosted for creative testing' : `Score ${scores[slotId]?.toFixed(1) ?? '—'}`}
                </span>
              </li>
            ))}
          </ol>
        </div>
      </CardContent>
    </Card>
  );
};
