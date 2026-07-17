"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCrmContext } from "@/lib/crm/context";
import { parseEventInput } from "@/lib/crm/validation";
import { parseMoney } from "@/lib/operations/validation";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";

function returnToEvents(kind: "created" | "error", message?: string): never {
  const query = message ? `?${kind}=${encodeURIComponent(message)}` : `?${kind}=1`;
  redirect(`/events${query}`);
}

export async function createEvent(formData: FormData) {
  const parsed = parseEventInput(formData);
  if (!parsed.success) returnToEvents("error", parsed.message);
  const totalAmount = parseMoney(formData.get("totalAmount"));
  if (!totalAmount.success) returnToEvents("error", totalAmount.message);

  const supabase = await createSupabaseClient();
  const context = await getCrmContext(supabase);

  if (!context?.canManage) {
    returnToEvents("error", "Tu rol no permite crear eventos.");
  }

  const { error } = await supabase.from("events").insert({
    brand_id: context.brandId,
    client_id: parsed.data.clientId,
    event_type: parsed.data.eventType,
    title: parsed.data.title,
    event_date: parsed.data.eventDate,
    start_time: parsed.data.startTime,
    venue: parsed.data.venue,
    city: parsed.data.city,
    package_name: parsed.data.packageName,
    status: parsed.data.status,
    notes: parsed.data.notes,
    total_amount: totalAmount.data,
  });

  if (error) returnToEvents("error", "No pudimos guardar el evento.");

  revalidatePath("/events");
  revalidatePath("/dashboard");
  returnToEvents("created");
}
