import { Resend } from "resend";
import { mailFrom, productsUrl, resendApiKey } from "../config/mail.js";

export type Locale = "en" | "es";

type SendResult = { id: string } | { error: string };

const templates: Record<
  Locale,
  { subject: string; intro: string; outro: string }
> = {
  en: {
    subject: "Our products",
    intro:
      "Thanks for your interest in Tecsis. You can browse the instruments we offer here:",
    outro: "Reply to this email if you want to talk about your challenge.",
  },
  es: {
    subject: "Nuestros productos",
    intro:
      "Gracias por su interés en Tecsis. Puede revisar los instrumentos que ofrecemos aquí:",
    outro: "Responda este correo si quiere conversar sobre su desafío.",
  },
};

let client: Resend | null = null;

function getClient() {
  client ??= new Resend(resendApiKey());
  return client;
}

export async function sendProductsEmail(
  to: string,
  locale: Locale,
): Promise<SendResult> {
  const { subject, intro, outro } = templates[locale];
  const url = productsUrl();

  try {
    const { data, error } = await getClient().emails.send({
      from: mailFrom(),
      to: [to],
      subject,
      text: `${intro}\n${url}\n\n${outro}`,
      html: `<p>${escapeHtml(intro)}</p><p><a href="${escapeHtml(url)}">${escapeHtml(url)}</a></p><p>${escapeHtml(outro)}</p>`,
    });
    if (error) return { error: `${error.name}: ${error.message}` };
    return { id: data.id };
  } catch (error) {
    return { error: (error as Error).message };
  }
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
