'use client';

import Link from 'next/link';
import Script from 'next/script';
import { useQuery } from '@tanstack/react-query';
import { AdSlot } from '@/components/AdSlot';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { fetchAdSlots } from '@/lib/api';

export default function ArticlePage() {
  const {
    data: slots = [],
    isLoading,
    isError
  } = useQuery({ queryKey: ['adSlots'], queryFn: fetchAdSlots, staleTime: 30_000 });

  const heroSlot = slots.find((slot) => slot.placement === 'aboveFold');
  const inlineSlots = slots.filter((slot) => slot.placement === 'inline');
  const sidebarSlots = slots.filter((slot) => slot.placement === 'sidebar');

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-4 py-10 lg:flex-row">
      <Script
        src="https://cdn.jsdelivr.net/npm/prebid.js@9.5.0/dist/not-for-prod/prebid.js"
        strategy="lazyOnload"
      />
      <Script src="/prebid-mock-adapter.js" strategy="lazyOnload" />

      <article className="flex-1 space-y-8">
        <header className="space-y-4">
          <p className="text-sm uppercase tracking-wide text-emerald-600">AdOps Intelligence</p>
          <h1 className="text-4xl font-semibold text-slate-900">
            AI-driven monetization tactics that respect reader experience
          </h1>
          <p className="text-lg text-slate-600">
            This interactive article demonstrates how an AI-first ad stack can orchestrate Prebid.js,
            performance telemetry, and intelligent recommendations to serve better ads.
          </p>
          <div className="text-sm text-slate-500">
            Curious about the analytics layer? Visit the{' '}
            <Link href="/dashboard" className="font-medium text-emerald-600 underline">
              real-time dashboard
            </Link>
            .
          </div>
        </header>

        {isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>Loading inventory…</CardTitle>
              <CardDescription>Fetching live ad slots from the optimization API.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-40 animate-pulse rounded-lg bg-slate-200" />
            </CardContent>
          </Card>
        )}

        {isError && (
          <Card>
            <CardHeader>
              <CardTitle>Ad inventory unavailable</CardTitle>
              <CardDescription>
                We couldn&apos;t fetch slot definitions from the backend. Please verify the API is running.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {heroSlot && !isLoading && (
          <Card>
            <CardHeader>
              <CardTitle>Featured Sponsorship</CardTitle>
              <CardDescription>
                Reserved space prevents layout shift while Prebid negotiates the best buyer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AdSlot config={heroSlot} />
            </CardContent>
          </Card>
        )}

        <section className="prose prose-slate max-w-none">
          <p>
            Modern publishers balance monetization with performance. Every extra millisecond of ad load
            time risks reader churn, yet aggressive optimizations can slash revenue. An AI-optimized ad
            stack bridges the gap by pairing fast telemetry with adaptive controls.
          </p>
          <p>
            The system below instruments Core Web Vitals, ad latency, timeouts, and viewability while the
            mock Prebid bidder fills slots. Metrics flow to a Node.js analytics API that powers an
            explainable rules engine. The result is human-friendly guidance that teams can trust.
          </p>
        </section>

        {!isLoading && !isError &&
          inlineSlots.map((slot) => (
            <Card key={slot.id}>
              <CardHeader>
                <CardTitle>{slot.name}</CardTitle>
                <CardDescription>
                  Lazy loading keeps cumulative layout shift near zero even for below-the-fold units.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AdSlot config={slot} />
              </CardContent>
            </Card>
          ))}

        <section className="prose prose-slate max-w-none">
          <h2>Operational transparency</h2>
          <p>
            All ad interactions are captured with IntersectionObserver-driven viewability estimates, so ad
            ops teams can trace why recommendations were made. The rules engine inspects each slot&apos;s
            performance and suggests adjustments like reordering slow units or relaxing Prebid timeouts.
          </p>
        </section>
      </article>

      <aside className="sticky top-8 flex h-fit w-full max-w-sm flex-col gap-6">
        <Card>
          <CardHeader>
            <CardTitle>AI Optimization Tips</CardTitle>
            <CardDescription>
              This module summarizes the kinds of insights generated by the backend rules engine.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-600">
            <p>• Reorder latency-prone slots further down the page.</p>
            <p>• Relax Prebid timeouts when bidders show value.</p>
            <p>• Enable lazy loading for low-viewability placements.</p>
            <p>• Audit creatives with elevated layout shift.</p>
          </CardContent>
        </Card>

        {!isLoading && !isError &&
          sidebarSlots.map((slot) => (
            <Card key={slot.id}>
              <CardHeader>
                <CardTitle>{slot.name}</CardTitle>
                <CardDescription>High-impact inventory anchored beside the reading flow.</CardDescription>
              </CardHeader>
              <CardContent>
                <AdSlot config={slot} />
              </CardContent>
            </Card>
          ))}
      </aside>
    </main>
  );
}
