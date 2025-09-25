import { z } from 'zod';

export const recommendationSchema = z.object({
  slotId: z.string(),
  action: z.string(),
  rationale: z.string(),
  priority: z.enum(['low', 'medium', 'high']).default('medium')
});

export type Recommendation = z.infer<typeof recommendationSchema>;
