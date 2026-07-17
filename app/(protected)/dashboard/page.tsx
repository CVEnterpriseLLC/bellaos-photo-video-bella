import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "../actions";
import styles from "./dashboard.module.css";

type Profile = {
  full_name: string | null;
  email: string | null;
  brands: { name: string; companies: { name: string } | null } | null;
  roles: { name: string } | null;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const [{ data }, { count: clientCount }, { count: eventCount }] = await Promise.all([
    supabase
      .from("profiles")
      .select("full_name,email,brands(name,companies(name)),roles(name)")
      .eq("id", user!.id)
      .maybeSingle(),
    supabase.from("clients").select("id", { count: "exact", head: true }),
    supabase.from("events").select("id", { count: "exact", head: true }),
  ]);

  const profile = data as Profile | null;
  const isAssigned = Boolean(profile?.brands && profile.roles);

  return (
    <main className={styles.page}>
      <header className={styles.header}>
        <div>
          <Link href="/" className={styles.brand}>
            <span aria-hidden="true">✦</span> BellaOS
          </Link>
          <p>Panel ejecutivo</p>
        </div>
        <div className={styles.headerActions}>
          <Link href="/clients" className={styles.navLink}>Clientes</Link>
          <Link href="/events" className={styles.navLink}>Eventos</Link>
          <form action={signOut}>
            <button type="submit" className={styles.signOut}>
              Cerrar sesión
            </button>
          </form>
        </div>
      </header>

      <section className={styles.hero}>
        <p className={styles.eyebrow}>BellaOS CRM · Sprint 2</p>
        <h1>Hola, {profile?.full_name || user?.email || "equipo Bella"}</h1>
        <p>
          Tu sesión está protegida y conectada al núcleo multi-marca de CV Enterprise LLC.
        </p>
      </section>

      {!isAssigned ? (
        <section className={styles.alert} role="status">
          <strong>Acceso pendiente de asignación</strong>
          <span>
            Un administrador debe asignar tu marca y rol antes de mostrar datos operativos.
          </span>
        </section>
      ) : null}

      <section className={styles.grid} aria-label="Resumen del núcleo">
        <article className={styles.card}>
          <span>Empresa</span>
          <strong>{profile?.brands?.companies?.name ?? "Sin asignar"}</strong>
        </article>
        <article className={styles.card}>
          <span>Marca activa</span>
          <strong>{profile?.brands?.name ?? "Sin asignar"}</strong>
        </article>
        <article className={styles.card}>
          <span>Rol</span>
          <strong>{profile?.roles?.name ?? "Sin asignar"}</strong>
        </article>
        <article className={styles.card}>
          <span>Clientes visibles</span>
          <strong>{clientCount ?? 0}</strong>
        </article>
        <article className={styles.card}>
          <span>Eventos programados</span>
          <strong>{eventCount ?? 0}</strong>
        </article>
      </section>

      <section className={styles.foundation}>
        <div>
          <p className={styles.eyebrow}>CRM operativo</p>
          <h2>Clientes y eventos en una sola plataforma</h2>
        </div>
        <ul>
          <li>Sesiones SSR con Supabase Auth</li>
          <li>Rutas protegidas en App Router</li>
          <li>Empresas, marcas, perfiles y roles con RLS</li>
          <li>Directorio de clientes aislado por marca</li>
          <li>Agenda de eventos vinculada a cada cliente</li>
          <li>Sin claves privadas en el navegador</li>
        </ul>
      </section>
    </main>
  );
}
