"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ManageSubscriptionButtonProps {
  userId: string;
}

export function ManageSubscriptionButton({
  userId,
}: ManageSubscriptionButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleManageSubscription = async () => {
    setLoading(true);

    try {
      const response = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId }),
      });

      const { url } = await response.json();

      if (!response.ok) {
        throw new Error("Failed to create portal session");
      }

      window.location.href = url;
    } catch (error) {
      console.error("Error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleManageSubscription}
      disabled={loading}
      variant="outline"
    >
      {loading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Loading...
        </>
      ) : (
        "Manage Subscription"
      )}
    </Button>
  );
}
