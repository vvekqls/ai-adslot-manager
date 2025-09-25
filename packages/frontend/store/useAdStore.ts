'use client';

import { create } from 'zustand';

export type AdSlotConfig = {
  id: string;
  name: string;
  sizes: Array<{ width: number; height: number }>;
  placement: 'aboveFold' | 'inline' | 'sidebar' | 'footer';
  prebidTimeoutMs: number;
  lazyLoad: boolean;
  order: number;
};

type State = {
  slots: AdSlotConfig[];
};

export const useAdStore = create<State>(() => ({
  slots: [
    {
      id: '11111111-1111-1111-1111-111111111111',
      name: 'Hero Billboard',
      sizes: [{ width: 970, height: 250 }, { width: 728, height: 90 }],
      placement: 'aboveFold',
      prebidTimeoutMs: 1200,
      lazyLoad: false,
      order: 0
    },
    {
      id: '22222222-2222-2222-2222-222222222222',
      name: 'Inline Rectangle 1',
      sizes: [{ width: 300, height: 250 }],
      placement: 'inline',
      prebidTimeoutMs: 1200,
      lazyLoad: true,
      order: 1
    },
    {
      id: '33333333-3333-3333-3333-333333333333',
      name: 'Sidebar Skyscraper',
      sizes: [{ width: 300, height: 600 }, { width: 160, height: 600 }],
      placement: 'sidebar',
      prebidTimeoutMs: 1200,
      lazyLoad: true,
      order: 2
    }
  ]
}));
