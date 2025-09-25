import type { Recommendation } from '@/lib/api';
import { Badge } from './ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';

const priorityVariant: Record<Recommendation['priority'], 'default' | 'secondary' | 'destructive'> = {
  low: 'secondary',
  medium: 'default',
  high: 'destructive'
};

type RecommendationListProps = {
  recommendations: Recommendation[];
};

export const RecommendationList = ({ recommendations }: RecommendationListProps) => {
  if (!recommendations.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>No AI recommendations yet</CardTitle>
          <CardDescription>
            Trigger the rules engine to evaluate current performance and produce suggestions.
          </CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {recommendations.map((recommendation, index) => (
        <Card key={`${recommendation.slotId}-${index}`}>
          <CardHeader className="flex flex-row items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-base">Slot {recommendation.slotId}</CardTitle>
                {recommendation.origin === 'sandbox' && (
                  <Badge variant="outline" className="uppercase tracking-wide">
                    Sandbox
                  </Badge>
                )}
              </div>
              <CardDescription>{recommendation.rationale}</CardDescription>
            </div>
            <Badge variant={priorityVariant[recommendation.priority]}>{recommendation.priority}</Badge>
          </CardHeader>
          <CardContent className="text-sm text-slate-700">{recommendation.action}</CardContent>
        </Card>
      ))}
    </div>
  );
};
