"use server";

import { redirect } from "next/navigation";
import { isValidPassword } from "@/lib/auth/password";
import { createClient } from "@/lib/supabase/server";

export async function updatePassword(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  const confirmation = String(formData.get("password_confirmation") ?? "");

  if (!isValidPassword(password)) {
    redirect("/update-password?error=invalid_password");
  }

  if (password !== confirmation) {
    redirect("/update-password?error=password_mismatch");
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?error=invalid_invitation");
  }

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    redirect("/update-password?error=update_failed");
  }

  redirect("/dashboard");
}
