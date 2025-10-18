// /lib/status.js
export const ORDER = {
  DRAFT: "draft",
  AWAITING_PROVIDER: "awaiting_provider", // NEW: client submitted; provider must accept
  ACCEPTED: "accepted", // renamed from in_progress; provider is working
  DELIVERED: "delivered",
  COMPLETED: "completed",
  REFUNDED: "refunded",
  CANCELLED: "cancelled",
};
