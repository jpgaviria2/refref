import { createTRPCRouter, protectedProcedure } from '@/server/api/trpc';
import { z } from 'zod';
import { sql, desc } from 'drizzle-orm';
import { WalletClient } from '@refref/cashu-wallet';
import { mvpDb } from '@refref/coredb/mvp-db';
import { wallets, proofs } from '@refref/coredb/mvp-schema';

export const walletRouter = createTRPCRouter({
  create: protectedProcedure.mutation(async () => {
    // Check if wallet already exists
    const existing = await mvpDb.select().from(wallets).limit(1);
    if (existing.length > 0) {
      throw new Error('Wallet already exists');
    }

    const walletClient = new WalletClient({ mints: [] });
    const mnemonic = walletClient.getMnemonic();

    // Store wallet in database
    await mvpDb.insert(wallets).values({ mnemonic, balance: 0 });
    return { mnemonic };
  }),

  getBalance: protectedProcedure.query(async () => {
    const wallet = await mvpDb.select().from(wallets).limit(1);
    return wallet[0]?.balance || 0;
  }),

  topUp: protectedProcedure
    .input(z.object({ tokenString: z.string() }))
    .mutation(async ({ input }) => {
      const walletRecord = await mvpDb.select().from(wallets).limit(1);
      if (!walletRecord[0]) throw new Error('No wallet found');

      // Initialize wallet client with stored mnemonic
      const walletClient = new WalletClient({ mints: [] }, walletRecord[0].mnemonic);

      // Receive the tokens
      const result = await walletClient.receiveTokens(input.tokenString);

      // Store proofs in database
      for (const proof of result.proofs) {
        await mvpDb.insert(proofs).values({
          mintUrl: 'https://mint.minibits.cash/Bitcoin', // Assume MiniBits for now
          keysetId: proof.id,
          amount: proof.amount,
          secret: proof.secret,
          c: proof.C,
        });
      }

      // Update balance
      const newBalance = walletRecord[0].balance + result.amount;
      await mvpDb.update(wallets).set({ balance: newBalance }).where({ id: walletRecord[0].id });

      return { balance: newBalance, receivedAmount: result.amount };
    }),

  issueReward: protectedProcedure
    .input(z.object({ amount: z.number(), recipientEmail: z.string() }))
    .mutation(async ({ input }) => {
      const walletRecord = await mvpDb.select().from(wallets).limit(1);
      if (!walletRecord[0]) throw new Error('No wallet found');

      if (walletRecord[0].balance < input.amount) {
        throw new Error('Insufficient balance');
      }

      // Initialize wallet client with stored mnemonic
      const walletClient = new WalletClient({ mints: [] }, walletRecord[0].mnemonic);

      // Initialize mint connection
      const instance = await walletClient.initializeMint('minibits');

      // Get available proofs for the amount
      const availableProofs = await mvpDb
        .select()
        .from(proofs)
        .where(sql`${proofs.amount} <= ${input.amount}`)
        .orderBy(desc(proofs.amount))
        .limit(10); // Get some proofs to work with

      if (!availableProofs.length) {
        throw new Error('No available proofs for minting');
      }

      // For simplicity, use the largest available proof
      const proofToUse = availableProofs[0];
      const proof = {
        id: proofToUse.keysetId,
        amount: proofToUse.amount,
        secret: proofToUse.secret,
        C: proofToUse.c,
      };

      // Melt the proof to get new tokens
      // This is simplified - in reality you'd need to handle the melt/mint process
      // For now, create a mock token string
      const tokenString = `cashuA${Date.now()}${Math.random().toString(36).substr(2, 9)}`;

      // Update balance
      const newBalance = walletRecord[0].balance - input.amount;
      await mvpDb.update(wallets).set({ balance: newBalance }).where({ id: walletRecord[0].id });

      return { tokenString, newBalance };
    }),
});
