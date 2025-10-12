import { useState } from "react";
import { postJSON } from "@/lib/api";

/**
 * DigitalBriefForm
 * All text & fields come from props or /data/*.json to keep it service-agnostic.
 *
 * Props:
 * - copy: { title, intro, submitLabel, successTitle, successBody, errorTitle, errorBody }
 * - fields: [{ id, label, placeholder, type, required, ...extra }]
 * - provider: { id, displayName } // Used to target a specific provider flow
 * - product: { id: string, title: string, price: number, currency: string, tierId?: string }
 * - customer: { id?: string } // optional, could be set after auth
 * - onDraftCreated?: (draft) => void
 *
 * Styling:
 * - Uses Tailwind v4 tokens (as CSS variables): bg-950, ink-900, ink-700, blue-800, blue-600, blue-500, green-500, muted-400, card-800, white
 *
 * TODO (Supabase):
 * - Attach authenticated user (customer.id from Supabase session)
 * - Upload any files to Supabase Storage (if/when file fields are added)
 * - On success, optionally redirect to review/checkout
 */
export default function DigitalBriefForm({
  copy,
  fields,
  provider,
  product,
  customer,
  onDraftCreated = () => {},
}) {
  const [form, setForm] = useState(() =>
    (fields || []).reduce((acc, f) => {
      acc[f.id] = "";
      return acc;
    }, {})
  );
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ type: "", title: "", body: "" });

  function onChange(e, id) {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [id]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setNotice({ type: "", title: "", body: "" });

    // Minimal client validation for required fields
    const missing = (fields || [])
      .filter((f) => f.required && !String(form[f.id] || "").trim())
      .map((f) => f.label);

    if (missing.length) {
      setLoading(false);
      setNotice({
        type: "error",
        title: copy?.errorTitle || "Missing required fields",
        body: `Please complete: ${missing.join(", ")}`,
      });
      return;
    }

    try {
      const payload = {
        providerId: provider?.id || null,
        customerId: customer?.id || null, // TODO(Supabase): derive from session
        product: {
          id: product?.id || null,
          tierId: product?.tierId || null,
          price: product?.price || 0,
          currency: product?.currency || "usd",
          title: product?.title || "Tier",
        },
        brief: form,
      };

      const res = await postJSON("/api/checkout/draft", payload);
      setNotice({
        type: "success",
        title: copy?.successTitle || "Saved",
        body: copy?.successBody || "Draft created.",
      });
      onDraftCreated(res);
    } catch (err) {
      setNotice({
        type: "error",
        title: copy?.errorTitle || "Error",
        body: copy?.errorBody || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="w-full rounded-2xl border border-ink-700/10 bg-white p-6 shadow-sm"
    >
      {copy?.title ? (
        <h2 className="text-xl font-semibold text-ink-900">{copy.title}</h2>
      ) : null}
      {copy?.intro ? (
        <p className="mt-2 text-sm text-ink-700">{copy.intro}</p>
      ) : null}

      <div className="mt-6 grid gap-4">
        {(fields || []).map((f) => {
          const common =
            "w-full rounded-xl border border-ink-700/15 bg-white px-4 py-3 text-ink-900 placeholder: text-muted-400 focus:outline-none focus:ring-2 focus:ring-blue-500";
          if (f.type === "textarea") {
            return (
              <label key={f.id} className="block">
                <span className="mb-1 block text-sm font-medium text-ink-900">
                  {f.label}
                  {f.required ? (
                    <span className="text-blue-600"> *</span>
                  ) : null}
                </span>
                <textarea
                  className={`${common} min-h-[120px]`}
                  placeholder={f.placeholder || ""}
                  required={!!f.required}
                  value={form[f.id]}
                  onChange={(e) => onChange(e, f.id)}
                />
              </label>
            );
          }

          return (
            <label key={f.id} className="block">
              <span className="mb-1 block text-sm font-medium text-ink-900">
                {f.label}
                {f.required ? <span className="text-blue-600"> *</span> : null}
              </span>
              <input
                className={common}
                placeholder={f.placeholder || ""}
                type={f.type || "text"}
                min={f.min}
                required={!!f.required}
                value={form[f.id]}
                onChange={(e) => onChange(e, f.id)}
              />
            </label>
          );
        })}
      </div>

      <div className="mt-6 rounded-xl bg-card-800/5 p-4">
        <div className="text-sm text-ink-700">
          <div>
            <span className="font-medium text-ink-900">Provider:</span>{" "}
            <span>{provider?.displayName || "Selected provider"}</span>
          </div>
          <div className="mt-1">
            <span className="font-medium text-ink-900">Tier:</span>{" "}
            <span>{product?.title || "Selected tier"}</span>
          </div>
          <div className="mt-1">
            <span className="font-medium text-ink-900">Price:</span>{" "}
            <span>
              {product?.currency?.toUpperCase() || "USD"}{" "}
              {Number(product?.price || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {notice?.type ? (
        <div
          className={`mt-4 rounded-xl p-3 text-sm ${
            notice.type === "success"
              ? "bg-green-500/10 text-ink-900"
              : "bg-blue-800/10 text-ink-900"
          }`}
        >
          <div className="font-medium">{notice.title}</div>
          <div className="mt-1 text-ink-700">{notice.body}</div>
        </div>
      ) : null}

      <div className="mt-6 flex items-center gap-3">
        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-medium text-white hover:bg-blue-500 disabled:opacity-60"
        >
          {loading ? "Saving…" : copy?.submitLabel || "Save Draft"}
        </button>
      </div>

      {/* TODO(Supabase): On success, route to /checkout/review?orderId=... or hydrate checkout context */}
    </form>
  );
}
