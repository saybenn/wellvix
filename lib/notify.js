// /lib/notify.js
// TODO Supabase: wire Resend/Twilio credentials and templates

export async function notifyProviderOnboarding({ accountId }) {
  // Send email/SMS that payouts are enabled.
  // e.g., via Resend: await resend.emails.send(...)
  return true;
}

export async function notifyPaymentReceived({ orderId }) {
  return true;
}

export async function notifyOrderAccepted({ orderId }) {
  return true;
}
