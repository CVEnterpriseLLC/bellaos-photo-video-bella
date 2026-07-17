import Link from "next/link";
import { getCrmContext } from "@/lib/crm/context";
import { createClient as createSupabaseClient } from "@/lib/supabase/server";
import { createClient } from "./actions";
import styles from "../crm.module.css";

type SearchParams = Promise<{ created?: string; error?: string }>;

export default async function ClientsPage({ searchParams }: { searchParams: SearchParams }) {
  const params = await searchParams;
  const supabase = await createSupabaseClient();
  const context = await getCrmContext(supabase);
  const { data: clients } = await supabase
    .from("clients")
    .select("id,first_name,last_name,email,phone,city,status,created_at")
    .order("created_at", { ascending: false });

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
        <p className={styles.eyebrow}>CRM · Photo Video Bella</p>
        <div className={styles.titleRow}>
          <h1>Clientes</h1>
          <span className={styles.count}>{clients?.length ?? 0} registrados</span>
        </div>
      </header>

      {params.created ? <p className={styles.notice} role="status">Cliente guardado correctamente.</p> : null}
      {params.error ? <p className={styles.error} role="alert">{params.error}</p> : null}

      <div className={styles.content}>
        <section className={styles.panel} aria-labelledby="new-client-title">
          <p className={styles.eyebrow}>Nuevo registro</p>
          <h2 id="new-client-title">Agregar cliente</h2>
          {context?.canManage ? (
            <form action={createClient} className={styles.form}>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="firstName">Nombre *</label>
                  <input id="firstName" name="firstName" required autoComplete="given-name" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="lastName">Apellido</label>
                  <input id="lastName" name="lastName" autoComplete="family-name" />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="email">Correo electrónico</label>
                <input id="email" name="email" type="email" autoComplete="email" />
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="phone">Teléfono</label>
                  <input id="phone" name="phone" type="tel" autoComplete="tel" />
                </div>
                <div className={styles.field}>
                  <label htmlFor="city">Ciudad</label>
                  <input id="city" name="city" autoComplete="address-level2" defaultValue="Houston" />
                </div>
              </div>
              <div className={styles.formGrid}>
                <div className={styles.field}>
                  <label htmlFor="preferredLanguage">Idioma</label>
                  <select id="preferredLanguage" name="preferredLanguage" defaultValue="es">
                    <option value="es">Español</option>
                    <option value="en">English</option>
                  </select>
                </div>
                <div className={styles.field}>
                  <label htmlFor="referredBy">Referido por</label>
                  <input id="referredBy" name="referredBy" />
                </div>
              </div>
              <div className={styles.field}>
                <label htmlFor="notes">Notas</label>
                <textarea id="notes" name="notes" />
              </div>
              <button type="submit" className={styles.submit}>Guardar cliente</button>
            </form>
          ) : (
            <p className={styles.empty}>Tu rol tiene acceso de lectura al CRM.</p>
          )}
        </section>

        <section className={styles.panel} aria-labelledby="client-list-title">
          <div className={styles.listHeader}>
            <div>
              <p className={styles.eyebrow}>Directorio</p>
              <h2 id="client-list-title">Clientes recientes</h2>
            </div>
          </div>
          <div className={styles.list}>
            {clients?.length ? clients.map((client) => (
              <article className={styles.client} key={client.id}>
                <strong>{client.first_name} {client.last_name ?? ""}</strong>
                <div className={styles.clientMeta}>
                  {client.email ? <span>{client.email}</span> : null}
                  {client.phone ? <span>{client.phone}</span> : null}
                  {client.city ? <span>{client.city}</span> : null}
                </div>
                <span className={styles.status}>{client.status ?? "lead"}</span>
              </article>
            )) : <p className={styles.empty}>Aún no hay clientes. Crea el primero desde este formulario.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
