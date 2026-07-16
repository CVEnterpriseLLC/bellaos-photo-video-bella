"use server";

import { redirect } from "next/navigation";
import { getSafeRedirect } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/server";

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = getSafeRedirect(String(formData.get("next") ?? ""));

  if (!email || password.length < 8) {
    redirect(`/login?error=invalid_input&next=${encodeURIComponent(next)}`);
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    redirect(`/login?error=invalid_credentials&next=${encodeURIComponent(next)}`);
  }

  redirect(next);
}
