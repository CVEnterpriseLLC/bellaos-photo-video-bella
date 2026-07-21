import Link from "next/link";
import { notFound } from "next/navigation";
import { getCrmContext } from "@/lib/crm/context";
import { createClient } from "@/lib/supabase/server";
import { addPayment, addProductionTask, toggleProductionTask, updateEvent, updatePicflowGallery } from "./actions";
import styles from "../../crm.module.css";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ updated?: string; payment?: string; task?: string; gallery?: string; error?: string }>;

type EventDetail = {
  id: string;
  client_id: string;
  event_type: string;
  title: string | null;
  event_date: string;
  start_time: string | null;
  venue: string | null;
  city: string | null;
  package_name: string | null;
  total_amount: number;
  status: string;
  production_status: string;
  picflow_gallery_url: string | null;
  gallery_status: string;
  notes: string | null;
  clients: { first_name: string; last_name: string | null } | null;
};

const money = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const paymentMethods: Record<string, string> = {
  cash: "Efectivo", card: "Tarjeta", check: "Cheque", bank_transfer: "Transferencia",
  zelle: "Zelle", paypal: "PayPal", other: "Otro",
};
const categoryLabels: Record<string, string> = {
  planning: "Planeación", capture: "Evento", postproduction: "Postproducción", delivery: "Entrega",
};
const galleryLabels: Record<string, string> = {
  preparing: "Preparando", proofing: "En revisión", delivered: "Entregada",
};

export default async function EventDetailPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const context = await getCrmContext(supabase);
  const [{ data: eventData }, { data: clients }, { data: payments }, { data: tasks }] = await Promise.all([
    supabase.from("events").select("*,clients(first_name,last_name)").eq("id", id).maybeSingle(),
    supabase.from("clients").select("id,first_name,last_name").order("first_name"),
    supabase.from("payments").select("id,amount,payment_date,method,reference,notes").eq("event_id", id).order("payment_date", { ascending: false }),
    supabase.from("production_tasks").select("id,title,category,due_date,is_completed,sort_order").eq("event_id", id).order("sort_order").order("created_at"),
  ]);

  if (!eventData) notFound();
  const event = eventData as EventDetail;
  const paid = (payments ?? []).reduce((sum, payment) => sum + Number(payment.amount), 0);
  const balance = Math.max(Number(event.total_amount) - paid, 0);
  const completed = (tasks ?? []).filter((task) => task.is_completed).length;
  const progress = tasks?.length ? Math.round((completed / tasks.length) * 100) : 0;
  const updateAction = updateEvent.bind(null, event.id);
  const paymentAction = addPayment.bind(null, event.id);
  const taskAction = addProductionTask.bind(null, event.id);
  const galleryAction = updatePicflowGallery.bind(null, event.id);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className={styles.page}>
      <nav className={styles.topbar} aria-label="Navegación principal">
        <Link href="/dashboard" className={styles.brand}>✦ BellaOS</Link>
        <div className={styles.nav}><Link href="/events" className={styles.navLink}>← Eventos</Link><Link href="/clients" className={styles.navLink}>Clientes</Link></div>
      </nav>

      <header className={styles.intro}>
        <p className={styles.eyebrow}>Proyecto · {event.event_type}</p>
        <div className={styles.titleRow}>
          <h1>{event.title || `${event.event_type} de ${event.clients?.first_name ?? "cliente"}`}</h1>
          <span className={styles.count}>{event.production_status}</span>
        </div>
      </header>

      {query.updated ? <p className={styles.notice} role="status">Evento actualizado correctamente.</p> : null}
      {query.payment ? <p className={styles.notice} role="status">Pago registrado correctamente.</p> : null}
      {query.task ? <p className={styles.notice} role="status">Checklist actualizado.</p> : null}
      {query.gallery ? <p className={styles.notice} role="status">Galería de Picflow actualizada.</p> : null}
      {query.error ? <p className={styles.error} role="alert">{query.error}</p> : null}

      <section className={styles.summaryGrid} aria-label="Resumen financiero y de producción">
        <article className={styles.summaryCard}><span>Total contratado</span><strong>{money.format(Number(event.total_amount))}</strong></article>
        <article className={styles.summaryCard}><span>Pagado</span><strong>{money.format(paid)}</strong></article>
        <article className={styles.summaryCard}><span>Saldo pendiente</span><strong>{money.format(balance)}</strong></article>
        <article className={styles.summaryCard}><span>Producción</span><strong>{progress}%</strong></article>
      </section>

      <div className={styles.detailGrid}>
        <section className={styles.panel} aria-labelledby="edit-event-title">
          <p className={styles.eyebrow}>Información</p><h2 id="edit-event-title">Editar evento</h2>
          {context?.canManage ? (
            <form action={updateAction} className={styles.form}>
              <div className={styles.field}><label htmlFor="clientId">Cliente *</label><select id="clientId" name="clientId" required defaultValue={event.client_id}>{clients?.map((client) => <option value={client.id} key={client.id}>{client.first_name} {client.last_name ?? ""}</option>)}</select></div>
              <div className={styles.formGrid}>
                <div className={styles.field}><label htmlFor="eventType">Tipo *</label><input id="eventType" name="eventType" required defaultValue={event.event_type} /></div>
                <div className={styles.field}><label htmlFor="title">Nombre del evento</label><input id="title" name="title" defaultValue={event.title ?? ""} /></div>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}><label htmlFor="eventDate">Fecha *</label><input id="eventDate" name="eventDate" type="date" required defaultValue={event.event_date} /></div>
                <div className={styles.field}><label htmlFor="startTime">Hora</label><input id="startTime" name="startTime" type="time" defaultValue={event.start_time?.slice(0, 5) ?? ""} /></div>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}><label htmlFor="venue">Lugar</label><input id="venue" name="venue" defaultValue={event.venue ?? ""} /></div>
                <div className={styles.field}><label htmlFor="city">Ciudad</label><input id="city" name="city" defaultValue={event.city ?? ""} /></div>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}><label htmlFor="packageName">Paquete</label><input id="packageName" name="packageName" defaultValue={event.package_name ?? ""} /></div>
                <div className={styles.field}><label htmlFor="totalAmount">Total contratado</label><input id="totalAmount" name="totalAmount" type="number" min="0" step="0.01" defaultValue={event.total_amount} /></div>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}><label htmlFor="status">Estado comercial</label><select id="status" name="status" defaultValue={event.status}><option value="lead">Lead</option><option value="confirmed">Confirmado</option><option value="completed">Completado</option><option value="cancelled">Cancelado</option></select></div>
                <div className={styles.field}><label htmlFor="productionStatus">Producción</label><select id="productionStatus" name="productionStatus" defaultValue={event.production_status}><option value="planning">Planeación</option><option value="scheduled">Programado</option><option value="captured">Evento realizado</option><option value="editing">Edición</option><option value="review">Revisión</option><option value="delivered">Entregado</option></select></div>
              </div>
              <div className={styles.field}><label htmlFor="notes">Notas</label><textarea id="notes" name="notes" defaultValue={event.notes ?? ""} /></div>
              <button type="submit" className={styles.submit}>Guardar evento</button>
            </form>
          ) : <p className={styles.empty}>Tu rol tiene acceso de lectura a la información comercial.</p>}
        </section>

        <div className={styles.stack}>
          <section className={styles.panel} aria-labelledby="gallery-title">
            <p className={styles.eyebrow}>Entrega digital</p><h2 id="gallery-title">Galería Picflow</h2>
            {context?.canManage ? (
              <form action={galleryAction} className={styles.form}>
                <div className={styles.field}>
                  <label htmlFor="picflowGalleryUrl">Enlace de la galería</label>
                  <input
                    id="picflowGalleryUrl"
                    name="picflowGalleryUrl"
                    type="url"
                    inputMode="url"
                    placeholder="https://galleryphotovideobella.com/..."
                    defaultValue={event.picflow_gallery_url ?? ""}
                  />
                </div>
                <div className={styles.field}>
                  <label htmlFor="galleryStatus">Estado</label>
                  <select id="galleryStatus" name="galleryStatus" defaultValue={event.gallery_status}>
                    <option value="preparing">Preparando</option>
                    <option value="proofing">En revisión</option>
                    <option value="delivered">Entregada</option>
                  </select>
                </div>
                <button type="submit" className={styles.submit}>{event.picflow_gallery_url ? "Actualizar galería" : "Vincular galería"}</button>
              </form>
            ) : null}
            {event.picflow_gallery_url ? (
              <div className={styles.gallerySummary}>
                <span className={styles.status}>{galleryLabels[event.gallery_status] ?? event.gallery_status}</span>
                <a className={styles.secondaryButton} href={event.picflow_gallery_url} target="_blank" rel="noopener noreferrer">Abrir galería ↗</a>
              </div>
            ) : <p className={styles.empty}>Pega el enlace compartido de Picflow para mostrarlo en el portal del cliente.</p>}
          </section>

          <section className={styles.panel} aria-labelledby="payments-title">
            <p className={styles.eyebrow}>Finanzas</p><h2 id="payments-title">Pagos</h2>
            {context?.canManagePayments ? (
              <form action={paymentAction} className={styles.form}>
                <div className={styles.formGrid}><div className={styles.field}><label htmlFor="amount">Cantidad *</label><input id="amount" name="amount" type="number" min="0.01" step="0.01" required /></div><div className={styles.field}><label htmlFor="paymentDate">Fecha *</label><input id="paymentDate" name="paymentDate" type="date" required defaultValue={today} /></div></div>
                <div className={styles.formGrid}><div className={styles.field}><label htmlFor="method">Método</label><select id="method" name="method" defaultValue="zelle"><option value="zelle">Zelle</option><option value="cash">Efectivo</option><option value="card">Tarjeta</option><option value="check">Cheque</option><option value="bank_transfer">Transferencia</option><option value="paypal">PayPal</option><option value="other">Otro</option></select></div><div className={styles.field}><label htmlFor="reference">Referencia</label><input id="reference" name="reference" /></div></div>
                <div className={styles.field}><label htmlFor="paymentNotes">Notas</label><input id="paymentNotes" name="paymentNotes" /></div>
                <button type="submit" className={styles.submit}>Registrar pago</button>
              </form>
            ) : null}
            <div className={styles.list}>{payments?.length ? payments.map((payment) => <article className={styles.payment} key={payment.id}><div><strong>{money.format(Number(payment.amount))}</strong><span>{payment.payment_date} · {paymentMethods[payment.method] ?? payment.method}</span></div>{payment.reference ? <span>Ref. {payment.reference}</span> : null}</article>) : <p className={styles.empty}>Aún no hay pagos registrados.</p>}</div>
          </section>

          <section className={styles.panel} aria-labelledby="production-title">
            <p className={styles.eyebrow}>Flujo operativo</p><h2 id="production-title">Checklist de producción</h2>
            <div className={styles.progressTrack} aria-label={`${progress}% completado`}><span style={{ width: `${progress}%` }} /></div>
            <p className={styles.progressLabel}>{completed} de {tasks?.length ?? 0} tareas completadas</p>
            <div className={styles.taskList}>{tasks?.map((task) => {
              const toggleAction = toggleProductionTask.bind(null, event.id, task.id);
              return <article className={`${styles.task} ${task.is_completed ? styles.taskDone : ""}`} key={task.id}><div><span className={styles.taskCategory}>{categoryLabels[task.category] ?? task.category}</span><strong>{task.title}</strong>{task.due_date ? <small>Vence {task.due_date}</small> : null}</div>{context?.canManageProduction ? <form action={toggleAction}><input type="hidden" name="isCompleted" value={String(!task.is_completed)} /><button type="submit" className={styles.taskButton}>{task.is_completed ? "Reabrir" : "Completar"}</button></form> : null}</article>;
            })}</div>
            {context?.canManageProduction ? <form action={taskAction} className={styles.form}><div className={styles.field}><label htmlFor="taskTitle">Nueva tarea</label><input id="taskTitle" name="taskTitle" required minLength={2} maxLength={160} /></div><div className={styles.formGrid}><div className={styles.field}><label htmlFor="category">Categoría</label><select id="category" name="category"><option value="planning">Planeación</option><option value="capture">Evento</option><option value="postproduction">Postproducción</option><option value="delivery">Entrega</option></select></div><div className={styles.field}><label htmlFor="dueDate">Fecha límite</label><input id="dueDate" name="dueDate" type="date" /></div></div><button type="submit" className={styles.secondaryButton}>Agregar tarea</button></form> : null}
          </section>
        </div>
      </div>
    </main>
  );
}
