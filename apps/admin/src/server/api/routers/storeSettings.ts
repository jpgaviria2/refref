import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { z } from 'zod';
import { mvpDb } from '@refref/coredb/mvp-db';
import { storeSettings } from '@refref/coredb/mvp-schema';

export const storeSettingsRouter = createTRPCRouter({
  save: protectedProcedure
    .input(z.object({ storeName: z.string(), rewardPercentage: z.number() }))
    .mutation(async ({ input }) => {
      await mvpDb.insert(storeSettings).values({
        storeName: input.storeName,
        rewardPercentage: input.rewardPercentage,
      });
      return { success: true };
    }),

  get: protectedProcedure.query(async () => {
    const settings = await mvpDb.select().from(storeSettings).limit(1);
    return settings[0];
  }),
});
