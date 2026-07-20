import Link from "next/link";
import { redirect } from "next/navigation";

import { getCrmContext } from "@/lib/crm/context";
import { createClient } from "@/lib/supabase/server";
import { linkPortalAccount, removePortalAccount } from "./actions";
import styles from "../crm.module.css";

type SearchParams = Promise<{ linked?: string; removed?: string; error?: string }>;

type ClientProfile = {
  id: string;
  full_name: string | null;
  email: string | null;
  roles: { slug: string } | null;
};

type Membership = {
  id: string;
  user_id: string;
  relationship: string;
  profiles: { full_name: string | null; email: string | null } | null;
  clients: { first_name: string; last_name: string | null } | null;
};

const relationshipLabels: Record<string, string> = {
  primary: "Cliente principal",
  parent: "Madre o padre",
  partner: "Pareja",
  guardian: "Tutor",
  other: "Otro",
};

export default async function PortalAccessPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams;
  const supabase = await createClient();
  const context = await getCrmContext(supabase);

  if (!context?.canManage) redirect("/dashboard");

  const [{ data: clients }, { data: profilesData }, { data: membershipsData }] = await Promise.all([
    supabase.from("clients").select("id,first_name,last_name").order("first_name"),
    supabase.from("profiles").select("id,full_name,email,roles(slug)").order("full_name"),
    supabase
      .from("client_portal_memberships")
      .select("id,user_id,relationship,profiles!client_portal_memberships_user_id_fkey(full_name,email),clients(first_name,last_name)")
      .order("created_at", { ascending: false }),
  ]);

  const profiles = (profilesData as ClientProfile[] | null)?.filter((profile) => profile.roles?.slug === "client") ?? [];
  const memberships = (membershipsData ?? []) as Membership[];
  const availableProfiles = profiles.filter((profile) => !memberships.some((membership) => membership.user_id === profile.id));
  const canRemove = ["owner", "administrator"].includes(context.role ?? "");

  return (
    <main className={styles.page}>
      <nav className={styles.topbar} aria-label="Navegación principal">
        <Link href="/dashboard" className={styles.brand}>✦ BellaOS</Link>
        <div className={styles.nav}><Link href="/clients" className={styles.navLink}>Clientes</Link><Link href="/events" className={styles.navLink}>Eventos</Link></div>
      </nav>

      <header className={styles.intro}>
        <p className={styles.eyebrow}>Portal del Cliente</p>
        <div className={styles.titleRow}><h1>Accesos privados</h1><span className={styles.count}>{memberships.length} vinculados</span></div>
      </header>

      {query.linked ? <p className={styles.notice} role="status">La cuenta quedó vinculada con el cliente.</p> : null}
      {query.removed ? <p className={styles.notice} role="status">El acceso fue retirado correctamente.</p> : null}
      {query.error ? <p className={styles.error} role="alert">{query.error}</p> : null}

      <div className={styles.content}>
        <section className={styles.panel} aria-labelledby="link-account-title">
          <p className={styles.eyebrow}>Configuración</p>
          <h2 id="link-account-title">Vincular cuenta</h2>
          <p className={styles.empty}>La persona debe tener previamente una cuenta de Supabase con el rol Cliente y la marca correcta.</p>
          <form action={linkPortalAccount} className={styles.form}>
            <div className={styles.field}>
              <label htmlFor="userId">Cuenta del portal *</label>
              <select id="userId" name="userId" required defaultValue="">
                <option value="" disabled>Selecciona una cuenta</option>
                {availableProfiles.map((profile) => <option value={profile.id} key={profile.id}>{profile.full_name || profile.email || "Cuenta sin nombre"}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="clientId">Cliente *</label>
              <select id="clientId" name="clientId" required defaultValue="">
                <option value="" disabled>Selecciona un cliente</option>
                {clients?.map((client) => <option value={client.id} key={client.id}>{client.first_name} {client.last_name ?? ""}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="relationship">Relación</label>
              <select id="relationship" name="relationship" defaultValue="primary">
                {Object.entries(relationshipLabels).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
              </select>
            </div>
            <button className={styles.submit} type="submit" disabled={!availableProfiles.length || !clients?.length}>Vincular acceso</button>
          </form>
        </section>

        <section className={styles.panel} aria-labelledby="linked-accounts-title">
          <div className={styles.listHeader}><div><p className={styles.eyebrow}>Cuentas activas</p><h2 id="linked-accounts-title">Clientes con portal</h2></div></div>
          <div className={styles.list}>
            {memberships.length ? memberships.map((membership) => {
              const removeAction = removePortalAccount.bind(null, membership.user_id);
              return (
                <article className={styles.payment} key={membership.id}>
                  <div><strong>{membership.clients?.first_name} {membership.clients?.last_name ?? ""}</strong><span>{membership.profiles?.full_name || membership.profiles?.email || "Cuenta cliente"} · {relationshipLabels[membership.relationship] ?? membership.relationship}</span></div>
                  {canRemove ? <form action={removeAction}><button className={styles.taskButton} type="submit">Retirar</button></form> : null}
                </article>
              );
            }) : <p className={styles.empty}>Aún no hay cuentas vinculadas.</p>}
          </div>
        </section>
      </div>
    </main>
  );
}
