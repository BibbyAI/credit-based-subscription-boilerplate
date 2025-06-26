import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    return NextResponse.json({
      success: true,
      authenticated: !!user,
      user: user
        ? {
            id: user.id,
            email: user.email,
            email_confirmed: !!user.email_confirmed_at,
            created_at: user.created_at,
          }
        : null,
      error: userError?.message || null,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
