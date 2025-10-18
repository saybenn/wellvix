// /pages/api/admin/events.js
import fs from "fs/promises";
import path from "path";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    const p = path.join(process.cwd(), "data", "order-events.json");
    let events = [];
    try {
      const raw = await fs.readFile(p, "utf8");
      events = JSON.parse(raw);
    } catch {
      events = [];
    }
    // newest first
    events.sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || ""));
    res.status(200).json({ events });
  } catch (e) {
    console.error("admin events error:", e);
    res.status(500).json({ error: "Internal error" });
  }
}
