"use server";

import nodemailer from "nodemailer";
import { getStrapiBaseUrl } from "@/lib/strapi";

export async function sendConsultationForm(data: {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  preferredDateTime: string;
  message: string;
}) {
  const { fullName, email, phone, company, preferredDateTime, message } = data;

  try {
    // 1. Submit to Strapi
    const strapiUrl = `${getStrapiBaseUrl()}/api/consultations`;
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    if (process.env.STRAPI_FULL_ACCESS_API_TOKEN) {
      headers["Authorization"] = `Bearer ${process.env.STRAPI_FULL_ACCESS_API_TOKEN}`;
    }

    const response = await fetch(strapiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify({
        data: {
          fullName,
          email,
          phone: phone || null,
          company: company || null,
          preferredDateTime,
          message,
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Failed to save to Strapi:", errText);
      return { success: false, error: "Failed to save to database" };
    }

    // 2. Send Email
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

    const formattedDate = new Date(preferredDateTime).toLocaleString("en-US", {
      dateStyle: "full",
      timeStyle: "short",
    });

    // To prevent SMTP Sender address rejection (like on Hostinger),
    // the "from" address must be the authenticated SMTP user.
    const fromAddress = smtpUser || 'info@shuru.sa';

    const mailOptions = {
      from: `"Shuru Consultation" <${fromAddress}>`,
      to: "info@shuru.sa",
      replyTo: email, // Submitted email as reply-to
      subject: `New Consultation Request: ${fullName}`,
      text: `
        New Consultation Request
        
        Name: ${fullName}
        Email: ${email}
        Phone: ${phone || "N/A"}
        Company: ${company || "N/A"}
        Preferred Date & Time: ${formattedDate}

        Consultation Details:
        ${message}
      `,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; border-radius: 8px;">
          <h2 style="color: #7A2935; border-bottom: 2px solid #C9A84C; padding-bottom: 10px; margin-top: 0;">New Consultation Request</h2>
          <p><strong>Name:</strong> ${fullName}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> ${phone || "N/A"}</p>
          <p><strong>Company:</strong> ${company || "N/A"}</p>
          <p><strong>Preferred Date & Time:</strong> ${formattedDate}</p>
          
          <h3 style="color: #7A2935; border-bottom: 1px solid #eee; padding-bottom: 5px;">Consultation Details:</h3>
          <p style="white-space: pre-wrap; background: #f9f9f9; padding: 15px; border-radius: 4px; border-left: 3px solid #C9A84C;">${message}</p>
        </div>
      `,
    };

    await transporter.sendMail(mailOptions);
    return { success: true };
  } catch (error) {
    console.error("Consultation action error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "An unexpected error occurred" 
    };
  }
}

