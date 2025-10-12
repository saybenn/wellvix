// /lib/rate-limit.js
// Dev-friendly in-memory sliding window (works in single process; fine for local & small scale).
const buckets = new Map();

export async function rateLimit(req, { limit = 5, windowMs = 60000 } = {}) {
  const key = `${req.headers["x-forwarded-for"] || req.socket.remoteAddress}:${
    req.url
  }`;
  const now = Date.now();
  const arr = buckets.get(key)?.filter((t) => now - t < windowMs) || [];
  arr.push(now);
  buckets.set(key, arr);
  return { ok: arr.length <= limit };
}
