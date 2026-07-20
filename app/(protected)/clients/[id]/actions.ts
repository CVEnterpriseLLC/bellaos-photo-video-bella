"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCrmContext } from "@/lib/crm/context";
import { parseClientUpdateInput } from "@/lib/crm/validation";
import { createClient } from "@/lib/supabase/server";

function returnToClient(id: string, kind: "updated" | "error", message?: string): never {
  const query = message ? `?${kind}=${encodeURIComponent(message)}` : `?${kind}=1`;
  redirect(`/clients/${id}${query}`);
}

export async function updateClient(id: string, formData: FormData) {
  const parsed = parseClientUpdateInput(formData);
  if (!parsed.success) returnToClient(id, "error", parsed.message);

  const supabase = await createClient();
  const context = await getCrmContext(supabase);
  if (!context?.canManage) returnToClient(id, "error", "Tu rol no permite editar clientes.");

  const { error } = await supabase
    .from("clients")
    .update({
      first_name: parsed.data.firstName,
      last_name: parsed.data.lastName,
      email: parsed.data.email,
      phone: parsed.data.phone,
      address: parsed.data.address,
      city: parsed.data.city,
      preferred_language: parsed.data.preferredLanguage,
      referred_by: parsed.data.referredBy,
      notes: parsed.data.notes,
      status: parsed.data.status,
    })
    .eq("id", id)
    .eq("brand_id", context.brandId);

  if (error) returnToClient(id, "error", "No pudimos actualizar el cliente.");
  revalidatePath(`/clients/${id}`);
  revalidatePath("/clients");
  revalidatePath("/dashboard");
  returnToClient(id, "updated");
}
