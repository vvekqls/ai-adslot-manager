import { z } from 'zod';

export const metricPayloadSchema = z.object({
  slotId: z.string().uuid(),
  cls: z.number().min(0),
  lcp: z.number().min(0),
  fid: z.number().min(0),
  tbt: z.number().min(0),
  adLoadTime: z.number().min(0),
  timeoutRate: z.number().min(0).max(1),
  viewability: z.number().min(0).max(1),
  timestamp: z.coerce.date().optional()
});

export type MetricPayload = z.infer<typeof metricPayloadSchema>;
