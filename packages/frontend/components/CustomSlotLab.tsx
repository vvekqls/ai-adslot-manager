'use client';

import { useMemo, useState, type FormEvent } from 'react';
import type { AdSlotConfig } from '@/lib/api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const SIZE_PRESETS = [
  { label: 'Medium Rectangle · 300×250', width: 300, height: 250 },
  { label: 'Leaderboard · 728×90', width: 728, height: 90 },
  { label: 'Skyscraper · 160×600', width: 160, height: 600 },
  { label: 'Billboard · 970×250', width: 970, height: 250 }
];

const timeoutOptions = [
  { label: 'Fast (400ms)', value: 400 },
  { label: 'Balanced (800ms)', value: 800 },
  { label: 'Deliberate (1200ms)', value: 1200 }
];

type CustomSlotLabProps = {
  onCreate(slot: AdSlotConfig): void;
};

type Placement = AdSlotConfig['placement'];

const placements: Array<{ label: string; value: Placement; description: string }> = [
  { label: 'Above the fold', value: 'aboveFold', description: 'Hero sponsorship that renders immediately.' },
  { label: 'Inline', value: 'inline', description: 'Breaks up long-form content mid-article.' },
  { label: 'Sidebar', value: 'sidebar', description: 'Persistent rail placement beside the story.' },
  { label: 'Footer', value: 'footer', description: 'Safety net inventory at the end of the read.' }
];

export const CustomSlotLab = ({ onCreate }: CustomSlotLabProps) => {
  const [slotName, setSlotName] = useState('Custom Sandbox Slot');
  const [placement, setPlacement] = useState<Placement>('inline');
  const [lazyLoad, setLazyLoad] = useState(true);
  const [width, setWidth] = useState(300);
  const [height, setHeight] = useState(250);
  const [timeoutMs, setTimeoutMs] = useState(800);

  const presetLabel = useMemo(() => {
    const preset = SIZE_PRESETS.find((p) => p.width === width && p.height === height);
    return preset ? preset.label : 'Custom dimensions';
  }, [width, height]);

  const isValid = slotName.trim().length > 0 && width > 0 && height > 0 && timeoutMs > 0;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!isValid) return;

    const id = `sandbox-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const order = Date.now();

    onCreate({
      id,
      name: slotName.trim(),
      placement,
      sizes: [{ width, height }],
      prebidTimeoutMs: timeoutMs,
      lazyLoad,
      order
    });
  };

  const handlePreset = (w: number, h: number) => {
    setWidth(w);
    setHeight(h);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ad Slot Sandbox</CardTitle>
        <CardDescription>
          Prototype a placement, reserve space, and instantly preview how Prebid responds without touching the
          backend catalog.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="slot-name">
              Slot name
            </label>
            <input
              id="slot-name"
              value={slotName}
              onChange={(event) => setSlotName(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              placeholder="e.g. Inline Boost Variant"
            />
            <p className="mt-1 text-xs text-slate-500">Friendly name to label the sandbox preview and metrics.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="slot-placement">
              Placement
            </label>
            <select
              id="slot-placement"
              value={placement}
              onChange={(event) => setPlacement(event.target.value as Placement)}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              {placements.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              {placements.find((option) => option.value === placement)?.description}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="slot-width">
                Width (px)
              </label>
              <input
                id="slot-width"
                type="number"
                min={1}
                value={width}
                onChange={(event) => setWidth(Number(event.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700" htmlFor="slot-height">
                Height (px)
              </label>
              <input
                id="slot-height"
                type="number"
                min={1}
                value={height}
                onChange={(event) => setHeight(Number(event.target.value))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
              />
            </div>
          </div>
          <p className="text-xs text-slate-500">Preset: {presetLabel}</p>

          <div className="flex flex-wrap gap-2">
            {SIZE_PRESETS.map((preset) => (
              <Button
                key={preset.label}
                type="button"
                variant="outline"
                onClick={() => handlePreset(preset.width, preset.height)}
                className="text-xs"
              >
                {preset.label}
              </Button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700" htmlFor="timeout">
              Prebid timeout
            </label>
            <select
              id="timeout"
              value={timeoutMs}
              onChange={(event) => setTimeoutMs(Number(event.target.value))}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/40"
            >
              {timeoutOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-slate-500">
              Short timeouts protect UX, longer ones capture high-value bids — experiment to find your balance.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm font-medium text-slate-700">
            <input
              type="checkbox"
              checked={lazyLoad}
              onChange={(event) => setLazyLoad(event.target.checked)}
              className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
            />
            Enable lazy loading for this placement
          </label>
          <p className="text-xs text-slate-500">
            Lazy loading defers below-the-fold inventory until a reader nears it, preserving Core Web Vitals.
          </p>

          <Button type="submit" disabled={!isValid} className="w-full">
            Launch sandbox slot
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
