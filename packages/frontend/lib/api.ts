import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export type AdSlotConfig = {
  id: string;
  name: string;
  placement: 'aboveFold' | 'inline' | 'sidebar' | 'footer';
  sizes: Array<{ width: number; height: number }>;
  prebidTimeoutMs: number;
  lazyLoad: boolean;
  order: number;
  createdAt?: string;
  updatedAt?: string;
};

export type MetricPayload = {
  slotId: string;
  cls: number;
  lcp: number;
  fid: number;
  tbt: number;
  adLoadTime: number;
  timeoutRate: number;
  viewability: number;
  timestamp?: string;
};

export type SlotSummary = {
  slotId: string;
  avgCls: number;
  avgLcp: number;
  avgFid: number;
  avgTbt: number;
  avgAdLoadTime: number;
  avgTimeoutRate: number;
  avgViewability: number;
  samples: number;
};

export type Recommendation = {
  slotId: string;
  action: string;
  rationale: string;
  priority: 'low' | 'medium' | 'high';
};

export const submitMetrics = async (payload: MetricPayload) => {
  await axios.post(`${API_URL}/metrics`, payload, {
    headers: { 'Content-Type': 'application/json' }
  });
};

export const fetchAdSlots = async (): Promise<AdSlotConfig[]> => {
  const { data } = await axios.get(`${API_URL}/ad-slots`);
  return data;
};

export const fetchSummaries = async (): Promise<SlotSummary[]> => {
  const { data } = await axios.get(`${API_URL}/analytics/summary`);
  return data;
};

export const fetchRecommendations = async (): Promise<Recommendation[]> => {
  const { data } = await axios.get(`${API_URL}/ai/recommend`);
  return data.recommendations;
};

export const triggerRecommendations = async (): Promise<Recommendation[]> => {
  const { data } = await axios.post(`${API_URL}/ai/recommend`);
  return data.recommendations;
};
