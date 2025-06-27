# Credit-Based Subscription System - Database Schema Implementation

## Overview

This document outlines the complete database schema implementation for the credit-based subscription system with Stripe integration.

## Database Tables

### 1. Subscriptions Table

```sql
CREATE TABLE subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose**: Tracks user subscription status and links to Stripe customer/subscription data.

**Key Fields**:

- `user_id`: Links to Supabase auth.users table
- `stripe_customer_id`: Stripe customer identifier
- `stripe_subscription_id`: Stripe subscription identifier (unique)
- `plan_id`: Plan identifier (FREE, PRO, etc.)
- `status`: Subscription status (active, canceled, etc.)

### 2. Credits Table

```sql
CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);
```

**Purpose**: Tracks user credit balances with one record per user.

**Key Fields**:

- `user_id`: Links to Supabase auth.users table (unique constraint)
- `balance`: Current credit balance (integer)

### 3. Credit Transactions Table

```sql
CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
  subscription_id UUID REFERENCES subscriptions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Purpose**: Logs all credit activity for audit trail and analytics.

**Key Fields**:

- `amount`: Credit amount (positive for additions, negative for usage)
- `transaction_type`: Type of transaction (purchase, usage, refund, bonus)
- `description`: Human-readable description of the transaction
- `subscription_id`: Optional link to subscription for purchase transactions

## Security & Performance

### Row Level Security (RLS)

All tables have RLS enabled with policies ensuring users can only access their own data:

```sql
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own credits" ON credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);
```

### Database Indexes

Optimized indexes for common query patterns:

```sql
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_credits_user_id ON credits(user_id);
CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);
```

## Automated Functions & Triggers

### 1. New User Credit Initialization

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO credits (user_id, balance)
  VALUES (NEW.id, 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

**Purpose**: Automatically creates a credit record with 100 credits when a new user signs up.

### 2. Subscription Credit Management

```sql
CREATE OR REPLACE FUNCTION update_credits_on_subscription()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.status = 'active' AND (OLD IS NULL OR OLD.status != 'active') THEN
    IF NEW.plan_id = 'PRO' THEN
      UPDATE credits SET balance = 100000, updated_at = NOW() WHERE user_id = NEW.user_id;
      INSERT INTO credit_transactions (user_id, amount, description, transaction_type, subscription_id)
      VALUES (NEW.user_id, 100000, 'Pro subscription activated', 'purchase', NEW.id);
    END IF;
  ELSIF NEW.status != 'active' AND OLD.status = 'active' THEN
    UPDATE credits SET balance = 100, updated_at = NOW() WHERE user_id = NEW.user_id;
    INSERT INTO credit_transactions (user_id, amount, description, transaction_type, subscription_id)
    VALUES (NEW.user_id, -OLD.balance + 100, 'Subscription deactivated', 'refund', NEW.id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_credits_on_subscription();
```

**Purpose**: Automatically manages credit balance based on subscription changes:

- Pro subscription activation: Sets balance to 100,000 credits
- Subscription deactivation: Resets balance to 100 credits

## TypeScript Types

The schema includes comprehensive TypeScript types in `types/database.ts`:

```typescript
export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan_id: string;
  status: string;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Credits {
  id: string;
  user_id: string;
  balance: number;
  created_at: string;
  updated_at: string;
}

export interface CreditTransaction {
  id: string;
  user_id: string;
  amount: number;
  description: string;
  transaction_type: "purchase" | "usage" | "refund" | "bonus";
  subscription_id: string | null;
  created_at: string;
}
```

## Credit Management Utilities

### Server-Side Functions (`lib/credits.ts`)

1. **getUserCredits(userId)**: Get current credit balance
2. **consumeCredits(userId, amount, description)**: Deduct credits for usage
3. **addCredits(userId, amount, description, type)**: Add credits (purchase, bonus, etc.)
4. **getCreditTransactions(userId, limit, offset)**: Get transaction history
5. **hasEnoughCredits(userId, amount)**: Check if user has sufficient credits
6. **getCreditStats(userId, days)**: Get usage statistics

### API Endpoints

1. **POST /api/test1**: Generate Report (costs 10 credits)
2. **POST /api/test2**: Send Notification (costs 5 credits)
3. **GET /api/credits**: Check credit balance and stats

## Implementation Steps

### 1. Run Database Migration

Execute the SQL schema in your Supabase dashboard:

```bash
# Copy the contents of database_schema.sql and run in Supabase SQL Editor
```

### 2. Update Environment Variables

Ensure all Stripe environment variables are configured:

```env
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### 3. Set Up Stripe Webhook

Configure Stripe webhook to point to your application:

```
Endpoint: https://yourdomain.com/api/stripe/webhook
Events: customer.subscription.created, customer.subscription.updated, customer.subscription.deleted
```

### 4. Test the System

1. Sign up for a new account (receives 100 credits automatically)
2. Use the API testing buttons to consume credits
3. Subscribe to Pro plan (receives 100,000 credits)
4. View credit dashboard to see balance and transaction history

## Credit Flow Examples

### New User Registration

1. User signs up → `handle_new_user()` trigger fires
2. Credit record created with 100 credits
3. Transaction logged: "Initial credit bonus" (+100)

### API Usage

1. User calls `/api/test1` → 10 credits deducted
2. Credit balance updated: balance - 10
3. Transaction logged: "Monthly report generation" (-10)

### Pro Subscription

1. User subscribes to Pro → Stripe webhook fires
2. Subscription record created/updated
3. `update_credits_on_subscription()` trigger fires
4. Credit balance set to 100,000
5. Transaction logged: "Pro subscription activated" (+100,000)

This implementation provides a robust, scalable credit-based subscription system with proper audit trails, security, and automation.
