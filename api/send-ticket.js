import nodemailer from 'nodemailer';

const DEFAULT_TEXT_TEMPLATE = `Hello {name},

We are excited to have you join us at the upcoming GGSC event!

Your personalized visual ticket containing your entry QR code has been generated and is attached to this email. Please carry a digital or printed copy of this ticket with you to the registration desk on the event day.

Important Event Guidelines:
- Please keep your QR code intact and clear.
- Do not share this ticket with anyone. Each ticket can only be scanned once.

See you at the event!

Best regards,
GGSC Organizing Committee
UEM Kolkata`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
  }

  const { recipientEmail, recipientName, ticketImage, smtpConfig, mailTemplate } = req.body;

  // Validate required inputs
  if (!recipientEmail || !recipientName || !ticketImage || !smtpConfig) {
    return res.status(400).json({ error: 'Missing required parameters: recipientEmail, recipientName, ticketImage, or smtpConfig' });
  }

  const { host, port, secure, user, pass, fromName } = smtpConfig;
  if (!host || !port || !user || !pass) {
    return res.status(400).json({ error: 'Missing SMTP configuration details' });
  }

  try {
    // Decode base64 image data URL
    const base64Data = ticketImage.split(',')[1] || ticketImage;
    const ticketImageBuffer = Buffer.from(base64Data, 'base64');

    // Create dynamic transporter using admin credentials
    const transporter = nodemailer.createTransport({
      host,
      port: parseInt(port, 10),
      secure: secure === true || secure === 'true', // true for 465, false for 587/others
      auth: {
        user,
        pass
      },
      tls: {
        rejectUnauthorized: false // Helps bypass issues with some custom domains
      }
    });

    // Compile plain-text template placeholders safely
    const rawTemplate = mailTemplate || DEFAULT_TEXT_TEMPLATE;
    const replacedText = rawTemplate
      .replace(/{name}/gi, recipientName)
      .replace(/{email}/gi, recipientEmail);

    // Escape raw HTML tags to prevent broken injection
    const escapedText = replacedText
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

    // Convert newlines to HTML line breaks
    const bodyHtml = escapedText.replace(/\n/g, '<br />');

    // Wrap plain text in a beautifully styled premium card layout
    const finalHtml = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #1f2937; max-width: 580px; margin: 0 auto; border: 1px solid #e5e7eb; border-radius: 16px; padding: 32px; background-color: #ffffff; box-shadow: 0 4px 10px rgba(0,0,0,0.015);">
        <div style="margin-bottom: 24px; border-bottom: 1px solid #f3f4f6; padding-bottom: 16px;">
          <span style="font-size: 16px; font-weight: 800; color: #2563eb; letter-spacing: 0.05em; text-transform: uppercase;">GGSC Event Portal</span>
        </div>
        <div style="font-size: 14px; color: #374151; white-space: normal;">
          ${bodyHtml}
        </div>
        <div style="margin-top: 32px; padding-top: 16px; border-top: 1px solid #f3f4f6; font-size: 11px; color: #9ca3af; text-align: center;">
          This is an automated dispatch. Please do not reply directly to this mail.
        </div>
      </div>
    `;

    const displaySender = fromName || 'GGSC Organizing Team';
    const mailOptions = {
      from: `"${displaySender}" <${user}>`,
      to: recipientEmail,
      subject: `🎟️ Entry Ticket for GGSC - ${recipientName}`,
      html: finalHtml,
      attachments: [
        {
          filename: `GGSC_Ticket_${recipientName.replace(/[^a-zA-Z0-9]/g, '_')}.png`,
          content: ticketImageBuffer,
          contentType: 'image/png'
        }
      ]
    };

    // Verify SMTP connection
    await transporter.verify();

    // Send Mail
    const info = await transporter.sendMail(mailOptions);

    return res.status(200).json({ success: true, messageId: info.messageId });
  } catch (error) {
    console.error('Email sending error:', error);
    return res.status(500).json({ error: `Failed to deliver email: ${error.message}` });
  }
}
