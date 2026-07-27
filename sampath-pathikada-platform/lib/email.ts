import { Resend } from "resend";

const apiKey = process.env.RESEND_API_KEY;
const fromAddress = process.env.RESEND_FROM_EMAIL;

const resend = apiKey ? new Resend(apiKey) : null;

export async function sendPasswordResetOtpEmail(to: string, otp: string): Promise<void> {
  if (!resend || !fromAddress) {
    throw new Error(
      "RESEND_API_KEY / RESEND_FROM_EMAIL are not configured — cannot send password reset emails."
    );
  }

  await resend.emails.send({
    from: fromAddress,
    to,
    subject: "Your Sampath Pathikada password reset code",
    html: `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:0 auto;padding:24px;">
        <h2 style="color:#111;margin:0 0 12px;">Password reset code</h2>
        <p style="color:#444;font-size:14px;line-height:1.6;">
          Use the code below to reset your Sampath Pathikada account password. It expires in 10 minutes.
        </p>
        <p style="font-size:32px;font-weight:700;letter-spacing:8px;color:#A67C00;margin:24px 0;">
          ${otp}
        </p>
        <p style="color:#888;font-size:12px;">
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    `,
  });
}
