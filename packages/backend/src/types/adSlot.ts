import { z } from 'zod';

export const adSlotSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(2),
  placement: z.enum(['aboveFold', 'inline', 'sidebar', 'footer']),
  sizes: z.array(z.tuple([z.number(), z.number()])).min(1),
  prebidTimeoutMs: z.number().min(100).max(5000),
  lazyLoad: z.boolean().default(false),
  order: z.number().int().min(0)
});

export type AdSlotInput = z.infer<typeof adSlotSchema>;
