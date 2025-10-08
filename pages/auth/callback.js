// pages/auth/callback.js
// Landing target for magic-link. Exchanges token → session and routes to next page.

import { useEffect } from "react";
import { useRouter } from "next/router";
import { useSupabaseClient } from "@supabase/auth-helpers-react";

export default function AuthCallback() {
  const router = useRouter();
  const supabase = useSupabaseClient();

  useEffect(() => {
    async function handle() {
      // Force a session fetch; helper also detects token in URL
      await supabase.auth.getSession();

      const params = new URLSearchParams(window.location.search);
      const next = params.get("redirectTo") || "/account";
      router.replace(next);
    }
    handle();
  }, [router, supabase]);

  return (
    <main className="min-h-screen bg-white text-ink-900 grid place-items-center px-4 py-10">
      <div className="rounded-2xl border border-ink-700/10 bg-white p-6 shadow">
        <p className="text-ink-700">Signing you in…</p>
      </div>
    </main>
  );
}
