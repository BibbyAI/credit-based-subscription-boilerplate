"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export async function signup(formData: FormData) {
  const supabase = await createClient();

  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  const confirmPassword = formData.get("confirmPassword") as string;

  if (!email || !password || !confirmPassword) {
    redirect("/error?message=Please fill in all fields");
  }

  if (password !== confirmPassword) {
    redirect("/error?message=Passwords do not match");
  }

  if (password.length < 6) {
    redirect("/error?message=Password must be at least 6 characters long");
  }

  console.log("Signup attempt for:", email);

  const { data: authData, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard`,
    },
  });

  if (error) {
    console.error("Signup error:", error);
    let errorMessage = "Failed to create account";

    if (error.message.includes("User already registered")) {
      errorMessage = "An account with this email already exists";
    } else if (error.message.includes("Password should be")) {
      errorMessage = "Password does not meet requirements";
    } else if (error.message.includes("Invalid email")) {
      errorMessage = "Please enter a valid email address";
    } else {
      errorMessage = error.message;
    }

    redirect(`/error?message=${encodeURIComponent(errorMessage)}`);
  }

  console.log("Signup successful for:", authData.user?.email);

  // Try to create user_credits entry for new user
  if (authData.user) {
    try {
      await supabase.from("user_credits").insert({
        user_id: authData.user.id,
        credits: 100,
      });
      console.log("Created initial credits for new user");
    } catch (dbError) {
      console.error("Database setup error during signup:", dbError);
      // Don't block signup if database setup fails
    }
  }

  revalidatePath("/", "layout");

  if (authData.user?.email_confirmed_at) {
    redirect("/dashboard");
  } else {
    redirect(
      "/dashboard?message=Please check your email to confirm your account"
    );
  }
}
