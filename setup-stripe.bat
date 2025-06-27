@echo off
echo Setting up Stripe CLI for webhook forwarding...
echo.

echo Step 1: Install Stripe CLI
echo Please download and install Stripe CLI from: https://stripe.com/docs/stripe-cli
echo.

echo Step 2: Login to Stripe
echo Run: stripe login
echo.

echo Step 3: Forward webhooks to your local development server
echo Run: stripe listen --forward-to localhost:3000/api/stripe/webhook
echo.

echo Step 4: Copy the webhook signing secret
echo The webhook signing secret will be displayed in the terminal.
echo Add it to your .env file as STRIPE_WEBHOOK_SECRET
echo.

echo Step 5: Create Stripe products and prices
echo 1. Go to https://dashboard.stripe.com/test/products
echo 2. Create a product called "Pro Plan"
echo 3. Add a recurring price of $29/month
echo 4. Copy the price ID and update it in lib/plans.ts
echo.

echo Your development environment is ready!
pause
