"use server";

import { redirect } from "next/navigation";

import { getCrmContext } from "@/lib/crm/context";
import { parsePortalMembershipInput } from "@/lib/portal/validation";
import { createClient } from "@/lib/supabase/server";

function returnToAccess(kind: "linked" | "removed" | "error", value = "1"): never {
  redirect(`/portal-access?${kind}=${encodeURIComponent(value)}`);
}

export async function linkPortalAccount(formData: FormData) {
  const parsed = parsePortalMembershipInput(formData);
  if (!parsed.success) returnToAccess("error", parsed.message);

  const supabase = await createClient();
  const context = await getCrmContext(supabase);
  if (!context?.canManage || !context.brandId) returnToAccess("error", "Tu rol no permite vincular cuentas.");

  const { data: client } = await supabase
    .from("clients")
    .select("id")
    .eq("id", parsed.data.clientId)
    .eq("brand_id", context.brandId)
    .maybeSingle();

  if (!client) returnToAccess("error", "El cliente no pertenece a tu marca.");

  const { error } = await supabase.from("client_portal_memberships").upsert(
    {
      brand_id: context.brandId,
      client_id: parsed.data.clientId,
      user_id: parsed.data.userId,
      relationship: parsed.data.relationship,
      created_by: context.userId,
    },
    { onConflict: "user_id" },
  );

  if (error) returnToAccess("error", "No fue posible vincular la cuenta. Verifica que tenga el rol Cliente.");
  returnToAccess("linked");
}

export async function removePortalAccount(userId: string) {
  const supabase = await createClient();
  const context = await getCrmContext(supabase);
  if (!context || !["owner", "administrator"].includes(context.role ?? "")) {
    returnToAccess("error", "Solo un administrador puede retirar accesos.");
  }

  const { error } = await supabase
    .from("client_portal_memberships")
    .delete()
    .eq("user_id", userId)
    .eq("brand_id", context.brandId);

  if (error) returnToAccess("error", "No fue posible retirar el acceso.");
  returnToAccess("removed");
}
