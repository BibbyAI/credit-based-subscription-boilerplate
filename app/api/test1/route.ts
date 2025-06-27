import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { consumeCredits } from "@/lib/credits";

const REPORT_CREDIT_COST = 10; // Cost 10 credits to generate a report

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
      REPORT_CREDIT_COST,
      "Monthly report generation"
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
    await new Promise((resolve) => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: `Monthly report generated successfully (${REPORT_CREDIT_COST} credits used)`,
      timestamp: new Date().toISOString(),
      creditsUsed: REPORT_CREDIT_COST,
      remainingBalance: creditResult.balance,
    });
  } catch (error) {
    console.error("Report generation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Report generation failed",
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
