"use server";

import nodemailer from "nodemailer";

export async function sendContactEmail(data: any) {
  const { fullName, email, phone, company, subject, message, entityType, challenge, desiredService, preferredDate } = data;

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

    const fromAddress = smtpUser || 'info@shuru.sa';

    const mailOptions = {
      from: `"Shuru Diagnostic Request" <${fromAddress}>`,
      to: process.env.CONTACT_EMAIL_TO || 'info@shuru.sa',
      replyTo: email,
      subject: `New Diagnostic Session Booking: ${subject || fullName}`,
      text: `
        Diagnostic Session Request Details:
        ----------------------------------
        Name: ${fullName}
        Email: ${email}
        Phone: ${phone || "N/A"}
        Company / Organization: ${company || "N/A"}
        Entity Type: ${entityType || "N/A"}
        Primary Challenge: ${challenge || "N/A"}
        Desired Service: ${desiredService || "N/A"}
        Preferred Appointment Date/Time: ${preferredDate || "N/A"}

        Additional Details:
        ${message || "N/A"}
      `,
      html: `
        <h3>New Diagnostic Session Request</h3>
        <p><strong>Name:</strong> ${fullName}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Phone:</strong> ${phone || "N/A"}</p>
        <p><strong>Organization:</strong> ${company || "N/A"}</p>
        <p><strong>Entity Type:</strong> ${entityType || "N/A"}</p>
        <p><strong>Primary Challenge:</strong> ${challenge || "N/A"}</p>
        <p><strong>Desired Service:</strong> ${desiredService || "N/A"}</p>
        <p><strong>Preferred Appointment:</strong> ${preferredDate || "N/A"}</p>
        <hr>
        <h4>Notes / Message:</h4>
        <p>${(message || "N/A").replace(/\n/g, '<br>')}</p>
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

