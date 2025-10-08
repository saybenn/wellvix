// pages/auth/sign-in.js
// Passwordless (magic-link) sign-in using Supabase.
// Uses your Tailwind v4 tokens: bg-white, text-ink-900, text-muted-400, text-blue-600, ring-blue-600.
// All UI text pulled from /data/ui.json.

import { useState } from "react";
import { useSupabaseClient } from "@supabase/auth-helpers-react";
import ui from "@/data/ui.json";

export default function SignInPage({ copy }) {
  const supabase = useSupabaseClient(); // ✅ uses the client from _app via createPagesBrowserClient
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setStatus("loading");

    try {
      const redirectTo =
        typeof window !== "undefined"
          ? `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
          : undefined;

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectTo,
          shouldCreateUser: true, // create if not exists
        },
      });

      if (error) throw error;
      setStatus("sent");
    } catch (err) {
      setError(copy.errorGeneric);
      setStatus("idle");
    }
  }

  return (
    <main className="min-h-screen bg-white text-ink-900 grid place-items-center px-4 py-10">
      <div className="w-full max-w-1/2 rounded-2xl border border-ink-700/10 bg-white p-8 shadow">
        <h1 className="text-2xl font-semibold text-blue-600">
          {copy.signInTitle}
        </h1>
        <p className="mt-2 text-muted-400">{copy.signInSubtitle}</p>

        {status === "sent" ? (
          <p className="mt-6 text-green-500">{copy.checkInbox}</p>
        ) : (
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <label className="block">
              <span className="block text-sm text-ink-700">
                {copy.emailLabel}
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={copy.emailPlaceholder}
                className="mt-1 w-full rounded-lg border border-ink-700/20 bg-white px-4 py-2 text-ink-900 outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
              />
            </label>

            {error && <p className="text-sm text-red-500">{error}</p>}

            <button
              type="submit"
              disabled={status === "loading"}
              className="w-full rounded-lg px-4 py-2 font-medium bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-60"
            >
              {copy.sendLink}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}

export function getStaticProps() {
  // TODO: In production, consider reading copy from a Supabase table (ui_strings) instead of JSON.
  return {
    props: {
      copy: ui.auth,
    },
  };
}
