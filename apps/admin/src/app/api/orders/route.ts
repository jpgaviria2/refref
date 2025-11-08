import { NextRequest, NextResponse } from 'next/server';
import { mvpDb } from '@refref/coredb/mvp-db';
import { orders, rewards, storeSettings, rewardPayouts } from '@refref/coredb/mvp-schema';
import { emailService } from '@/lib/email';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { externalId, totalAmount, customerEmail } = body;

    // Check if order already exists
    const existing = await mvpDb.select().from(orders).where({ externalId }).limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ message: 'Order already processed' }, { status: 200 });
    }

    // Get store settings
    const settings = await mvpDb.select().from(storeSettings).limit(1);
    if (!settings.length) {
      return NextResponse.json({ error: 'Store settings not configured' }, { status: 400 });
    }

    const rewardAmount = Math.floor(totalAmount * settings[0].rewardPercentage);

    // Insert order
    const [order] = await mvpDb.insert(orders).values({
      externalId,
      totalAmount,
      customerEmail,
    }).returning();

    // Insert reward
    const [reward] = await mvpDb.insert(rewards).values({
      orderId: order.id,
      amount: rewardAmount,
      status: 'pending',
    }).returning();

    // Issue real Cashu tokens for the reward
    // For now, we'll use the issueReward function from wallet router
    // In a real implementation, this would be done more efficiently
    const { createCaller } = await import('@/server/api/root');
    const trpc = createCaller({}); // You'd need to set up proper context

    // For MVP, create mock tokens but update balance
    const tokenString = `cashuA${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tokenString)}`;

    // TODO: Actually issue real tokens using wallet client
    // const result = await trpc.wallet.issueReward.mutate({
    //   amount: rewardAmount,
    //   recipientEmail: customerEmail
    // });
    // const tokenString = result.tokenString;

    // Insert payout
    await mvpDb.insert(rewardPayouts).values({
      rewardId: reward.id,
      tokenString,
      emailSent: false,
    });

    // Send email
    const emailResult = await emailService.sendReward({
      storeName: settings[0].storeName,
      amount: rewardAmount,
      tokenString,
      qrCodeUrl,
      email: customerEmail,
    });

    // Update payout and reward status
    if (emailResult.success) {
      await mvpDb.update(rewardPayouts).set({ emailSent: true }).where({ rewardId: reward.id });
      await mvpDb.update(rewards).set({ status: 'sent' }).where({ id: reward.id });
    }

    return NextResponse.json({ message: 'Order processed and reward sent', rewardAmount });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
