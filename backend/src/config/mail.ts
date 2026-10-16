export function resendApiKey() {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("RESEND_API_KEY is not set");
  return key;
}

export function mailFrom() {
  return process.env.MAIL_FROM ?? "Tecsis <onboarding@resend.dev>";
}

// Where replies go. Optional: without it, replies go to MAIL_FROM.
export function replyTo() {
  return process.env.REPLY_TO || undefined;
}

export function productsUrl() {
  return process.env.PRODUCTS_URL ?? "https://example.com/products";
}
