import { render, screen } from '@testing-library/react';
import { RecommendationList } from '@/components/RecommendationList';
import type { Recommendation } from '@/lib/api';

describe('RecommendationList', () => {
  it('renders empty state when there are no recommendations', () => {
    render(<RecommendationList recommendations={[]} />);
    expect(screen.getByText(/No AI recommendations/i)).toBeInTheDocument();
  });

  it('renders recommendation cards', () => {
    const recommendations: Recommendation[] = [
      {
        slotId: 'slot-1',
        action: 'Increase timeout by 200ms.',
        rationale: 'Timeout rate at 30% exceeds threshold.',
        priority: 'high'
      }
    ];

    render(<RecommendationList recommendations={recommendations} />);

    expect(screen.getByText(/slot-1/i)).toBeInTheDocument();
    expect(screen.getByText(/Increase timeout/i)).toBeInTheDocument();
  });
});
