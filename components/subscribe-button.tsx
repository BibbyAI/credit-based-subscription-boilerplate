"use client";

import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY!);

interface SubscribeButtonProps {
  priceId: string;
  userId: string;
  email: string;
  children: React.ReactNode;
  variant?: "default" | "outline";
  className?: string;
}

export function SubscribeButton({
  priceId,
  userId,
  email,
  children,
  variant = "default",
  className,
}: SubscribeButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    if (!userId) {
      window.location.href = "/login";
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          priceId,
          userId,
          email,
        }),
      });

      const { sessionId } = await response.json();

      if (!response.ok) {
        throw new Error("Failed to create checkout session");
      }

      const stripe = await stripePromise;
      if (!stripe) {
        throw new Error("Failed to load Stripe");
      }

      const { error } = await stripe.redirectToCheckout({
        sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleSubscribe}
      disabled={loading}
      variant={variant}
      className={className}
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processing...
        </>
      ) : (
        children
      )}
    </Button>
  );
}
