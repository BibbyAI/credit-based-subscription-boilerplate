"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function login(formData: FormData) {
  const supabase = await createClient();

  const data = {
    email: formData.get("email") as string,
    password: formData.get("password") as string,
  };

  if (!data.email || !data.password) {
    redirect("/error?message=Please fill in all fields");
  }

  console.log("Login attempt for:", data.email);

  const { data: authData, error } = await supabase.auth.signInWithPassword(
    data
  );

  if (error) {
    console.error("Login error:", error);
    let errorMessage = "Authentication failed";

    if (error.message.includes("Invalid login credentials")) {
      errorMessage = "Invalid email or password";
    } else if (error.message.includes("Email not confirmed")) {
      errorMessage = "Please check your email and click the confirmation link";
    } else if (error.message.includes("Too many requests")) {
      errorMessage = "Too many attempts. Please try again later";
    } else {
      errorMessage = error.message;
    }

    redirect(`/error?message=${encodeURIComponent(errorMessage)}`);
  }

  console.log("Login successful for:", authData.user?.email);

  // Check if user_credits table exists and create entry if needed
  if (authData.user) {
    try {
      const { data: existingCredits, error: creditsError } = await supabase
        .from("user_credits")
        .select("credits")
        .eq("user_id", authData.user.id)
        .single();

      if (creditsError && creditsError.code === "PGRST116") {
        // User doesn't have credits entry, create one
        await supabase.from("user_credits").insert({
          user_id: authData.user.id,
          credits: 100,
        });
        console.log("Created initial credits for user");
      }
    } catch (dbError) {
      console.error("Database setup error:", dbError);
      // Don't block login if database setup fails
    }
  }

  revalidatePath("/", "layout");
  redirect("/dashboard");
}
