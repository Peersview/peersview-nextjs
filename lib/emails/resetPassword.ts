export function resetPasswordEmail(name: string, resetUrl: string): string {
  return `
<!DOCTYPE html>
<html>
  <body style="font-family: Arial, sans-serif; background:#f5f5f7; padding:32px; color:#1f1f1f;">
    <div style="max-width:560px; margin:0 auto; background:#fff; border-radius:12px; padding:32px;">
      <h1 style="color:#3d1f5d; margin:0 0 16px;">Reset your password</h1>
      <p style="font-size:15px; line-height:1.5;">
        Hi ${escapeHtml(name)}, we received a request to reset your Peersview password.
        Click the button below to choose a new one.
      </p>
      <p style="margin:24px 0;">
        <a href="${resetUrl}"
           style="display:inline-block; background:#3d1f5d; color:#fff; text-decoration:none;
                  padding:12px 24px; border-radius:8px; font-weight:600;">
          Reset Password
        </a>
      </p>
      <p style="font-size:13px; color:#666; word-break:break-all;">
        Or paste this link into your browser:<br/>
        <a href="${resetUrl}" style="color:#3d1f5d;">${resetUrl}</a>
      </p>
      <hr style="border:none; border-top:1px solid #eee; margin:24px 0;" />
      <p style="font-size:12px; color:#999;">
        This link will expire in 1 hour. If you did not request a password reset, you can safely ignore this email.
      </p>
    </div>
  </body>
</html>
  `.trim();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
