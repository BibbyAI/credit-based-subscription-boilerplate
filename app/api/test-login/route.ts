import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    const supabase = await createClient();

    console.log("Attempting login with:", { email });

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log("Login result:", {
      data: data.user?.email,
      error: error?.message,
    });

    if (error) {
      return NextResponse.json(
        {
          success: false,
          error: error.message,
        },
        { status: 400 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.user?.id,
        email: data.user?.email,
        emailConfirmed: !!data.user?.email_confirmed_at,
      },
    });
  } catch (error) {
    console.error("Test login error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Server error",
      },
      { status: 500 }
    );
  }
}
