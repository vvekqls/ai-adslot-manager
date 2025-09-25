import type { AdSlot as PrismaAdSlot } from '@prisma/client';
import { Router } from 'express';
import { adSlotSchema } from '../types/adSlot.js';
import {
  listAdSlots,
  createAdSlot,
  getAdSlotById,
  updateAdSlot,
  deleteAdSlot
} from '../services/adSlotService.js';

export const adSlotsRouter = Router();

const parseSize = (size: string) => {
  const [width, height] = size.split('x').map(Number);
  return {
    width: Number.isFinite(width) ? width : 0,
    height: Number.isFinite(height) ? height : 0
  };
};

const toResponse = (slot: PrismaAdSlot) => ({
  id: slot.id,
  name: slot.name,
  placement: slot.placement,
  prebidTimeoutMs: slot.prebidTimeoutMs,
  lazyLoad: slot.lazyLoad,
  order: slot.order,
  sizes: slot.sizes.map(parseSize),
  createdAt: slot.createdAt,
  updatedAt: slot.updatedAt
});

adSlotsRouter.get('/', async (_req, res) => {
  const slots = await listAdSlots();
  res.json(slots.map(toResponse));
});

adSlotsRouter.get('/:id', async (req, res) => {
  const slot = await getAdSlotById(req.params.id);
  if (!slot) {
    return res.status(404).json({ message: 'Ad slot not found' });
  }
  res.json(toResponse(slot));
});

adSlotsRouter.post('/', async (req, res) => {
  const parseResult = adSlotSchema.omit({ id: true }).safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parseResult.error.flatten() });
  }
  const slot = await createAdSlot(parseResult.data);
  res.status(201).json(toResponse(slot));
});

adSlotsRouter.put('/:id', async (req, res) => {
  const parseResult = adSlotSchema.partial().safeParse({ ...req.body, id: req.params.id });
  if (!parseResult.success) {
    return res.status(400).json({ message: 'Invalid payload', errors: parseResult.error.flatten() });
  }

  const slot = await updateAdSlot(req.params.id, parseResult.data);
  res.json(toResponse(slot));
});

adSlotsRouter.delete('/:id', async (req, res) => {
  await deleteAdSlot(req.params.id);
  res.status(204).send();
});
