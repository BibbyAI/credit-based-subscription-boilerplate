# 🔧 Authentication Testing & Troubleshooting Guide

## Quick Authentication Test

### 1. **Check Environment Variables**

Verify your `.env` file contains:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 2. **Database Setup Required**

Run this SQL in your Supabase dashboard to set up the required tables:

```sql
-- Create user_credits table
CREATE TABLE user_credits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  credits INTEGER NOT NULL DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create subscriptions table
CREATE TABLE subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT UNIQUE,
  status TEXT NOT NULL,
  plan_type TEXT NOT NULL DEFAULT 'FREE',
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_credits ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own subscriptions" ON subscriptions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own credits" ON user_credits
  FOR SELECT USING (auth.uid() = user_id);

-- Trigger to automatically create user_credits when a user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_credits (user_id, credits)
  VALUES (NEW.id, 100);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE handle_new_user();
```

### 3. **Testing Steps**

#### Test Signup:

1. Go to `http://localhost:3000/signup`
2. Enter a valid email and password (min 6 characters)
3. Confirm password matches
4. Submit form

**Expected Result:**

- Redirected to dashboard with success message
- Email confirmation notice shown if email not confirmed

#### Test Login:

1. Go to `http://localhost:3000/login`
2. Enter the same credentials
3. Submit form

**Expected Result:**

- Redirected to dashboard
- User information displayed

#### Test Error Handling:

1. Try login with wrong password
2. Try signup with mismatched passwords
3. Try login with non-existent email

**Expected Result:**

- Redirected to `/error` page with specific error message

### 4. **Common Issues & Solutions**

#### Issue: "Authentication Error" on signup/login

**Solution:** Check Supabase configuration:

1. Verify project URL and anon key in `.env`
2. Ensure email confirmations are configured in Supabase Auth settings
3. Check if email domain is allowed

#### Issue: Database errors

**Solution:** Run the SQL schema in Supabase dashboard

#### Issue: Users not redirected properly

**Solution:** Check middleware configuration and verify routes are protected

### 5. **Debug API Endpoint**

Test authentication status: `http://localhost:3000/api/auth/status`

**When logged in:** Should return user info and credits
**When not logged in:** Should return 401 error

### 6. **Supabase Auth Settings**

In your Supabase dashboard > Authentication > Settings:

1. **Site URL:** `http://localhost:3000`
2. **Redirect URLs:**
   - `http://localhost:3000/dashboard`
   - `http://localhost:3000/auth/callback`
3. **Email Confirmations:** Enable or disable based on your needs

### 7. **Testing with Different Scenarios**

1. **New User Signup:**

   - Creates account ✓
   - Gets 100 default credits ✓
   - Email verification status shown ✓

2. **Existing User Login:**

   - Authenticates successfully ✓
   - Loads existing credits ✓
   - Shows subscription status ✓

3. **Error Scenarios:**
   - Invalid credentials → Error page ✓
   - Network issues → Error page ✓
   - Missing fields → Error page ✓

### 8. **Next Steps After Auth is Working**

1. Set up Stripe products and get real price IDs
2. Add your Stripe API keys
3. Set up webhook forwarding
4. Test the full subscription flow

---

**Quick Test Command:**

```bash
# Test if server is running
curl http://localhost:3000

# Test signup (should redirect to login page for unauthenticated)
curl http://localhost:3000/signup
```
