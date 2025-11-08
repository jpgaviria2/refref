'use client';

import { useState } from 'react';
import { Button } from '@refref/ui/components/ui/button';
import { Input } from '@refref/ui/components/ui/input';
import { Label } from '@refref/ui/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@refref/ui/components/ui/card';
import { trpc } from '@/lib/trpc';

export default function WalletTopUpPage() {
  const [tokenString, setTokenString] = useState('');
  const [balance, setBalance] = useState(0);

  const topUp = trpc.wallet.topUp.useMutation();
  const { data: currentBalance } = trpc.wallet.getBalance.useQuery(undefined, {
    onSuccess: (data) => setBalance(data),
  });

  const handleTopUp = async () => {
    const result = await topUp.mutateAsync({ tokenString });
    setBalance(result.balance);
    setTokenString('');
    alert(`Received ${result.receivedAmount} sats! New balance: ${result.balance} sats`);
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Wallet Top-Up</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Current Balance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-3xl font-bold">{balance} sats</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Top-Up Wallet with Cashu Tokens</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="tokenString">Cashu Token String</Label>
              <textarea
                id="tokenString"
                className="w-full p-2 border rounded"
                rows={4}
                value={tokenString}
                onChange={(e) => setTokenString(e.target.value)}
                placeholder="Paste your Cashu token string here..."
              />
              <p className="text-sm text-gray-600 mt-1">
                Get tokens from a Cashu wallet or mint, then paste the token string here to top up your wallet.
              </p>
            </div>
            <Button onClick={handleTopUp} disabled={topUp.isLoading || !tokenString.trim()}>
              {topUp.isLoading ? 'Processing...' : 'Receive Tokens'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
