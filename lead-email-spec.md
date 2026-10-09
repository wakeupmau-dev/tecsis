# Lead email spec

After a lead's email is saved, send that address one email with a link to the products page.
Prototype scope: the link is a test URL, and delivery only has to work for test addresses.
Written 2026-10-09. Nothing here is built yet.

## Flow

1. The landing form posts `{ email, locale }` to `POST /api/leads`.
2. The backend validates and saves the lead, as it does today.
3. Only when the lead is new, the backend sends the products email in the lead's locale.
4. The send result is recorded on the lead row.
5. The response is `201` whether or not the email went out. The lead is the thing the
   person asked for; a mail-provider outage must not tell them it failed.
6. The form shows a success or error message.

A repeat submit of a saved address gets `409` and **no second email**. Otherwise the form
becomes a way to send any address the same email again and again.

## Provider

Recommended: **Resend**. One HTTP call through its Node SDK, a free tier sized for a
prototype, and no SMTP setup.

Prototype limit: until a sending domain is verified in Resend, test sends only reach the
address that owns the Resend account. That is enough to try the flow end to end.
Sending to anyone else needs the domain's DNS records (SPF, DKIM) added. Confirm this limit
against Resend's current docs when setting it up.

The provider is wrapped in one function, `sendProductsEmail(to, locale)`, so swapping to
SES or SMTP later touches one file.

## Data

`Lead` gains:

| Field | Type | Notes |
| --- | --- | --- |
| `locale` | `"en"` or `"es"` | From the form; default `"en"` |
| `emailSentAt` | Date or null | Set when the provider accepts the send |
| `emailError` | string or null | Provider error message when the send failed |

A failed send also goes through `logError` with context `{ source: "lead.email" }`, so it
shows in `GET /api/admin/errors`.

## Configuration

| Env var | Purpose |
| --- | --- |
| `RESEND_API_KEY` | Provider key, backend `.env` only |
| `MAIL_FROM` | Sender, e.g. `Tecsis <onboarding@resend.dev>` until the domain is verified |
| `PRODUCTS_URL` | The link in the email; a test URL for now |

The backend refuses to start sending without `RESEND_API_KEY` and `MAIL_FROM`; a missing
key is logged as an error per send rather than crashing the server, so leads still save.

## Email content (draft, to review)

Plain text plus a minimal HTML version with the same words and one link.

**English** — subject: `Our products`
> Thanks for your interest in Tecsis. You can browse the instruments we offer here:
> {PRODUCTS_URL}
>
> Reply to this email if you want to talk about your challenge.

**Spanish** — subject: `Nuestros productos`
> Gracias por su interés en Tecsis. Puede revisar los instrumentos que ofrecemos aquí:
> {PRODUCTS_URL}
>
> Responda este correo si quiere conversar sobre su desafío.

## Abuse

`POST /api/leads` is public and now sends mail to whatever address it is given.
Two limits keep it from being used to send mail to strangers:

- One email per address, ever (the `409` rule above).
- A rate limit per IP on `POST /api/leads`, proposed 5 requests per hour, with
  `express-rate-limit`. In-memory is enough for one server instance; a second instance
  would need a shared store.

A CAPTCHA is out of scope for the prototype.

## Milestones

**L1. Backend data and config**
1. Add `locale`, `emailSentAt`, `emailError` to `Lead`.
2. Read `RESEND_API_KEY`, `MAIL_FROM`, `PRODUCTS_URL` in `src/config/mail.ts`.

**L2. Sending**
1. Install `resend`.
2. `src/lib/mail.ts`: `sendProductsEmail(to, locale)` with the two templates.

**L3. Wire it into `createLead`**
1. Accept and validate `locale`.
2. After a new lead saves, send, then record `emailSentAt` or `emailError`; failures go
   through `logError`. Response stays `201`.

**L4. Rate limit**
1. Install `express-rate-limit`.
2. Apply it to `POST /api/leads` only.

**L5. Frontend**
1. `handleSubmit` sends `locale` and wraps the call in `try/catch` with a `res.ok` check.
2. Success and error messages under the form, in both languages, including the `409` case
   and the rate-limit `429` case.

**L6. End to end**: submit the Resend account's own address and check the inbox, the lead
row and the error log.

## Open questions

1. **Provider**: Resend, or something you already use?
2. **Sender**: which domain will mail come from once this leaves the prototype?
3. **Test link**: what URL should `PRODUCTS_URL` be for now?
4. **Copy**: are the drafts above fine, and should Spanish use usted (as drafted, matching
   the site) or tú?
5. **Rate limit**: is 5 per hour per IP right? Offices behind one IP share it.
