import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updatePassword } from "./actions";
import styles from "../login/login.module.css";

type UpdatePasswordPageProps = {
  searchParams: Promise<{ error?: string }>;
};

const errorMessages: Record<string, string> = {
  invalid_password: "La contraseña debe tener al menos 8 caracteres.",
  password_mismatch: "Las contraseñas no coinciden.",
  update_failed: "No fue posible guardar la contraseña. Inténtalo de nuevo.",
};

export default async function UpdatePasswordPage({
  searchParams,
}: UpdatePasswordPageProps) {
  const params = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?error=invalid_invitation");

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="password-title">
        <div className={styles.brand}>
          <span aria-hidden="true">✦</span> BellaOS
        </div>
        <p className={styles.eyebrow}>CV Enterprise LLC</p>
        <h1 id="password-title">Crea tu contraseña</h1>
        <p className={styles.description}>
          Completa la activación de tu cuenta para entrar al panel privado.
        </p>

        {params.error ? (
          <div className={styles.error} role="alert">
            {errorMessages[params.error] ?? "No fue posible guardar la contraseña."}
          </div>
        ) : null}

        <form action={updatePassword} className={styles.form}>
          <label htmlFor="password">Nueva contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <label htmlFor="password_confirmation">Confirma la contraseña</label>
          <input
            id="password_confirmation"
            name="password_confirmation"
            type="password"
            autoComplete="new-password"
            minLength={8}
            required
          />
          <button type="submit">Activar mi cuenta</button>
        </form>
      </section>
    </main>
  );
}
