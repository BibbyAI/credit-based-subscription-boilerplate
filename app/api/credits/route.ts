import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { getUserCredits, getCreditStats } from "@/lib/credits";

export async function GET() {
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

    // Get current credits
    const credits = await getUserCredits(user.id);

    if (!credits) {
      return NextResponse.json(
        {
          success: false,
          message: "Failed to fetch credits",
        },
        { status: 500 }
      );
    }

    // Get credit statistics
    const stats = await getCreditStats(user.id);

    return NextResponse.json({
      success: true,
      data: {
        balance: credits.balance,
        lastUpdated: credits.updated_at,
        stats,
      },
    });
  } catch (error) {
    console.error("Credit check error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
