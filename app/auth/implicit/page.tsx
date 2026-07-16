"use client";

import { useEffect, useState } from "react";
import { getImplicitSessionTokens } from "@/lib/auth/implicit";
import { getSafeRedirect } from "@/lib/auth/redirect";
import { createClient } from "@/lib/supabase/client";
import styles from "../../(auth)/login/login.module.css";

export default function ImplicitAuthPage() {
  const [error, setError] = useState(false);

  useEffect(() => {
    async function activateInvitation() {
      const tokens = getImplicitSessionTokens(window.location.hash);

      if (!tokens) throw new Error("Missing invitation session tokens");

      const next = getSafeRedirect(
        new URLSearchParams(window.location.search).get("next") ??
          "/update-password",
      );
      const supabase = createClient();
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: tokens.accessToken,
        refresh_token: tokens.refreshToken,
      });

      if (sessionError) throw sessionError;

      window.location.replace(next);
    }

    void activateInvitation().catch(() => setError(true));
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.card} aria-labelledby="invitation-title">
        <div className={styles.brand}>
          <span aria-hidden="true">✦</span> BellaOS
        </div>
        <p className={styles.eyebrow}>CV Enterprise LLC</p>
        <h1 id="invitation-title">
          {error ? "Invitación no válida" : "Activando tu cuenta"}
        </h1>
        <p className={styles.description} role={error ? "alert" : "status"}>
          {error
            ? "El enlace expiró o ya fue utilizado. Solicita una nueva invitación."
            : "Estamos verificando tu invitación segura. Esto tomará solo un momento."}
        </p>
      </section>
    </main>
  );
}
