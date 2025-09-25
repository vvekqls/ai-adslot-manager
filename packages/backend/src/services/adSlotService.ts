import { prisma } from '../prismaClient.js';
import { AdSlotInput } from '../types/adSlot.js';

export const listAdSlots = () => prisma.adSlot.findMany({ orderBy: { order: 'asc' } });

export const getAdSlotById = (id: string) => prisma.adSlot.findUnique({ where: { id } });

export const createAdSlot = (payload: AdSlotInput) =>
  prisma.adSlot.create({
    data: {
      name: payload.name,
      placement: payload.placement,
      sizes: payload.sizes.map(([width, height]) => `${width}x${height}`),
      prebidTimeoutMs: payload.prebidTimeoutMs,
      lazyLoad: payload.lazyLoad,
      order: payload.order
    }
  });

export const updateAdSlot = (id: string, payload: Partial<AdSlotInput>) =>
  prisma.adSlot.update({
    where: { id },
    data: {
      ...('name' in payload ? { name: payload.name } : {}),
      ...('placement' in payload ? { placement: payload.placement } : {}),
      ...('sizes' in payload
        ? { sizes: payload.sizes?.map(([width, height]) => `${width}x${height}`) }
        : {}),
      ...('prebidTimeoutMs' in payload ? { prebidTimeoutMs: payload.prebidTimeoutMs } : {}),
      ...('lazyLoad' in payload ? { lazyLoad: payload.lazyLoad } : {}),
      ...('order' in payload ? { order: payload.order } : {})
    }
  });

export const deleteAdSlot = (id: string) => prisma.adSlot.delete({ where: { id } });
