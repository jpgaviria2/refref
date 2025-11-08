# RefRef Wallet MVP - Cashu e-Cash Integration

This MVP implements a basic Cashu wallet integration for RefRef admin portal, allowing administrators to create wallets, receive ecash tokens, and automatically issue rewards via email.

## Features Implemented

### ✅ Database Schema
- SQLite database with tables for store settings, wallets, proofs, orders, rewards, and payouts
- Drizzle ORM integration for type-safe queries

### ✅ Wallet Management
- Auto-generated BIP39 mnemonic wallets
- Default connection to MiniBits mint (https://mint.minibits.cash/Bitcoin)
- Real Cashu token reception and proof storage
- Balance tracking

### ✅ Admin Interface
- **Setup Page**: Configure store name, reward percentage, create wallet
- **Top-Up Page**: Receive Cashu tokens to fund the wallet
- **Rewards Page**: View issued rewards and resend emails

### ✅ Order Processing
- REST API endpoint (`/api/orders`) for receiving order data
- Automatic reward calculation (order total × percentage)
- Email notifications with Cashu QR codes

### ✅ Email Integration
- Reward emails with QR codes for easy token redemption
- Uses existing Resend email service

## Quick Start

1. **Setup Database**
   ```bash
   # The migration will run automatically when the app starts
   # SQLite file: mvp.db in packages/coredb/
   ```

2. **Create Wallet**
   - Navigate to `/wallet/setup` in admin
   - Configure store settings
   - Click "Create Wallet" (connects to MiniBits mint)

3. **Top Up Wallet**
   - Go to `/wallet/top-up`
   - Get Cashu tokens from a wallet or mint
   - Paste token string and click "Receive Tokens"

4. **Process Orders**
   ```bash
   curl -X POST http://localhost:3000/api/orders \
     -H "Content-Type: application/json" \
     -d '{
       "externalId": "order-123",
       "totalAmount": 50.00,
       "customerEmail": "customer@example.com"
     }'
   ```

## Architecture

### Shared Library (`packages/cashu-wallet`)
- `WalletClient`: Handles Cashu operations, mint connections, token reception
- React hooks for admin UI integration
- BIP39 mnemonic generation and validation

### Backend Services
- tRPC routers for wallet operations
- Database operations with Drizzle ORM
- Email service integration

### Database Schema
```sql
-- Core tables for MVP
store_settings (store_name, reward_percentage)
wallets (mnemonic, balance, top_ups)
proofs (mint_url, keyset_id, amount, secret, c)
orders (external_id, total_amount, customer_email)
rewards (order_id, amount, status)
reward_payouts (reward_id, token_string, email_sent)
```

## Security Notes

⚠️ **MVP Limitations**:
- Mnemonics stored in plaintext (encrypt in production)
- No proof blinding/splitting (simplified for MVP)
- Mock token issuance for rewards (use real Cashu minting)
- No authentication on order API endpoint

## Next Steps for Production

1. **Real Token Minting**: Implement proper Cashu mint/melt operations for rewards
2. **Security**: Encrypt mnemonics, add API authentication
3. **Scaling**: Add job queues, better proof management
4. **Integrations**: OAuth for Square/Shopify, webhooks
5. **UI**: Enhanced admin dashboard, participant rewards history

## Testing

The MVP includes basic functionality tests. To test token reception:

1. Create wallet in admin
2. Get test tokens from MiniBits mint
3. Top up via admin interface
4. Verify balance updates

For order processing, use the API endpoint with test data.
