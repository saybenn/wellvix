import Head from "next/head";
import DigitalBriefForm from "@/components/forms/DigitalBriefForm";
import briefData from "@/data/digitalBrief.json";

/**
 * Example page wiring DigitalBriefForm to server endpoint.
 * All view text comes from /data/digitalBrief.json or props.
 *
 * TODO(Supabase):
 * - Pull current user from Supabase auth (customer)
 * - Load provider/product from route or query (provider-first flow)
 */
export default function DigitalCheckoutPage() {
  // Mocked props; in real flow derive from provider profile/tier selection
  const provider = { id: "prov_123", displayName: "Selected Provider" };
  const product = {
    id: "prod_basic",
    tierId: "tier_basic",
    title: "Digital Tier (Basic)",
    price: 199,
    currency: "usd",
  };
  const customer = { id: null }; // TODO: Replace with Supabase session user id

  function handleDraftCreated(draft) {
    // For now, just log. In real flow, route to review screen.
    // TODO: router.push(`/checkout/review?orderId=${draft.id}`)
    // eslint-disable-next-line no-console
    console.log("Draft created:", draft);
  }

  return (
    <>
      <Head>
        <title>Digital Checkout — Draft</title>
      </Head>

      <main className="w-full min-h-screen bg-bg-950 px-4 py-8">
        <div className="mx-auto max-w-full">
          <header className="mb-6">
            <h1 className="text-2xl font-semibold text-white">
              {briefData.copy.title}
            </h1>
            <p className="mt-2 text-sm text-muted-400">
              {briefData.copy.intro}
            </p>
          </header>

          <DigitalBriefForm
            copy={briefData.copy}
            fields={briefData.fields}
            provider={provider}
            product={product}
            customer={customer}
            onDraftCreated={handleDraftCreated}
          />
        </div>
      </main>
    </>
  );
}
