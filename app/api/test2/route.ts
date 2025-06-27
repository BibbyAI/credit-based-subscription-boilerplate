import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { consumeCredits } from "@/lib/credits";

const NOTIFICATION_CREDIT_COST = 5; // Cost 5 credits to send a notification

export async function POST() {
  try {
    // Get the authenticated user
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: "Authentication required",
        },
        { status: 401 }
      );
    }

    // Check and consume credits
    const creditResult = await consumeCredits(
      user.id,
      NOTIFICATION_CREDIT_COST,
      "Notification sending"
    );

    if (!creditResult.success) {
      return NextResponse.json(
        {
          success: false,
          message: creditResult.message,
          balance: creditResult.balance,
        },
        { status: 402 } // Payment Required
      );
    }

    // Simulate some processing
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Randomly succeed or fail for demonstration
    const shouldSucceed = Math.random() > 0.3;

    if (shouldSucceed) {
      return NextResponse.json({
        success: true,
        message: `Notification sent successfully (${NOTIFICATION_CREDIT_COST} credits used)`,
        timestamp: new Date().toISOString(),
        creditsUsed: NOTIFICATION_CREDIT_COST,
        remainingBalance: creditResult.balance,
      });
    } else {
      // If the operation fails, we should refund the credits
      // Note: In a real application, you might want to implement a refund mechanism
      return NextResponse.json(
        {
          success: false,
          message: "Notification delivery failed",
          error: "Service temporarily unavailable",
          note: "Credits were consumed but operation failed. Contact support for refund.",
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error("Notification system error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Notification system error",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
