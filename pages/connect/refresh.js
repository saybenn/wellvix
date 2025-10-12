// /pages/connect/refresh.js
import { useEffect } from "react";
import { useRouter } from "next/router";

export default function RefreshOnboarding() {
  const router = useRouter();
  const { accountId } = router.query;

  useEffect(() => {
    (async () => {
      S;
      if (!accountId) return;
      const resp = await fetch("/api/connect/onboard-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ accountId }),
      });
      const data = await resp.json();
      if (data?.url) window.location.href = data.url;
    })();
  }, [accountId]);

  return (
    <main className="min-h-screen bg-950 text-white px-6 py-10">
      <div className="mx-auto max-w-xl rounded-xl bg-card-800 p-6">
        <h1 className="text-xl font-semibold">Re-opening Stripe onboarding…</h1>
      </div>
    </main>
  );
}
