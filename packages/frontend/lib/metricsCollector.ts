'use client';

import { onCLS, onFID, onLCP } from 'web-vitals';
import type { AdSlotConfig, MetricPayload } from './api';

type Collector = {
  report: (payload: { timedOut: boolean; viewableRatio: number }) => void;
  attachViewabilityObserver: (element: HTMLElement) => () => void;
};

export const createMetricsCollector = (
  slot: AdSlotConfig,
  onSubmit: (payload: MetricPayload) => void
): Collector => {
  let cls = 0;
  let lcp = 0;
  let fid = 0;
  let tbt = 0;

  let longTaskObserver: PerformanceObserver | null = null;
  let viewabilityObserver: IntersectionObserver | null = null;
  let viewableRatio = 0;
  const navigationStart = performance.now();

  onCLS((entry) => {
    cls = Number(entry.value.toFixed(3));
  });

  onLCP((entry) => {
    lcp = Number(entry.value);
  });

  onFID((entry) => {
    fid = Number(entry.value);
  });

  if ('PerformanceObserver' in window) {
    longTaskObserver = new PerformanceObserver((list) => {
      const longTasks = list.getEntries();
      const totalBlockingTime = longTasks.reduce((acc, task) => acc + (task.duration - 50), 0);
      tbt = Number(totalBlockingTime > 0 ? totalBlockingTime.toFixed(2) : 0);
    });

    try {
      longTaskObserver.observe({ entryTypes: ['longtask'] as PerformanceEntryType[] });
    } catch (error) {
      console.warn('Unable to observe long tasks', error);
    }
  }

  const cleanup = () => {
    longTaskObserver?.disconnect();
    viewabilityObserver?.disconnect();
  };

  const attachViewabilityObserver = (element: HTMLElement) => {
    if (!('IntersectionObserver' in window)) {
      return () => undefined;
    }

    viewabilityObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        viewableRatio = Math.max(viewableRatio, entry.intersectionRatio);
      });
    }, {
      threshold: [0, 0.25, 0.5, 0.75, 1]
    });

    viewabilityObserver.observe(element);
    return () => viewabilityObserver?.disconnect();
  };

  const report = ({ timedOut, viewableRatio: ratio }: { timedOut: boolean; viewableRatio: number }) => {
    const payload: MetricPayload = {
      slotId: slot.id,
      cls,
      lcp,
      fid,
      tbt,
      adLoadTime: Number((performance.now() - navigationStart).toFixed(2)),
      timeoutRate: timedOut ? 1 : 0,
      viewability: Number(Math.max(viewableRatio, ratio).toFixed(2)),
      timestamp: new Date().toISOString()
    };

    if (slot.id.startsWith('sandbox-')) {
      payload.sandboxConfig = {
        name: slot.name,
        placement: slot.placement,
        sizes: slot.sizes,
        prebidTimeoutMs: slot.prebidTimeoutMs,
        lazyLoad: slot.lazyLoad,
        order: slot.order
      };
    }

    cleanup();
    onSubmit(payload);
  };

  return { report, attachViewabilityObserver };
};
