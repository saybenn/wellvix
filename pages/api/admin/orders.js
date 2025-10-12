// /pages/api/admin/orders.js
// Dev-only listing of orders from the JSON data store. TODO: AuthZ.
import { listOrders } from "@/lib/orders-store";

export default async function handler(req, res) {
  if (req.method !== "GET")
    return res.status(405).json({ error: "Method not allowed" });
  try {
    const orders = await listOrders();
    res.status(200).json({ orders });
  } catch (e) {
    console.error("admin orders list error:", e);
    res.status(500).json({ error: "Internal error" });
  }
}
