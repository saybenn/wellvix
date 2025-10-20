// /pages/api/providers/[providerId]/availability.js
// GET ?year=YYYY&month=M -> { days: { "YYYY-MM-DD": true } }
// GET ?date=YYYY-MM-DD&serviceId=... -> { slots: [{startIso,endIso,startLabel}] }
import { isDayAvailable, getSlotsForDay } from "@/lib/availability";
import services from "@/data/provider_services.json";

export default function handler(req, res) {
  const { providerId } = req.query;
  if (!providerId)
    return res.status(400).json({ error: "providerId required" });

  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });

  const { year, month, date, serviceId } = req.query;

  if (year && month) {
    const y = Number(year);
    const m = Number(month) - 1;
    const d0 = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0).getDate();
    const days = {};
    for (let d = 1; d <= last; d++) {
      const iso = new Date(y, m, d).toISOString().slice(0, 10);
      days[iso] = isDayAvailable(providerId, iso);
    }
    return res.json({ days });
  }

  if (date && serviceId) {
    const svc = services.find((s) => s.id === serviceId);
    const slots = getSlotsForDay(providerId, date, svc);
    return res.json({ slots });
  }

  return res.status(400).json({ error: "Missing query params" });
}
