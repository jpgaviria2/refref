import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { mvpDb } from '@refref/coredb/mvp-db';
import { rewards, orders } from '@refref/coredb/mvp-schema';
import { eq } from 'drizzle-orm';

export const rewardsMvpRouter = createTRPCRouter({
  list: protectedProcedure.query(async () => {
    const result = await mvpDb
      .select({
        id: rewards.id,
        orderId: rewards.orderId,
        amount: rewards.amount,
        status: rewards.status,
        customerEmail: orders.customerEmail,
      })
      .from(rewards)
      .innerJoin(orders, eq(rewards.orderId, orders.id));
    return result;
  }),
});
