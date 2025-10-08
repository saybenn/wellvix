// pages/account/index.js
// Simple account page to verify auth & fetch profile.role from Supabase.
// Uses your Tailwind token classes and UI copy where available.

import { useEffect, useState } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import ui from "@/data/ui.json";

export default function AccountPage() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");

  useEffect(() => {
    (async () => {
      if (!user) return;
      setEmail(user.email || "");

      // TODO: Replace with an authenticated server route if you later need more fields,
      // or add a typed data-access layer.
      const { data, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (!error && data) setRole(data.role);
    })();
  }, [user, supabase]);

  async function signOut() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <main className="min-h-screen bg-white text-ink-900 px-4 py-10">
      <div className="container-x">
        <div className="rounded-2xl border border-ink-700/10 bg-white p-8 shadow">
          <h1 className="text-2xl font-semibold text-blue-600">Account</h1>

          <div className="mt-4 space-y-2">
            <p className="text-ink-700">
              <span className="font-medium">Email:</span> {email || "—"}
            </p>
            <p className="text-ink-700">
              <span className="font-medium">Role:</span> {role || "—"}
            </p>
          </div>

          <button
            onClick={signOut}
            className="mt-6 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 focus:ring-offset-white"
          >
            {ui.auth.signOut}
          </button>
        </div>
      </div>
    </main>
  );
}
