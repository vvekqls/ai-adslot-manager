import { render, screen } from '@testing-library/react';
import { SlotMetricsGrid } from '@/components/SlotMetricsGrid';
import type { SlotSummary } from '@/lib/api';

describe('SlotMetricsGrid', () => {
  it('renders fallback when no metrics are available', () => {
    render(<SlotMetricsGrid summaries={[]} />);
    expect(screen.getByText(/Awaiting metrics/i)).toBeInTheDocument();
  });

  it('renders metrics for each slot', () => {
    const summaries: SlotSummary[] = [
      {
        slotId: 'slot-123',
        avgCls: 0.02,
        avgLcp: 1800,
        avgFid: 12,
        avgTbt: 60,
        avgAdLoadTime: 1500,
        avgTimeoutRate: 0.03,
        avgViewability: 0.7,
        samples: 4,
        origin: 'catalog',
        performanceScore: 88
      }
    ];

    render(<SlotMetricsGrid summaries={summaries} />);

    expect(screen.getByText(/slot-123/i)).toBeInTheDocument();
    expect(screen.getByText(/1500 ms/i)).toBeInTheDocument();
    expect(screen.getByText(/70%/i)).toBeInTheDocument();
    expect(screen.getByText(/Score 88/i)).toBeInTheDocument();
  });

  it('highlights sandbox summaries', () => {
    const summaries: SlotSummary[] = [
      {
        slotId: 'sandbox-demo',
        avgCls: 0.05,
        avgLcp: 2300,
        avgFid: 14,
        avgTbt: 90,
        avgAdLoadTime: 1800,
        avgTimeoutRate: 0.25,
        avgViewability: 0.62,
        samples: 3,
        origin: 'sandbox',
        performanceScore: 72
      }
    ];

    render(<SlotMetricsGrid summaries={summaries} />);

    expect(screen.getByText(/sandbox-demo/i)).toBeInTheDocument();
    expect(screen.getByText(/Sandbox/i)).toBeInTheDocument();
  });
});
