-- Additional RLS policies for complete CRUD operations
-- These policies are needed for the credit system to work properly

-- Subscriptions policies (allow service role to manage subscriptions)
CREATE POLICY "Service role can manage subscriptions" ON subscriptions
  FOR ALL USING (true);

-- Credits policies  
CREATE POLICY "Service role can manage credits" ON credits
  FOR ALL USING (true);

CREATE POLICY "Users can update their own credits" ON credits
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own credits" ON credits
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Credit transactions policies
CREATE POLICY "Service role can manage credit transactions" ON credit_transactions
  FOR ALL USING (true);

CREATE POLICY "Users can insert their own transactions" ON credit_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Grant necessary permissions to service role
GRANT ALL ON subscriptions TO service_role;
GRANT ALL ON credits TO service_role;
GRANT ALL ON credit_transactions TO service_role;

-- Grant usage on sequences
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO service_role;

-- Ensure the trigger function can access the credits table
-- Update the function with proper permissions
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.credits (user_id, balance)
  VALUES (NEW.id, 100);
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE LOG 'Error creating initial credits for user %: %', NEW.id, SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Also ensure we have a policy for the auth trigger to work
CREATE POLICY "Auth triggers can insert credits" ON credits
  FOR INSERT WITH CHECK (true);

-- Make sure existing users get their credit records
DO $$
DECLARE
  user_record RECORD;
BEGIN
  -- Create credit records for existing users who don't have them
  FOR user_record IN 
    SELECT id FROM auth.users 
    WHERE id NOT IN (SELECT user_id FROM credits)
  LOOP
    INSERT INTO credits (user_id, balance) 
    VALUES (user_record.id, 100)
    ON CONFLICT (user_id) DO NOTHING;
  END LOOP;
END $$;
