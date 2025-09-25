import { z } from 'zod';

const sandboxSlotIdPattern = /^sandbox-[a-z0-9-]+$/i;

const placementEnum = z.enum(['aboveFold', 'inline', 'sidebar', 'footer']);

const sandboxSizeSchema = z.object({
  width: z.number().positive(),
  height: z.number().positive()
});

export const sandboxConfigSchema = z.object({
  name: z.string().min(2),
  placement: placementEnum,
  sizes: z.array(sandboxSizeSchema).min(1),
  prebidTimeoutMs: z.number().min(100).max(5000),
  lazyLoad: z.boolean(),
  order: z.number()
});

export const metricPayloadSchema = z.object({
  slotId: z
    .string()
    .uuid()
    .or(
      z
        .string()
        .regex(sandboxSlotIdPattern, {
          message: 'Sandbox slot identifiers must start with `sandbox-`.'
        })
    ),
  cls: z.number().min(0),
  lcp: z.number().min(0),
  fid: z.number().min(0),
  tbt: z.number().min(0),
  adLoadTime: z.number().min(0),
  timeoutRate: z.number().min(0).max(1),
  viewability: z.number().min(0).max(1),
  timestamp: z.coerce.date().optional(),
  sandboxConfig: sandboxConfigSchema.optional()
}).superRefine((payload, ctx) => {
  const isSandbox = sandboxSlotIdPattern.test(payload.slotId);
  if (isSandbox && !payload.sandboxConfig) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['sandboxConfig'],
      message: 'Sandbox metrics must include sandboxConfig metadata.'
    });
  }

  if (!isSandbox && payload.sandboxConfig) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['sandboxConfig'],
      message: 'sandboxConfig is only accepted for sandbox slot identifiers.'
    });
  }
});

export type MetricPayload = z.infer<typeof metricPayloadSchema>;

export type SandboxConfigPayload = z.infer<typeof sandboxConfigSchema>;

export type SlotMetricSummary = {
  slotId: string;
  avgCls: number;
  avgLcp: number;
  avgFid: number;
  avgTbt: number;
  avgAdLoadTime: number;
  avgTimeoutRate: number;
  avgViewability: number;
  samples: number;
  origin: 'catalog' | 'sandbox';
  performanceScore: number;
};
