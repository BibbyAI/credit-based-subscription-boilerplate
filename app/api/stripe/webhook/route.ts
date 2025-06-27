import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createClient } from "@/utils/supabase/server";

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get("stripe-signature")!;

  let event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch (err: any) {
    console.error("Webhook signature verification failed:", err.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  const supabase = await createClient();

  try {
    switch (event.type) {
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const subscription = event.data.object;
        const customerId = subscription.customer as string;
        const userId = subscription.metadata.userId;

        if (!userId) {
          console.error("No userId found in subscription metadata");
          return NextResponse.json({ error: "No userId" }, { status: 400 });
        }

        const priceId = subscription.items.data[0]?.price.id;
        let planType = "FREE";
        let credits = 100;

        if (priceId === "price_pro_monthly") {
          planType = "PRO";
          credits = 100000;
        }

        await supabase.from("subscriptions").upsert({
          user_id: userId,
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          status: subscription.status,
          plan_type: planType,
          current_period_start: new Date(
            (subscription as any).current_period_start * 1000
          ).toISOString(),
          current_period_end: new Date(
            (subscription as any).current_period_end * 1000
          ).toISOString(),
          updated_at: new Date().toISOString(),
        });

        await supabase.from("user_credits").upsert({
          user_id: userId,
          credits: credits,
          updated_at: new Date().toISOString(),
        });

        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const userId = subscription.metadata.userId;

        if (!userId) {
          console.error("No userId found in subscription metadata");
          return NextResponse.json({ error: "No userId" }, { status: 400 });
        }

        await supabase
          .from("subscriptions")
          .update({
            status: "canceled",
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        await supabase
          .from("user_credits")
          .update({
            credits: 100,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", userId);

        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = (invoice as any).subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );
          const userId = subscription.metadata.userId;

          if (userId) {
            const priceId = subscription.items.data[0]?.price.id;
            let credits = 100;

            if (priceId === "price_pro_monthly") {
              credits = 100000;
            }

            await supabase
              .from("user_credits")
              .update({
                credits: credits,
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", userId);
          }
        }
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const subscriptionId = (invoice as any).subscription as string;

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(
            subscriptionId
          );
          const userId = subscription.metadata.userId;

          if (userId) {
            await supabase
              .from("subscriptions")
              .update({
                status: "past_due",
                updated_at: new Date().toISOString(),
              })
              .eq("user_id", userId);
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Error handling webhook:", error);
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    );
  }
}
