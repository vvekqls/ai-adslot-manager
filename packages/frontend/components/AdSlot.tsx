'use client';

import { useEffect, useRef, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { submitMetrics } from '@/lib/api';
import { createMetricsCollector } from '@/lib/metricsCollector';
import type { AdSlotConfig } from '@/store/useAdStore';
import { cn } from '@/lib/utils';

declare global {
  interface Window {
    pbjs?: any;
  }
}

type AdSlotProps = {
  config: AdSlotConfig;
};

export const AdSlot = ({ config }: AdSlotProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [status, setStatus] = useState<'loading' | 'rendered' | 'fallback'>('loading');

  const mutation = useMutation({
    mutationFn: submitMetrics
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let isCancelled = false;
    const collector = createMetricsCollector(config.id, (payload) => {
      mutation.mutate(payload);
    });
    const detachViewability = collector.attachViewabilityObserver(container);

    const addUnit = () => {
      const pbjs = window.pbjs;
      if (!pbjs || !pbjs.requestBids) {
        if (!isCancelled) {
          setTimeout(addUnit, 120);
        }
        return;
      }

      const mediaTypes = {
        banner: {
          sizes: config.sizes.map((size) => [size.width, size.height])
        }
      };

      pbjs.addAdUnits([
        {
          code: config.id,
          mediaTypes,
          bids: [
            {
              bidder: 'aiMockBidder',
              params: {
                placement: config.placement,
                floor: 0.3
              }
            }
          ]
        }
      ]);

      pbjs.requestBids({
        timeout: config.prebidTimeoutMs,
        bidsBackHandler: (responses: any[]) => {
          if (isCancelled) return;
          const response = responses.find((bid) => bid.adUnitCode === config.id);
          const hasCreative = response && response.creative;

          if (hasCreative) {
            container.innerHTML = response.creative;
            setStatus('rendered');
          } else {
            setStatus('fallback');
            container.innerHTML =
              '<div style="display:flex;align-items:center;justify-content:center;height:100%;background:#e2e8f0;color:#1e293b;font-family:Inter,sans-serif;font-size:14px">Sponsored content unavailable</div>';
          }

          collector.report({ timedOut: !hasCreative || response?.timeout, viewableRatio: 0 });
          pbjs.removeAdUnit(config.id);
        }
      });
    };

    addUnit();

    return () => {
      isCancelled = true;
      detachViewability();
      const pbjs = window.pbjs;
      try {
        pbjs?.removeAdUnit?.(config.id);
      } catch (error) {
        console.warn('Failed to cleanup ad unit', error);
      }
      if (container) {
        container.innerHTML = '';
      }
    };
  }, [config, mutation]);

  const largestSize = config.sizes.reduce(
    (acc, size) => {
      return size.height > acc.height ? size : acc;
    },
    { width: 0, height: 0 }
  );

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{config.name}</p>
      <div
        ref={containerRef}
        className={cn(
          'w-full overflow-hidden rounded-lg border border-slate-200 bg-white transition-all duration-300',
          status === 'loading' ? 'animate-pulse bg-slate-100' : '',
          status === 'fallback' ? 'ring-2 ring-amber-400' : ''
        )}
        style={{ minHeight: largestSize.height, minWidth: largestSize.width }}
      >
        {status === 'loading' && (
          <div className="flex h-full w-full items-center justify-center p-6 text-sm text-slate-500">
            Loading optimal ad experience...
          </div>
        )}
      </div>
    </div>
  );
};
