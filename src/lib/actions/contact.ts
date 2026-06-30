"use server";

import nodemailer from "nodemailer";

export async function sendContactEmail(data: any) {
  const { fullName, email, phone, company, subject, message } = data;

  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USERNAME || process.env.SMTP_USER || "";
    let smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || "";
    
    // Strip leading/trailing double quotes if they exist in the environment variables
    if (smtpPass.startsWith('"') && smtpPass.endsWith('"')) {
      smtpPass = smtpPass.slice(1, -1);
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465 || process.env.SMTP_PORT === "465",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      tls: {
        rejectUnauthorized: false,
      },
    });

    // To prevent SMTP Sender address rejection (like on Hostinger),
    // the "from" address must be the authenticated SMTP user.
    const fromAddress = smtpUser || 'info@shuru.sa';

    const mailOptions = {
      from: `"Shuru Contact Form" <${fromAddress}>`,
      to: process.env.CONTACT_EMAIL_TO || 'info@shuru.sa',
      replyTo: email,
      subject: `New Contact Form Submission: ${subject}`,
      text: `
        Name: ${fullName}
        Email: ${email}
        Phone: ${phone || "N/A"}
        Company: ${company || "N/A"}

        Message:
        ${message}
      `,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Company:</strong> ${company || "N/A"}</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <h4>Message:</h4>
        <p>${message.replace(/\n/g, '<br>')}</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Failed to send email" 
    };
  }
}

