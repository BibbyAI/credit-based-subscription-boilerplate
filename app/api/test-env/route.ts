import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function GET() {
  try {
    console.log("Environment check:");
    console.log(
      "SUPABASE_URL:",
      process.env.NEXT_PUBLIC_SUPABASE_URL ? "Set" : "Missing"
    );
    console.log(
      "SUPABASE_ANON_KEY:",
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? "Set" : "Missing"
    );

    const supabase = await createClient();

    // Test basic connection
    const { data, error } = await supabase
      .from("auth.users")
      .select("count")
      .limit(1);

    return NextResponse.json({
      success: true,
      environment: {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
      },
      connection: data ? "Connected" : "Error",
      error: error?.message,
    });
  } catch (error) {
    console.error("Environment test error:", error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
      environment: {
        supabaseUrl: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        supabaseKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        appUrl: process.env.NEXT_PUBLIC_APP_URL,
      },
    });
  }
}
