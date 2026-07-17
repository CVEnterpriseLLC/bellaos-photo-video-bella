import Link from "next/link";
import { getCrmContext } from "@/lib/crm/context";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { createEvent } from "./actions";
import styles from "../crm.module.css";

type SearchParams = Promise<{ created?: string; error?: string }>;

type EventRow = {
  id: string;
  event_type: string;
  title: string | null;
  event_date: string;
  start_time: string | null;
  venue: string | null;
  city: string | null;
  status: string;
  clients: { first_name: string; last_name: string | null } | null;
};

const dateFormatter = new Intl.DateTimeFormat("es-US", {
  dateStyle: "medium",
  timeZone: "UTC",
});

export default async function EventsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createSupabaseClient();
  const context = await getCrmContext(supabase);
  const [{ data: clients }, { data }] = await Promise.all([
    supabase.from("clients").select("id,first_name,last_name").order("first_name"),
    supabase
      .from("events")
      .select("id,event_type,title,event_date,start_time,venue,city,status,clients(first_name,last_name)")
      .order("event_date", { ascending: true })
      .order("start_time", { ascending: true }),
  ]);
  const events = data as EventRow[] | null;

  return (
    <main className={styles.page}>
      <nav className={styles.topbar} aria-label="Navegación principal">
        <Link href="/dashboard" className={styles.brand}>✦ BellaOS</Link>
        <div className={styles.nav}>
          <Link href="/dashboard" className={styles.navLink}>Dashboard</Link>
          <Link href="/clients" className={styles.navLink}>Clientes</Link>
          <Link href="/events" className={styles.navLink}>Eventos</Link>
        </div>
      </nav>

      <header className={styles.intro}>
        <p className={styles.eyebrow}>Agenda operativa</p>
        <div className={styles.titleRow}>
          <h1>Eventos</h1>
          <span className={styles.count}>{events?.length ?? 0} programados</span>
        </div>
      </header>

      {params.created ? <p className={styles.notice} role="status">Evento guardado correctamente.</p> : null}
      {params.error ? <p className={styles.error} role="alert">{params.error}</p> : null}

      <div className={styles.content}>
        <section className={styles.panel} aria-labelledby="new-event-title">
          <p className={styles.eyebrow}>Nueva agenda</p>
          <h2 id="new-event-title">Crear evento</h2>
          {!clients?.length ? (
            <p className={styles.empty}>Primero debes registrar un cliente.</p>
          ) : context?.canManage ? (
            <form action={createEvent} className={styles.form}>
              <div className={styles.field}>
                <label htmlFor="clientId">Cliente *</label>
                <select id="clientId" name="clientId" required defaultValue="">
                  <option value="" disabled>Selecciona un cliente</option>
                  {clients.map((client) => (
                    <option value={client.id} key={client.id}>
                      {client.first_name} {client.last_name ?? ""}
                    </option>
                  ))}
                </select>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="eventType">Tipo *</label>
                  <select id="eventType" name="eventType" required defaultValue="Quinceañera">
                    <option>Quinceañera</option>
                    <option>Wedding</option>
                    <option>Graduation</option>
                    <option>Corporate</option>
                    <option>Photo Session</option>
                    <option>Otro</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="status">Estado</label>
                  <select id="status" name="status" defaultValue="confirmed">
                    <option value="lead">Lead</option>
                    <option value="confirmed">Confirmado</option>
                    <option value="completed">Completado</option>
                    <option value="cancelled">Cancelado</option>
                  </select>
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="title">Nombre del evento</label>
                <input id="title" name="title" placeholder="Quinceañera de Ashley" />
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="eventDate">Fecha *</label>
                  <input id="eventDate" name="eventDate" type="date" required />
                </div>
                <div className={styles.field}>
                  <label htmlFor="startTime">Hora</label>
                  <input id="startTime" name="startTime" type="time" />
                </div>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="venue">Lugar</label>
                  <input id="venue" name="venue" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="city">Ciudad</label>
                  <input id="city" name="city" defaultValue="Houston" />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="packageName">Paquete</label>
                <input id="packageName" name="packageName" />
              </div>
              <div className={styles.field}>
                <label htmlFor="notes">Notas</label>
                <textarea id="notes" name="notes" />
              </div>
              <button type="submit" className={styles.submit}>Guardar evento</button>
            </form>
          ) : (
            <p className={styles.empty}>Tu rol tiene acceso de lectura a la agenda.</p>
          )}
        </section>

        <section className={styles.panel} aria-labelledby="event-list-title">
          <div className={styles.listHeader}>
            <div>
              <p className={styles.eyebrow}>Calendario</p>
              <h2 id="event-list-title">Próximos eventos</h2>
            </div>
          </div>
          <div className={styles.list}>
            {events?.length ? events.map((event) => (
              <article className={styles.event} key={event.id}>
                <strong>{event.title || event.event_type}</strong>
                <div className={styles.eventMeta}>
                  <span>{dateFormatter.format(new Date(`${event.event_date}T00:00:00Z`))}</span>
                  {event.start_time ? <span>{event.start_time.slice(0, 5)}</span> : null}
                  <span>{event.clients?.first_name} {event.clients?.last_name ?? ""}</span>
                  {event.venue ? <span>{event.venue}</span> : null}
                  {event.city ? <span>{event.city}</span> : null}
                </div>
                <span className={styles.status}>{event.status}</span>
              </article>
            )) : <p className={styles.empty}>Aún no hay eventos programados.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
