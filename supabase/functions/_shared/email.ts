type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const EMAIL_FROM = Deno.env.get("EMAIL_FROM") || "Runbickers <no-reply@runbickers.app>";

export async function sendEmail({ to, subject, html, text }: SendEmailInput) {
  if (!RESEND_API_KEY) {
    console.warn("RESEND_API_KEY not set, skipping email send (dev mode).");
    return { ok: true, skipped: true };
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: EMAIL_FROM,
      to: [to],
      subject,
      html,
      text: text ?? html.replace(/<[^>]+>/g, ""),
    }),
  });
  if (!res.ok) {
    const msg = await res.text();
    throw new Error(`Email send failed: ${res.status} ${msg}`);
  }
  return await res.json();
}
