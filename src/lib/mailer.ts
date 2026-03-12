import nodemailer from "nodemailer";

const port = Number(process.env.SMTP_PORT) || 587;

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "mail.privateemail.com",
  port,
  secure: port === 465, // true for 465 (SSL), false for 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || process.env.SMTP_USER || "noreply@dojops.ai";

export async function sendWelcomeEmail(to: string): Promise<void> {
  await transport.sendMail({
    from: `"DojOps" <${FROM}>`,
    to,
    subject: "Welcome to DojOps — You're In!",
    html: welcomeHtml(),
    text: welcomeText(),
  });
}

function welcomeText(): string {
  return `Welcome to DojOps!

Thanks for subscribing. You'll receive updates on new modules, provider integrations, and releases.

Get started:
  npm i -g @dojops/cli

Links:
  Docs: https://docs.dojops.ai
  GitHub: https://github.com/dojops/dojops
  Hub: https://hub.dojops.ai

No spam, unsubscribe anytime by replying to this email.

— The DojOps Team`;
}

function welcomeHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#050508;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#050508;padding:40px 20px">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#0d1117;border-radius:16px;overflow:hidden;border:1px solid #1e2432">
        <!-- Header -->
        <tr><td style="padding:40px 40px 24px;text-align:center">
          <img src="https://dojops.ai/icons/dojops-new-icon.png" width="64" height="64" alt="DojOps" style="border-radius:12px">
        </td></tr>
        <!-- Body -->
        <tr><td style="padding:0 40px 32px">
          <h1 style="margin:0 0 16px;font-size:24px;font-weight:700;color:#e8edf5;text-align:center">
            Welcome to DojOps!
          </h1>
          <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:#7b8ba3;text-align:center">
            Thanks for subscribing. You'll receive updates on new modules, provider integrations, and releases — straight to your inbox.
          </p>
          <!-- Install box -->
          <div style="background:#161921;border:1px solid #2a2d37;border-radius:10px;padding:16px 20px;margin-bottom:24px">
            <p style="margin:0 0 8px;font-size:11px;text-transform:uppercase;letter-spacing:0.5px;color:#5a6478;font-weight:600">Get started</p>
            <code style="font-size:14px;color:#00e5ff;font-family:'JetBrains Mono',Menlo,monospace">npm i -g @dojops/cli</code>
          </div>
          <!-- Links -->
          <table width="100%" cellpadding="0" cellspacing="0">
            <tr>
              <td align="center" style="padding:4px">
                <a href="https://docs.dojops.ai" style="display:inline-block;padding:10px 24px;background:linear-gradient(135deg,#06b6d4,#3b82f6);color:#fff;font-size:14px;font-weight:600;text-decoration:none;border-radius:8px">
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
        <!-- Footer -->
        <tr><td style="padding:24px 40px;border-top:1px solid #1e2432;text-align:center">
          <p style="margin:0;font-size:12px;color:#5a6478">
            No spam, unsubscribe anytime by replying to this email.
          </p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}
