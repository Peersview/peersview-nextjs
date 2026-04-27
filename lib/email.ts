import sgMail from "@sendgrid/mail";

const apiKey = process.env.SENDGRID_API_KEY;
if (apiKey) {
  sgMail.setApiKey(apiKey);
}

const FROM = "Peersview <admin@peersview.com>";

export async function sendEmail(
  subject: string,
  to: string,
  html: string,
): Promise<void> {
  if (!apiKey) {
    console.warn(
      `[email] SENDGRID_API_KEY missing — would have sent "${subject}" to ${to}`,
    );
    return;
  }
  await sgMail.send({ to, from: FROM, subject, html });
}
