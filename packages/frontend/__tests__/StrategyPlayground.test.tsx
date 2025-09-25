import { fireEvent, render, screen } from '@testing-library/react';
import { StrategyPlayground } from '@/components/StrategyPlayground';
import type { SlotSummary } from '@/lib/api';

const summaries: SlotSummary[] = [
  {
    slotId: 'hero-top',
    avgCls: 0.02,
    avgLcp: 2200,
    avgFid: 12,
    avgTbt: 80,
    avgAdLoadTime: 1500,
    avgTimeoutRate: 0.18,
    avgViewability: 0.72,
    samples: 42
  },
  {
    slotId: 'inline-mid',
    avgCls: 0.05,
    avgLcp: 2600,
    avgFid: 18,
    avgTbt: 110,
    avgAdLoadTime: 1900,
    avgTimeoutRate: 0.3,
    avgViewability: 0.54,
    samples: 37
  }
];

describe('StrategyPlayground', () => {
  it('renders projected insights based on defaults', () => {
    render(<StrategyPlayground summaries={summaries} />);

    const insights = screen.getByTestId('projected-insights');
    expect(insights.textContent).toContain('hero-top');
  });

  it('updates insights when lazy loading is disabled', () => {
    render(<StrategyPlayground summaries={summaries} />);

    fireEvent.click(screen.getByRole('button', { name: /Disabled/i }));

    const insights = screen.getByTestId('projected-insights');
    expect(insights.textContent).toMatch(/Disabling lazy loading/i);
  });

  it('updates timeout messaging when slider is adjusted', () => {
    render(<StrategyPlayground summaries={summaries} />);

    fireEvent.change(screen.getByLabelText(/Prebid timeout/i), { target: { value: '2200' } });

    const insights = screen.getByTestId('projected-insights');
    expect(insights.textContent).toMatch(/may be too generous/i);
  });
});
