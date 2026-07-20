import Link from "next/link";
import { redirect } from "next/navigation";
import { getSafeRedirect } from "@/lib/auth/redirect";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";
import { login } from "./actions";
import styles from "./login.module.css";

type LoginPageProps = {
  searchParams: Promise<{ error?: string; next?: string }>;
};

const errorMessages: Record<string, string> = {
  invalid_input: "Escribe un correo válido y una contraseña de 8 caracteres o más.",
  invalid_credentials: "El correo o la contraseña no son correctos.",
  invalid_invitation: "La invitación no es válida o ya expiró. Solicita una nueva.",
  configuration: "La conexión con Supabase todavía no está configurada.",
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const params = await searchParams;
  const next = getSafeRedirect(params.next);
  const configured = isSupabaseConfigured();

  if (configured) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) redirect(next);
  }

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="login-title">
        <Link href="/" className={styles.brand}>
          <span aria-hidden="true">✦</span> BellaOS
        </Link>
        <p className={styles.eyebrow}>CV Enterprise LLC</p>
        <h1 id="login-title">Inicia sesión</h1>
        <p className={styles.description}>
          Acceso privado para el equipo y los clientes de Photo Video Bella.
        </p>

        {!configured ? (
          <div className={styles.notice} role="status">
            Configura las variables de Supabase indicadas en <code>.env.example</code>.
          </div>
        ) : null}

        {params.error ? (
          <div className={styles.error} role="alert">
            {errorMessages[params.error] ?? "No fue posible iniciar sesión."}
          </div>
        ) : null}

        <form action={login} className={styles.form}>
          <input type="hidden" name="next" value={next} />
          <label htmlFor="email">Correo electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            disabled={!configured}
          />
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            minLength={8}
            required
            disabled={!configured}
          />
          <button type="submit" disabled={!configured}>
            Entrar a BellaOS
          </button>
        </form>

        <p className={styles.help}>
          Las cuentas se crean por invitación. Contacta al administrador si necesitas acceso.
        </p>
      </section>
    </main>
  );
}
