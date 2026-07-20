import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

const CRM_WRITE_ROLES = new Set(["owner", "administrator", "sales"]);
const PRODUCTION_WRITE_ROLES = new Set([
  "owner",
  "administrator",
  "photographer",
  "videographer",
  "editor",
]);

type ProfileContext = {
  brand_id: string | null;
  roles: { slug: string } | null;
};

export async function getCrmContext(supabase: SupabaseClient<Database>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("brand_id,roles(slug)")
    .eq("id", user.id)
    .maybeSingle();

  const profile = data as ProfileContext | null;
  if (!profile?.brand_id) return null;

  return {
    userId: user.id,
    brandId: profile.brand_id,
    role: profile.roles?.slug ?? null,
    canManage: CRM_WRITE_ROLES.has(profile.roles?.slug ?? ""),
    canManagePayments: CRM_WRITE_ROLES.has(profile.roles?.slug ?? ""),
    canManageProduction: PRODUCTION_WRITE_ROLES.has(profile.roles?.slug ?? ""),
  };
}
