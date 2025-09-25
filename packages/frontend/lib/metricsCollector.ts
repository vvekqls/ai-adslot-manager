'use client';

import { onCLS, onFID, onLCP } from 'web-vitals';
import type { MetricPayload } from './api';

type Collector = {
  report: (payload: { timedOut: boolean; viewableRatio: number }) => void;
  attachViewabilityObserver: (element: HTMLElement) => () => void;
};

export const createMetricsCollector = (
  slotId: string,
  onSubmit: (payload: MetricPayload) => void
): Collector => {
  const metrics: MetricPayload = {
    slotId,
    cls: 0,
    lcp: 0,
    fid: 0,
    tbt: 0,
    adLoadTime: 0,
    timeoutRate: 0,
    viewability: 0
  };

  let longTaskObserver: PerformanceObserver | null = null;
  let viewabilityObserver: IntersectionObserver | null = null;
  let viewableRatio = 0;
  const navigationStart = performance.now();

  onCLS((entry) => {
    metrics.cls = Number(entry.value.toFixed(3));
  });

  onLCP((entry) => {
    metrics.lcp = Number(entry.value);
  });

  onFID((entry) => {
    metrics.fid = Number(entry.value);
  });

  if ('PerformanceObserver' in window) {
    longTaskObserver = new PerformanceObserver((list) => {
      const longTasks = list.getEntries();
      const totalBlockingTime = longTasks.reduce((acc, task) => acc + (task.duration - 50), 0);
      metrics.tbt = Number(totalBlockingTime > 0 ? totalBlockingTime.toFixed(2) : 0);
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
    metrics.adLoadTime = Number((performance.now() - navigationStart).toFixed(2));
    metrics.timeoutRate = timedOut ? 1 : 0;
    metrics.viewability = Number(Math.max(viewableRatio, ratio).toFixed(2));
    metrics.timestamp = new Date().toISOString();

    cleanup();
    onSubmit(metrics);
  };

  return { report, attachViewabilityObserver };
};
