"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getCrmContext } from "@/lib/crm/context";
import { parseEventInput } from "@/lib/crm/validation";
import { parseMoney, parsePaymentInput, parseProductionTaskInput } from "@/lib/operations/validation";
import { createClient } from "@/lib/supabase/server";

type ResultKind = "updated" | "payment" | "task" | "error";

function returnToEvent(id: string, kind: ResultKind, message?: string): never {
  const query = message ? `?${kind}=${encodeURIComponent(message)}` : `?${kind}=1`;
  redirect(`/events/${id}${query}`);
}

function revalidateEvent(id: string) {
  revalidatePath(`/events/${id}`);
  revalidatePath("/events");
  revalidatePath("/dashboard");
}

export async function updateEvent(id: string, formData: FormData) {
  const parsed = parseEventInput(formData);
  if (!parsed.success) returnToEvent(id, "error", parsed.message);
  const totalAmount = parseMoney(formData.get("totalAmount"));
  if (!totalAmount.success) returnToEvent(id, "error", totalAmount.message);

  const productionStatus = String(formData.get("productionStatus") ?? "planning");
  const productionStatuses = ["planning", "scheduled", "captured", "editing", "review", "delivered"];
  if (!productionStatuses.includes(productionStatus)) {
    returnToEvent(id, "error", "El estado de producción no es válido.");
  }

  const supabase = await createClient();
  const context = await getCrmContext(supabase);
  if (!context?.canManage) returnToEvent(id, "error", "Tu rol no permite editar eventos.");

  const { error } = await supabase
    .from("events")
    .update({
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
      production_status: productionStatus,
    })
    .eq("id", id)
    .eq("brand_id", context.brandId);

  if (error) returnToEvent(id, "error", "No pudimos actualizar el evento.");
  revalidateEvent(id);
  returnToEvent(id, "updated");
}

export async function addPayment(id: string, formData: FormData) {
  const parsed = parsePaymentInput(formData);
  if (!parsed.success) returnToEvent(id, "error", parsed.message);

  const supabase = await createClient();
  const context = await getCrmContext(supabase);
  if (!context?.canManagePayments) returnToEvent(id, "error", "Tu rol no permite registrar pagos.");

  const { error } = await supabase.from("payments").insert({
    brand_id: context.brandId,
    event_id: id,
    amount: parsed.data.amount,
    payment_date: parsed.data.paymentDate,
    method: parsed.data.method,
    reference: parsed.data.reference,
    notes: parsed.data.notes,
    created_by: context.userId,
  });

  if (error) returnToEvent(id, "error", "No pudimos registrar el pago.");
  revalidateEvent(id);
  returnToEvent(id, "payment");
}

export async function addProductionTask(id: string, formData: FormData) {
  const parsed = parseProductionTaskInput(formData);
  if (!parsed.success) returnToEvent(id, "error", parsed.message);

  const supabase = await createClient();
  const context = await getCrmContext(supabase);
  if (!context?.canManageProduction) returnToEvent(id, "error", "Tu rol no permite crear tareas.");

  const { error } = await supabase.from("production_tasks").insert({
    brand_id: context.brandId,
    event_id: id,
    title: parsed.data.title,
    category: parsed.data.category,
    due_date: parsed.data.dueDate,
    sort_order: 100,
  });

  if (error) returnToEvent(id, "error", "No pudimos crear la tarea.");
  revalidateEvent(id);
  returnToEvent(id, "task");
}

export async function toggleProductionTask(eventId: string, taskId: string, formData: FormData) {
  const nextState = formData.get("isCompleted") === "true";
  const supabase = await createClient();
  const context = await getCrmContext(supabase);
  if (!context?.canManageProduction) returnToEvent(eventId, "error", "Tu rol no permite actualizar tareas.");

  const { error } = await supabase
    .from("production_tasks")
    .update({
      is_completed: nextState,
      completed_at: nextState ? new Date().toISOString() : null,
      completed_by: nextState ? context.userId : null,
    })
    .eq("id", taskId)
    .eq("event_id", eventId)
    .eq("brand_id", context.brandId);

  if (error) returnToEvent(eventId, "error", "No pudimos actualizar la tarea.");
  revalidateEvent(eventId);
  returnToEvent(eventId, "task");
}
