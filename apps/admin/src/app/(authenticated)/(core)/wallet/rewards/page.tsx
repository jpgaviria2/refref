'use client';

import { Button } from '@refref/ui/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@refref/ui/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@refref/ui/components/ui/table';
import { trpc } from '@/lib/trpc';

export default function WalletRewardsPage() {
  const { data: rewards, isLoading } = trpc.rewardsMvp.list.useQuery();

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Wallet Rewards</h1>

      <Card>
        <CardHeader>
          <CardTitle>Issued Rewards</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Amount (sats)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Customer Email</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rewards?.map((reward) => (
                <TableRow key={reward.id}>
                  <TableCell>{reward.orderId}</TableCell>
                  <TableCell>{reward.amount}</TableCell>
                  <TableCell>{reward.status}</TableCell>
                  <TableCell>{reward.customerEmail}</TableCell>
                  <TableCell>
                    <Button variant="outline" size="sm">
                      Resend Email
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
