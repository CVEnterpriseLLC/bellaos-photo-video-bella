"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCrmContext } from "@/lib/crm/context";
import { parseClientInput } from "@/lib/crm/validation";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

function returnToClients(kind: "created" | "error", message?: string): never {
  const query = message ? `?${kind}=${encodeURIComponent(message)}` : `?${kind}=1`;
  redirect(`/clients${query}`);
}

export async function createClient(formData: FormData) {
  const parsed = parseClientInput(formData);
  if (!parsed.success) returnToClients("error", parsed.message);

  const supabase = await createSupabaseClient();
  const context = await getCrmContext(supabase);

  if (!context?.canManage) {
    returnToClients("error", "Tu rol no permite crear clientes.");
  }

  const { error } = await supabase.from("clients").insert({
    brand_id: context.brandId,
    first_name: parsed.data.firstName,
    last_name: parsed.data.lastName,
    email: parsed.data.email,
    phone: parsed.data.phone,
    address: parsed.data.address,
    city: parsed.data.city,
    preferred_language: parsed.data.preferredLanguage,
    referred_by: parsed.data.referredBy,
    notes: parsed.data.notes,
    status: "lead",
  });

  if (error) returnToClients("error", "No pudimos guardar el cliente.");

  revalidatePath("/clients");
  revalidatePath("/dashboard");
  returnToClients("created");
}
