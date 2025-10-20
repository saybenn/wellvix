// /components/orders/DigitalBriefForm.jsx
import { useMemo, useState } from "react";
import { postJSON } from "@/lib/api";

/**
 * DigitalBriefForm (merged v2)
 *
 * Purpose:
 * - Create or update a digital order "brief" using only data coming from props or /data/*.json.
 * - If no orderId is provided, it first creates a draft via /api/checkout/draft (your original flow),
 *   then (optionally) enriches that draft with ETA / notes / files via /api/orders/brief.
 * - If orderId is provided, it ONLY updates the brief for that order (no draft creation).
 *
 * Props (unchanged + 1 optional):
 * - copy: { title, intro, submitLabel, successTitle, successBody, errorTitle, errorBody }
 * - fields: [{ id, label, placeholder, type, required, min, ... }]
 *      Special field ids/types that trigger extra behavior (optional):
 *        - id: "eta" with type: "datetime-local" (ISO will be sent to /api/orders/brief.etaIso)
 *        - id: "notes" with type: "textarea" (sent to /api/orders/brief.brief.notes)
 *        - type: "file-urls" (comma separated URLs -> sent to /api/orders/brief.files[])
 * - provider: { id, displayName }
 * - product: { id, title, price, currency, tierId? }
 * - customer: { id? }  // TODO(Supabase): derive from session
 * - orderId?: string   // OPTIONAL — if present, skip draft creation and only update the brief
 * - onDraftCreated?: (draft) => void   // called after draft create (create mode)
 * - onBriefSaved?: (order) => void     // called after brief saved/updated
 *
 * Teaching (for a novice):
 * - "Create" vs "Update": if we have an orderId, we just update that order's brief.
 * - "Brief": a bundle of info the provider needs to do the job (ETA, notes, reference files).
 * - We keep fields generic so you can change copy/inputs without changing code.
 *
 * TODO (Supabase):
 * - Use Supabase Auth to fill customer.id.
 * - Replace "file-urls" text with real uploads to Supabase Storage and write OrderFile rows.
 */

export default function DigitalBriefForm({
  copy,
  fields,
  provider,
  product,
  customer,
  orderId, // optional update mode
  onDraftCreated = () => {},
  onBriefSaved = () => {},
}) {
  const initialForm = useMemo(
    () =>
      (fields || []).reduce((acc, f) => {
        acc[f.id] = "";
        return acc;
      }, {}),
    [fields]
  );

  const [form, setForm] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState({ type: "", title: "", body: "" });

  function onChange(e, id) {
    const value = e.target.value;
    setForm((prev) => ({ ...prev, [id]: value }));
  }

  function parseFileUrls(raw) {
    return String(raw || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((url) => ({ url, name: url.split("/").pop() || "file" }));
  }

  function pullEtaNotesFilesFromForm() {
    // We do not hard-code labels; we infer by id/type so copy stays outside code.
    const etaIso =
      fields?.some((f) => f.id === "eta" && f.type === "datetime-local") &&
      form.eta
        ? new Date(form.eta).toISOString()
        : null;

    // Prefer "notes" id if present; else allow any textarea as notes (first match).
    let notes = null;
    if (
      fields?.some((f) => f.id === "notes" && f.type === "textarea") &&
      form.notes
    ) {
      notes = form.notes;
    } else {
      const noteField = fields?.find((f) => f.type === "textarea");
      if (noteField && form[noteField.id]) notes = form[noteField.id];
    }

    // Any field with custom type "file-urls" will be parsed into array of {url,name}
    const fileField = fields?.find((f) => f.type === "file-urls");
    const files = fileField ? parseFileUrls(form[fileField.id]) : null;

    return { etaIso, notes, files };
  }

  async function upsertBrief(targetOrderId) {
    const { etaIso, notes, files } = pullEtaNotesFilesFromForm();

    // Only call /api/orders/brief if at least one of eta/notes/files is present.
    if (!etaIso && !notes && !(files && files.length)) {
      return null;
    }

    const payload = {
      orderId: targetOrderId,
      etaIso: etaIso || null,
      notes: notes || "",
      files: files || null,
    };

    // This endpoint already exists in our stack; it merges brief/eta/files.
    const r = await postJSON("/api/orders/brief", payload);
    return r?.data?.order || null;
  }

  async function createDraft() {
    // re-check required fields (your original behavior)
    const missing = (fields || [])
      .filter((f) => f.required && !String(form[f.id] || "").trim())
      .map((f) => f.label);

    if (missing.length) {
      throw new Error(`Please complete: ${missing.join(", ")}`);
    }

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
      // Keep ALL field values in the draft "brief" payload too (as you had)
      brief: form,
    };

    // Your existing endpoint to create a draft order
    const draft = await postJSON("/api/checkout/draft", payload);
    return draft;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setNotice({ type: "", title: "", body: "" });

    try {
      let targetOrderId = orderId || null;
      let draft = null;

      if (!targetOrderId) {
        // CREATE mode — first create draft
        draft = await createDraft();
        targetOrderId = draft?.id || draft?.orderId || null; // accept either shape
        if (!targetOrderId)
          throw new Error("Draft creation did not return an order id.");
        onDraftCreated(draft);
      }

      // Attach optional ETA/notes/files if present
      const updated = await upsertBrief(targetOrderId);
      onBriefSaved(updated || draft || { id: targetOrderId });

      setNotice({
        type: "success",
        title: copy?.successTitle || "Saved",
        body:
          copy?.successBody || (orderId ? "Brief updated." : "Draft created."),
      });
    } catch (err) {
      setNotice({
        type: "error",
        title: copy?.errorTitle || "Error",
        body: copy?.errorBody || err?.message || "Please try again.",
      });
    } finally {
      setLoading(false);
    }
  }

  const fieldInput = (f) => {
    const common =
      "w-full rounded-xl border border-ink-700/15 bg-white px-4 py-3 text-ink-900 placeholder:text-muted-400 focus:outline-none focus:ring-2 focus:ring-blue-500";

    if (f.type === "textarea") {
      return (
        <label key={f.id} className="block">
          <span className="mb-1 block text-sm font-medium text-ink-900">
            {f.label}
            {f.required ? <span className="text-blue-600"> *</span> : null}
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

    if (f.type === "file-urls") {
      // UX: help text comes from placeholder; comma-separated values
      return (
        <label key={f.id} className="block">
          <span className="mb-1 block text-sm font-medium text-ink-900">
            {f.label}
            {f.required ? <span className="text-blue-600"> *</span> : null}
          </span>
          <input
            className={common}
            placeholder={f.placeholder || "https://... , https://..."}
            type="text"
            required={!!f.required}
            value={form[f.id]}
            onChange={(e) => onChange(e, f.id)}
          />
          <p className="mt-1 text-xs text-ink-700">
            Separate multiple links with commas.{" "}
            {/* TODO(Supabase): upgrade to real uploads */}
          </p>
        </label>
      );
    }

    // default input (includes datetime-local, number, text…)
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
  };

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

      {/* Dynamic fields — still completely driven by props/json */}
      <div className="mt-6 grid gap-4">{(fields || []).map(fieldInput)}</div>

      {/* Order meta preview (kept from your version; still prop-driven) */}
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
              {(product?.currency || "USD").toUpperCase()}{" "}
              {Number(product?.price || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Inline notice (non-blocking with your global Toast system) */}
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
          {loading
            ? "Saving…"
            : copy?.submitLabel || (orderId ? "Save Brief" : "Save Draft")}
        </button>
      </div>

      {/* TODO(Supabase):
         - If create mode, optionally route to /checkout/review?orderId=... after draft/brief save.
         - Attach Supabase user id as customerId automatically. */}
    </form>
  );
}
// TODO(Supabase/Orders): if payload.brief.etaDays, compute a target ISO (today + etaDays) and store as Order.eta
