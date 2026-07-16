import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { getSafeRedirect } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

const allowedOtpTypes = new Set<EmailOtpType>(["invite", "recovery"]);

function isAllowedOtpType(value: string | null): value is EmailOtpType {
  return value !== null && allowedOtpTypes.has(value as EmailOtpType);
}

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const tokenHash = requestUrl.searchParams.get("token_hash");
  const type = requestUrl.searchParams.get("type");
  const next = getSafeRedirect(
    requestUrl.searchParams.get("next") ?? "/update-password",
  );

  if (tokenHash && isAllowedOtpType(type) && isSupabaseConfigured()) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });

    if (!error) {
      return NextResponse.redirect(new URL(next, requestUrl.origin));
    }
  }

  return NextResponse.redirect(
    new URL("/login?error=invalid_invitation", requestUrl.origin),
  );
}
