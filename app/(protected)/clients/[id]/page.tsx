import Link from "next/link";
import { notFound } from "next/navigation";
import { getCrmContext } from "@/lib/crm/context";
import { createClient } from "@/lib/supabase/server";
import { updateClient } from "./actions";
import styles from "../../crm.module.css";

type Params = Promise<{ id: string }>;
type SearchParams = Promise<{ updated?: string; error?: string }>;

export default async function ClientDetailPage({ params, searchParams }: { params: Params; searchParams: SearchParams }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const context = await getCrmContext(supabase);
  const [{ data: client }, { count: eventCount }] = await Promise.all([
    supabase.from("clients").select("*").eq("id", id).maybeSingle(),
    supabase.from("events").select("id", { count: "exact", head: true }).eq("client_id", id),
  ]);

  if (!client) notFound();
  const action = updateClient.bind(null, client.id);

  return (
    <main className={styles.page}>
      <nav className={styles.topbar} aria-label="Navegación principal">
        <Link href="/dashboard" className={styles.brand}>✦ BellaOS</Link>
        <div className={styles.nav}>
          <Link href="/clients" className={styles.navLink}>← Clientes</Link>
          <Link href="/events" className={styles.navLink}>Eventos</Link>
        </div>
      </nav>

      <header className={styles.intro}>
        <p className={styles.eyebrow}>Expediente del cliente</p>
        <div className={styles.titleRow}>
          <h1>{client.first_name} {client.last_name ?? ""}</h1>
          <span className={styles.count}>{eventCount ?? 0} eventos</span>
        </div>
      </header>

      {query.updated ? <p className={styles.notice} role="status">Cliente actualizado correctamente.</p> : null}
      {query.error ? <p className={styles.error} role="alert">{query.error}</p> : null}

      <section className={`${styles.panel} ${styles.detailPanel}`} aria-labelledby="edit-client-title">
        <p className={styles.eyebrow}>Información de contacto</p>
        <h2 id="edit-client-title">Editar cliente</h2>
        {context?.canManage ? (
          <form action={action} className={styles.form}>
            <div className={styles.formGrid}>
              <div className={styles.field}><label htmlFor="firstName">Nombre *</label><input id="firstName" name="firstName" required defaultValue={client.first_name} /></div>
              <div className={styles.field}><label htmlFor="lastName">Apellido</label><input id="lastName" name="lastName" defaultValue={client.last_name ?? ""} /></div>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.field}><label htmlFor="email">Correo</label><input id="email" name="email" type="email" defaultValue={client.email ?? ""} /></div>
              <div className={styles.field}><label htmlFor="phone">Teléfono</label><input id="phone" name="phone" type="tel" defaultValue={client.phone ?? ""} /></div>
            </div>
            <div className={styles.field}><label htmlFor="address">Dirección</label><input id="address" name="address" defaultValue={client.address ?? ""} /></div>
            <div className={styles.formGrid}>
              <div className={styles.field}><label htmlFor="city">Ciudad</label><input id="city" name="city" defaultValue={client.city ?? ""} /></div>
              <div className={styles.field}><label htmlFor="preferredLanguage">Idioma</label><select id="preferredLanguage" name="preferredLanguage" defaultValue={client.preferred_language}><option value="es">Español</option><option value="en">English</option></select></div>
            </div>
            <div className={styles.formGrid}>
              <div className={styles.field}><label htmlFor="status">Estado</label><select id="status" name="status" defaultValue={client.status ?? "lead"}><option value="lead">Lead</option><option value="active">Activo</option><option value="past">Anterior</option><option value="archived">Archivado</option></select></div>
              <div className={styles.field}><label htmlFor="referredBy">Referido por</label><input id="referredBy" name="referredBy" defaultValue={client.referred_by ?? ""} /></div>
            </div>
            <div className={styles.field}><label htmlFor="notes">Notas</label><textarea id="notes" name="notes" defaultValue={client.notes ?? ""} /></div>
            <button type="submit" className={styles.submit}>Guardar cambios</button>
          </form>
        ) : <p className={styles.empty}>Tu rol tiene acceso de lectura a este expediente.</p>}
      </section>
    </main>
  );
}
