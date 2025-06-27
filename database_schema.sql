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

CREATE TABLE credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  balance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

CREATE TABLE credit_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount INTEGER NOT NULL,
  description TEXT NOT NULL,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('purchase', 'usage', 'refund', 'bonus')),
  subscription_id UUID REFERENCES subscriptions(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_stripe_subscription_id ON subscriptions(stripe_subscription_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);

CREATE INDEX idx_credits_user_id ON credits(user_id);

CREATE INDEX idx_credit_transactions_user_id ON credit_transactions(user_id);
CREATE INDEX idx_credit_transactions_type ON credit_transactions(transaction_type);
CREATE INDEX idx_credit_transactions_created_at ON credit_transactions(created_at);

ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE credit_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own credits" ON credits
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own transactions" ON credit_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO credits (user_id, balance)
  VALUES (NEW.id, 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

CREATE TRIGGER on_subscription_change
  AFTER INSERT OR UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_credits_on_subscription();
