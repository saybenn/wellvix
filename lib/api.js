export async function postJSON(url, data) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data || {}),
  });
  if (!res.ok) {
    const msg = await safeText(res);
    throw new Error(msg || `Request failed: ${res.status}`);
  }
  return res.json();
}

async function safeText(res) {
  try {
    return await res.text();
  } catch {
    return "";
  }
}
