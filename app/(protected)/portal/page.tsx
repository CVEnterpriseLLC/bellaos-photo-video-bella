import Link from "next/link";
import { redirect } from "next/navigation";

import { calculateBalance, calculateProgress, formatPortalDate } from "@/lib/portal/summary";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../actions";
import styles from "./portal.module.css";

type ClientRecord = {
  first_name: string;
  last_name: string | null;
  email: string | null;
  phone: string | null;
  preferred_language: string;
};

type Membership = {
  client_id: string;
  relationship: string;
  clients: ClientRecord | null;
};

type PortalEvent = {
  id: string;
  title: string | null;
  event_type: string;
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
  payments: Array<{
    amount: number;
    payment_date: string;
    method: string;
  }>;
  production_tasks: Array<{
    id: string;
    title: string;
    category: string;
    is_completed: boolean;
    sort_order: number;
  }>;
};

const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const productionLabels: Record<string, string> = {
  planning: "Planeación",
  scheduled: "Programado",
  captured: "Evento realizado",
  editing: "En edición",
  review: "Revisión final",
  delivered: "Entregado",
};

const paymentLabels: Record<string, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  check: "Cheque",
  bank_transfer: "Transferencia",
  zelle: "Zelle",
  paypal: "PayPal",
  other: "Otro",
};

export default async function ClientPortalPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profileData } = await supabase
    .from("profiles")
    .select("full_name,roles(slug)")
    .eq("id", user!.id)
    .maybeSingle();

  const profile = profileData as {
    full_name: string | null;
    roles: { slug: string } | null;
  } | null;

  if (profile?.roles?.slug !== "client") {
    redirect("/dashboard");
  }

  const { data: membershipData } = await supabase
    .from("client_portal_memberships")
    .select("client_id,relationship,clients(first_name,last_name,email,phone,preferred_language)")
    .eq("user_id", user!.id)
    .maybeSingle();

  const membership = membershipData as Membership | null;
  const client = membership?.clients ?? null;

  const { data: eventData } = membership
    ? await supabase
        .from("events")
        .select(
          "id,title,event_type,event_date,start_time,venue,city,package_name,total_amount,status,production_status,picflow_gallery_url,gallery_status,payments(amount,payment_date,method),production_tasks(id,title,category,is_completed,sort_order)",
        )
        .eq("client_id", membership.client_id)
        .order("event_date", { ascending: true })
    : { data: [] };

  const events = (eventData ?? []) as PortalEvent[];
  const currentEvent = events.find((event) => event.status !== "cancelled") ?? events[0];
  const firstName = client?.first_name || profile.full_name?.split(" ")[0] || "cliente";

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <Link href="/portal" className={styles.brand}>
          <span aria-hidden="true">✦</span> BellaOS
        </Link>
        <form action={signOut}>
          <button type="submit" className={styles.signOut}>Cerrar sesión</button>
        </form>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>Portal privado · Photo Video Bella</p>
        <h1>Hola, {firstName}</h1>
        <p>Consulta el estado de tu evento, tus pagos y las etapas de entrega en un solo lugar.</p>
      </section>

      {!membership || !client ? (
        <section className={styles.emptyState} role="status">
          <span aria-hidden="true">✦</span>
          <div>
            <h2>Estamos preparando tu portal</h2>
            <p>Tu cuenta ya está activa. Photo Video Bella debe vincularla con tu evento antes de mostrar la información.</p>
          </div>
        </section>
      ) : events.length === 0 ? (
        <section className={styles.emptyState} role="status">
          <span aria-hidden="true">✦</span>
          <div>
            <h2>Tu cuenta está conectada</h2>
            <p>Aún no hay eventos disponibles. Cuando el equipo termine la configuración aparecerán aquí.</p>
          </div>
        </section>
      ) : (
        <>
          {currentEvent ? <EventOverview event={currentEvent} /> : null}
          {events.length > 1 ? (
            <section className={styles.otherEvents} aria-labelledby="other-events-title">
              <p className={styles.eyebrow}>Historial</p>
              <h2 id="other-events-title">Todos tus eventos</h2>
              <div className={styles.eventList}>
                {events.map((event) => (
                  <article className={styles.eventRow} key={event.id}>
                    <div>
                      <strong>{event.title || event.event_type}</strong>
                      <span>{formatPortalDate(event.event_date)}</span>
                    </div>
                    <span className={styles.status}>{productionLabels[event.production_status] ?? event.production_status}</span>
                  </article>
                ))}
              </div>
            </section>
          ) : null}
        </>
      )}

      <footer className={styles.footer}>
        <p>¿Necesitas ayuda? Contacta a Photo Video Bella desde tu canal habitual.</p>
        <span>Tu información está protegida y solo es visible para tu cuenta.</span>
      </footer>
    </main>
  );
}

function EventOverview({ event }: { event: PortalEvent }) {
  const { paid, balance } = calculateBalance(event.total_amount, event.payments);
  const progress = calculateProgress(event.production_tasks);

  return (
    <>
      <section className={styles.eventHero} aria-labelledby="event-title">
        <div>
          <p className={styles.eyebrow}>{event.event_type}</p>
          <h2 id="event-title">{event.title || "Mi evento"}</h2>
          <p className={styles.eventDate}>{formatPortalDate(event.event_date)}</p>
          {event.venue || event.city ? <p className={styles.location}>{[event.venue, event.city].filter(Boolean).join(" · ")}</p> : null}
        </div>
        <span className={styles.status}>{productionLabels[event.production_status] ?? event.production_status}</span>
      </section>

      <section className={styles.summaryGrid} aria-label="Resumen del evento">
        <article><span>Paquete</span><strong>{event.package_name || "Por confirmar"}</strong></article>
        <article><span>Total</span><strong>{money.format(Number(event.total_amount))}</strong></article>
        <article><span>Pagado</span><strong>{money.format(paid)}</strong></article>
        <article><span>Saldo</span><strong>{money.format(balance)}</strong></article>
      </section>

      {event.picflow_gallery_url ? (
        <section className={styles.galleryCard} aria-labelledby="gallery-title">
          <div>
            <p className={styles.eyebrow}>Entrega de fotografías</p>
            <h2 id="gallery-title">Tu galería está disponible</h2>
            <p>Abre Picflow para revisar, seleccionar o descargar tus fotografías.</p>
          </div>
          <a href={event.picflow_gallery_url} target="_blank" rel="noopener noreferrer" className={styles.galleryButton}>
            Ver mi galería ↗
          </a>
        </section>
      ) : null}

      <div className={styles.columns}>
        <section className={styles.panel} aria-labelledby="progress-title">
          <p className={styles.eyebrow}>Progreso</p>
          <div className={styles.panelHeading}>
            <h2 id="progress-title">Tu proyecto</h2>
            <strong>{progress}%</strong>
          </div>
          <div className={styles.progressTrack} aria-label={`${progress}% completado`}>
            <span style={{ width: `${progress}%` }} />
          </div>
          <div className={styles.timeline}>
            {event.production_tasks.length ? event.production_tasks.map((task) => (
              <article className={task.is_completed ? styles.stepDone : styles.step} key={task.id}>
                <span aria-hidden="true">{task.is_completed ? "✓" : ""}</span>
                <div><strong>{task.title}</strong><small>{task.is_completed ? "Completado" : "En proceso"}</small></div>
              </article>
            )) : <p className={styles.muted}>El equipo está preparando las etapas visibles de tu proyecto.</p>}
          </div>
        </section>

        <section className={styles.panel} aria-labelledby="payments-title">
          <p className={styles.eyebrow}>Finanzas</p>
          <h2 id="payments-title">Historial de pagos</h2>
          <div className={styles.payments}>
            {event.payments.length ? event.payments.map((payment, index) => (
              <article key={`${payment.payment_date}-${payment.amount}-${index}`}>
                <div><strong>{money.format(Number(payment.amount))}</strong><span>{paymentLabels[payment.method] ?? payment.method}</span></div>
                <time dateTime={payment.payment_date}>{formatPortalDate(payment.payment_date)}</time>
              </article>
            )) : <p className={styles.muted}>Aún no hay pagos registrados para este evento.</p>}
          </div>
        </section>
      </div>
    </>
  );
}
