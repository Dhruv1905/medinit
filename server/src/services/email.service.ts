import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Verify transporter on startup
transporter.verify().then(() => {
  console.log("📧 Email service ready");
}).catch((err) => {
  console.error("❌ Email service error:", err.message);
});

/**
 * Send OTP email for password reset
 */
export const sendOtpEmail = async (to: string, otp: string): Promise<void> => {
  const mailOptions = {
    from: `"MediNIT" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Password Reset OTP — MediNIT",
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%); border-radius: 16px; overflow: hidden;">
        <div style="padding: 40px 32px; text-align: center; color: white;">
          <div style="width: 60px; height: 60px; margin: 0 auto 16px; background: rgba(255,255,255,0.15); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 28px;">
            🏥
          </div>
          <h1 style="margin: 0 0 8px; font-size: 24px; font-weight: 800; letter-spacing: -0.02em;">MediNIT</h1>
          <p style="margin: 0; opacity: 0.8; font-size: 14px;">Institute Clinic Management System</p>
        </div>
        <div style="background: white; padding: 32px; border-radius: 16px 16px 0 0;">
          <h2 style="margin: 0 0 12px; color: #1e3a5f; font-size: 20px;">Password Reset Request</h2>
          <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 24px;">
            We received a request to reset your password. Use the OTP below to proceed. This code is valid for <strong>10 minutes</strong>.
          </p>
          <div style="background: linear-gradient(135deg, #eff6ff, #dbeafe); border: 2px dashed #3b82f6; border-radius: 12px; padding: 20px; text-align: center; margin: 0 0 24px;">
            <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #1d4ed8; font-family: 'Courier New', monospace;">${otp}</span>
          </div>
          <p style="color: #94a3b8; font-size: 12px; margin: 0; line-height: 1.5;">
            If you didn't request this, please ignore this email. Your password will remain unchanged.
          </p>
        </div>
        <div style="background: #f8fafc; padding: 16px 32px; text-align: center;">
          <p style="margin: 0; color: #94a3b8; font-size: 11px;">© ${new Date().getFullYear()} MediNIT — NIT Warangal Health Center</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

/**
 * Send contact form message to admin
 */
export const sendContactEmail = async (
  name: string,
  email: string,
  subject: string,
  message: string
): Promise<void> => {
  const adminEmail = process.env.ADMIN_EMAIL || process.env.EMAIL_USER;

  const mailOptions = {
    from: `"MediNIT Contact" <${process.env.EMAIL_USER}>`,
    to: adminEmail,
    replyTo: email,
    subject: `[MediNIT Contact] ${subject}`,
    html: `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 500px; margin: 0 auto; background: linear-gradient(135deg, #1e3a5f 0%, #1d4ed8 100%); border-radius: 16px; overflow: hidden;">
        <div style="padding: 32px; text-align: center; color: white;">
          <h1 style="margin: 0 0 4px; font-size: 22px; font-weight: 800;">New Contact Message</h1>
          <p style="margin: 0; opacity: 0.8; font-size: 13px;">MediNIT Contact Form Submission</p>
        </div>
        <div style="background: white; padding: 32px;">
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600; width: 80px;">From:</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${name}</td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">Email:</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px;"><a href="mailto:${email}" style="color: #3b82f6;">${email}</a></td>
            </tr>
            <tr>
              <td style="padding: 8px 0; color: #64748b; font-size: 13px; font-weight: 600;">Subject:</td>
              <td style="padding: 8px 0; color: #1e293b; font-size: 14px;">${subject}</td>
            </tr>
          </table>
          <div style="background: #f8fafc; border-radius: 10px; padding: 16px; border-left: 4px solid #3b82f6;">
            <p style="color: #64748b; font-size: 12px; margin: 0 0 8px; font-weight: 600;">Message:</p>
            <p style="color: #1e293b; font-size: 14px; line-height: 1.6; margin: 0; white-space: pre-wrap;">${message}</p>
          </div>
        </div>
        <div style="background: #f8fafc; padding: 16px 32px; text-align: center;">
          <p style="margin: 0; color: #94a3b8; font-size: 11px;">© ${new Date().getFullYear()} MediNIT — NIT Warangal Health Center</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
