"use server";

import nodemailer from "nodemailer";
import { getStrapiBaseUrl, getStrapiWriteHeaders } from "@/lib/strapi";

export interface ContactSubmissionPayload {
  fullName: string;
  email: string;
  phone?: string;
  company?: string;
  subject?: string;
  message?: string;
  entityType?: string;
  challenge?: string;
  desiredService?: string;
  preferredDate?: string;
}

export type ContactActionResult =
  | { success: true; warning?: string; error?: never }
  | { success: false; error: string; warning?: never };

export async function sendContactEmail(
  data: ContactSubmissionPayload
): Promise<ContactActionResult> {
  const {
    fullName,
    email,
    phone,
    company,
    subject,
    message,
    entityType,
    challenge,
    desiredService,
    preferredDate,
  } = data;

  // 1. Save submission into Strapi (Dedicated /api/contact-submissions with fallback to /api/consultations)
  try {
    const strapiBaseUrl = getStrapiBaseUrl();
    const headers = {
      ...getStrapiWriteHeaders(),
      "Content-Type": "application/json",
    };

    // Dedicated Contact Submissions payload
    const dedicatedPayload = {
      data: {
        fullName,
        email,
        phone,
        company,
        entityType,
        desiredService,
        challenge,
        preferredDate: preferredDate || null,
        message: message || null,
        status: "new",
      },
    };

    let strapiRes = await fetch(`${strapiBaseUrl}/api/contact-submissions`, {
      method: "POST",
      headers,
      body: JSON.stringify(dedicatedPayload),
    });

    // If dedicated endpoint is not yet active on remote Strapi (404), fallback to consultations collection
    if (strapiRes.status === 404) {
      let preferredDateTime = new Date().toISOString();
      if (preferredDate) {
        const parsed = new Date(preferredDate);
        if (!isNaN(parsed.getTime())) {
          preferredDateTime = parsed.toISOString();
        }
      }

      const fullMessage = [
        entityType ? `نوع الجهة / Entity Type: ${entityType}` : null,
        desiredService ? `الخدمة المطلوبة / Desired Service: ${desiredService}` : null,
        challenge ? `التحدي الرئيسي / Primary Challenge: ${challenge}` : null,
        preferredDate ? `الموعد المناسب / Preferred Appointment: ${preferredDate}` : null,
        message ? `الملاحظات / Additional Notes:\n${message}` : null,
      ]
        .filter(Boolean)
        .join("\n\n") || "طلب جلسة تشخيص من صفحة التواصل";

      const fallbackPayload = {
        data: {
          fullName,
          email,
          phone: phone || null,
          company: company || null,
          preferredDateTime,
          message: fullMessage,
        },
      };

      strapiRes = await fetch(`${strapiBaseUrl}/api/consultations`, {
        method: "POST",
        headers,
        body: JSON.stringify(fallbackPayload),
      });
    }

    if (!strapiRes.ok) {
      const errText = await strapiRes.text();
      console.warn("Strapi contact submission API response error:", strapiRes.status, errText);
    } else {
      const savedDoc = await strapiRes.json();
      console.log(
        "Successfully saved contact submission to Strapi:",
        savedDoc.data?.id || savedDoc.data?.documentId
      );
    }
  } catch (strapiErr) {
    console.error("Error saving contact submission to Strapi:", strapiErr);
  }

  // 2. Send email notification via SMTP
  try {
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = Number(process.env.SMTP_PORT) || 587;
    const smtpUser = process.env.SMTP_USERNAME || process.env.SMTP_USER || "";
    let smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || "";

    // Strip leading/trailing double quotes if they exist in the environment variables
    if (smtpPass.startsWith('"') && smtpPass.endsWith('"')) {
      smtpPass = smtpPass.slice(1, -1);
    }

    if (smtpHost && smtpUser && smtpPass) {
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

      const fromAddress = smtpUser || "info@shuru.sa";

      const mailOptions = {
        from: `"Shuru Diagnostic Request" <${fromAddress}>`,
        to: process.env.CONTACT_EMAIL_TO || "info@shuru.sa",
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
          <p>${(message || "N/A").replace(/\n/g, "<br>")}</p>
        `,
      };

      await transporter.sendMail(mailOptions);
    }
    return { success: true };
  } catch (error) {
    console.error("Failed to send email notification:", error);
    return {
      success: true,
      warning: error instanceof Error ? error.message : "Failed to send email",
    };
  }
}


