// /components/connect/OnboardButton.jsx
export default function OnboardButton({ providerId, email }) {
  async function start() {
    const a = await fetch("/api/connect/create-account", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ providerId, email }),
    }).then((r) => r.json());
    if (!a.accountId) return alert(a.error || "Failed to create account");

    const l = await fetch("/api/connect/onboard-link", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accountId: a.accountId }),
    }).then((r) => r.json());
    if (!l.url) return alert(l.error || "Failed to create onboarding link");

    window.location.href = l.url;
  }

  return (
    <button
      onClick={start}
      className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-500"
    >
      Connect payouts with Stripe
    </button>
  );
}
