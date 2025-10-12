// /pages/connect/return.js
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
// ✅ ONLY client-safe imports here. If you need public env, use env-public:
import envPublic from "@/lib/env-public";

export default function ConnectReturn() {
  const router = useRouter();
  const { accountId } = router.query;
  const [msg, setMsg] = useState("Finalizing…");

  useEffect(() => {
    (async () => {
      if (!accountId) return;
      const resp = await fetch("/api/connect/finalize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      const data = await resp.json();
      setMsg(
        data.ok
          ? "Stripe connected."
          : data.currently_due[0]
          ? "Missing Verification. Please Visit Stripe Account Dashboard."
          : "Still pending…"
      );
      console.log(data);
    })();
  }, [accountId]);

  return (
    <main className="min-h-screen bg-950 text-white px-6 py-10">
      <div className="mx-auto max-w-1/2 rounded-xl bg-card-800 p-6">
        <h1 className="text-xl font-semibold">{msg}</h1>
        {envPublic?.NEXT_PUBLIC_APP_URL && (
          <p className="mt-2 text-muted-400 text-sm">
            App URL: {envPublic.NEXT_PUBLIC_APP_URL}
          </p>
        )}
      </div>
    </main>
  );
}
