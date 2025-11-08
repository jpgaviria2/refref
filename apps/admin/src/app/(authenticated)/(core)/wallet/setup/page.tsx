'use client';

import { useState } from 'react';
import { Button } from '@refref/ui/components/ui/button';
import { Input } from '@refref/ui/components/ui/input';
import { Label } from '@refref/ui/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@refref/ui/components/ui/card';
import { trpc } from '@/lib/trpc';

export default function WalletSetupPage() {
  const [storeName, setStoreName] = useState('');
  const [rewardPercentage, setRewardPercentage] = useState('');
  const [walletExists, setWalletExists] = useState(false);

  const createWallet = trpc.wallet.create.useMutation();
  const saveSettings = trpc.storeSettings.save.useMutation();
  const { data: balance } = trpc.wallet.getBalance.useQuery(undefined, {
    onSuccess: (data) => {
      if (data !== undefined) setWalletExists(true);
    }
  });

  const handleGenerateWallet = async () => {
    try {
      await createWallet.mutateAsync();
      setWalletExists(true);
      alert('Wallet created successfully!');
    } catch (error: any) {
      alert(error.message || 'Failed to create wallet');
    }
  };

  const handleSaveSettings = async () => {
    await saveSettings.mutateAsync({
      storeName,
      rewardPercentage: parseFloat(rewardPercentage),
    });
    alert('Settings saved!');
  };

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Wallet Setup</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Store Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
                placeholder="Enter store name"
              />
            </div>
            <div>
              <Label htmlFor="rewardPercentage">Reward Percentage (e.g., 0.05 for 5%)</Label>
              <Input
                id="rewardPercentage"
                type="number"
                step="0.01"
                value={rewardPercentage}
                onChange={(e) => setRewardPercentage(e.target.value)}
                placeholder="0.05"
              />
            </div>
            <Button onClick={handleSaveSettings}>Save Settings</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Create Wallet</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {walletExists ? (
              <div className="text-green-600">
                ✅ Wallet already exists! Current balance: {balance} sats
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-600">
                  This will create a new Cashu wallet connected to MiniBits mint with an auto-generated mnemonic.
                </p>
                <Button onClick={handleGenerateWallet} disabled={createWallet.isLoading}>
                  {createWallet.isLoading ? 'Creating Wallet...' : 'Create Wallet'}
                </Button>
              </>
            )}
            <p className="text-sm text-blue-600">
              💡 After creating your wallet, go to the Top-Up page to add funds by receiving Cashu tokens.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
