'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { fetchRecommendations, fetchSummaries, triggerRecommendations } from '@/lib/api';
import { SlotMetricsGrid } from '@/components/SlotMetricsGrid';
import { RecommendationList } from '@/components/RecommendationList';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function DashboardPage() {
  const queryClient = useQueryClient();

  const { data: summaries = [], isLoading: summariesLoading } = useQuery({
    queryKey: ['summaries'],
    queryFn: fetchSummaries,
    refetchInterval: 60_000
  });

  const { data: recommendations = [], isLoading: recsLoading } = useQuery({
    queryKey: ['recommendations'],
    queryFn: fetchRecommendations,
    refetchInterval: 90_000
  });

  const recommendationMutation = useMutation({
    mutationFn: triggerRecommendations,
    onSuccess: (data) => {
      queryClient.setQueryData(['recommendations'], data);
    }
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-4 py-10">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Monetization command center</h1>
          <p className="text-sm text-slate-600">
            Aggregated telemetry from the article view, plus AI recommendations sourced from a pluggable
            rules engine.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['summaries'] })}
            disabled={summariesLoading}
          >
            Refresh metrics
          </Button>
          <Button onClick={() => recommendationMutation.mutate()} disabled={recommendationMutation.isLoading}>
            {recommendationMutation.isLoading ? 'Running AI...' : 'Generate recommendations'}
          </Button>
        </div>
      </section>

      <Card>
        <CardHeader>
          <CardTitle>How it works</CardTitle>
          <CardDescription>
            Metrics are pushed via <code>/metrics</code>, aggregated via <code>/analytics/summary</code>, and AI
            suggestions are returned from <code>/ai/recommend</code>.
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-slate-600">
          Need to audit an individual slot? Jump back to the{' '}
          <Link href="/" className="font-medium text-emerald-600 underline">
            live article experience
          </Link>
          .
        </CardContent>
      </Card>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">Per-slot performance</h2>
          {summariesLoading && <span className="text-xs text-slate-500">Loading latest metrics…</span>}
        </div>
        <SlotMetricsGrid summaries={summaries} />
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-slate-900">AI recommendations</h2>
          {recsLoading && <span className="text-xs text-slate-500">Waiting for guidance…</span>}
        </div>
        <RecommendationList recommendations={recommendations} />
      </section>
    </main>
  );
}
