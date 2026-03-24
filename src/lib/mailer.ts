import nodemailer from "nodemailer";

const port = Number(process.env.SMTP_PORT) || 587;

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.privateemail.com",
  port,
  secure: port === 465,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@dojops.ai";
const HUB_URL = process.env.NEXTAUTH_URL || "https://hub.dojops.ai";

/** Escape HTML entities to prevent injection in emails. */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function unsubscribeFooterHtml(unsubscribeToken: string): string {
  const url = `${HUB_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
  return `<tr><td style="padding:24px 40px;border-top:1px solid #1e2432;text-align:center">
    <p style="margin:0;font-size:12px;color:#5a6478">
      <a href="${url}" style="color:#5a6478;text-decoration:underline">Unsubscribe</a>
      &nbsp;&middot;&nbsp; You received this because you subscribed at dojops.ai
    </p>
  </td></tr>`;
}

function unsubscribeFooterText(unsubscribeToken: string): string {
  return `\nUnsubscribe: ${HUB_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}`;
}

// ── Verification email (double opt-in) ─────────────────────────────────

export async function sendVerificationEmail(
  to: string,
  verifyToken: string,
  unsubscribeToken: string,
): Promise<void> {
  const verifyUrl = `${HUB_URL}/api/newsletter/verify?token=${verifyToken}`;

  await transport.sendMail({
    from: `"DojOps" <${FROM}>`,
    to,
    subject: "Verify your DojOps subscription",
    html: verificationHtml(verifyUrl, unsubscribeToken),
    text: verificationText(verifyUrl, unsubscribeToken),
  });
}

function verificationText(verifyUrl: string, unsubscribeToken: string): string {
  return `Verify your DojOps subscription

Click the link below to confirm your email:
${verifyUrl}

If you didn't subscribe, ignore this email.
${unsubscribeFooterText(unsubscribeToken)}`;
}

function verificationHtml(verifyUrl: string, unsubscribeToken: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050508;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0d1117;border-radius:16px;overflow:hidden;border:1px solid #1e2432">
        <tr><td style="padding:40px 40px 24px;text-align:center">
          <img src="https://dojops.ai/icons/dojops-new-logo.png" width="64" height="64" alt="DojOps" style="border-radius:12px">
        </td></tr>
        <tr><td style="padding:0 40px 32px">
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#e8edf5;text-align:center">
            Verify your email
          </h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#7b8ba3;text-align:center">
            Click below to confirm your subscription and start receiving DojOps updates.
          </p>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr><td align="center">
              <a href="${verifyUrl}" style="display:inline-block;padding:14px 32px;background:linear-gradient(135deg,#06b6d4,#3b82f6);color:#fff;font-size:15px;font-weight:600;text-decoration:none;border-radius:10px">
                Verify Email
              </a>
            </td></tr>
          </table>
          <p style="margin:24px 0 0;font-size:12px;line-height:1.5;color:#5a6478;text-align:center">
            If you didn't subscribe, you can safely ignore this email.
          </p>
        </td></tr>
        ${unsubscribeFooterHtml(unsubscribeToken)}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

// ── Release notification email ──────────────────────────────────────────

export async function sendReleaseNotification(
  to: string,
  subject: string,
  body: string,
  unsubscribeToken: string,
): Promise<void> {
  const safeBody = escapeHtml(body);

  await transport.sendMail({
    from: `"DojOps" <${FROM}>`,
    to,
    subject,
    html: releaseHtml(subject, safeBody, unsubscribeToken),
    text: releaseText(subject, body, unsubscribeToken),
    headers: {
      "List-Unsubscribe": `<${HUB_URL}/api/newsletter/unsubscribe?token=${unsubscribeToken}>`,
    },
  });
}

function releaseText(subject: string, body: string, unsubscribeToken: string): string {
  return `${subject}

${body}

Links:
  Docs: https://doc.dojops.ai
  GitHub: https://github.com/dojops/dojops
  npm: https://www.npmjs.com/package/@dojops/cli
${unsubscribeFooterText(unsubscribeToken)}`;
}

function releaseHtml(subject: string, safeBody: string, unsubscribeToken: string): string {
  // Convert newlines to <br> for display (content is already HTML-escaped)
  const formattedBody = safeBody.replace(/\n/g, "<br>");

  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050508;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0d1117;border-radius:16px;overflow:hidden;border:1px solid #1e2432">
        <tr><td style="padding:40px 40px 24px;text-align:center">
          <img src="https://dojops.ai/icons/dojops-new-logo.png" width="64" height="64" alt="DojOps" style="border-radius:12px">
        </td></tr>
        <tr><td style="padding:0 40px 32px">
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#e8edf5;text-align:center">
            ${escapeHtml(subject)}
          </h1>
          <div style="background:#161921;border:1px solid #2a2d37;border-radius:10px;padding:20px;margin-bottom:24px">
            <p style="margin:0;font-size:14px;line-height:1.7;color:#b0b8c8;font-family:'JetBrains Mono',Menlo,monospace;white-space:pre-wrap">
              ${formattedBody}
            </p>
          </div>
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding:4px">
                <a href="https://doc.dojops.ai" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#06b6d4,#3b82f6);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px">
                  Read the Docs
                </a>
              </td>
              <td align="center" style="padding:4px">
                <a href="https://github.com/dojops/dojops" style="display:inline-block;padding:10px 24px;background:#161921;border:1px solid #2a2d37;color:#e8edf5;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px">
                  View on GitHub
                </a>
              </td>
            </tr>
          </table>
        </td></tr>
        ${unsubscribeFooterHtml(unsubscribeToken)}
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
