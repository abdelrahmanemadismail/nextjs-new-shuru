"use server";

import nodemailer from "nodemailer";
import { getStrapiBaseUrl, getStrapiRequestHeaders } from "@/lib/strapi";

export interface RequestInfoAttachment {
  name: string;
  type: string;
  size: number;
  base64?: string;
}

export interface RequestInfoPayload {
  // Applicant Info
  fullName: string;
  jobTitle: string;
  organization: string;
  department: string;
  email: string;
  phone?: string;
  cityCountry?: string;

  // Request Info
  entityType: string;
  needDomain: string;
  requestTitle: string;
  challengeDescription: string;
  expectedOutcomes?: string;
  currentStage?: string;
  expectedStartDate?: string;
  expectedDuration?: string;
  estimatedBudget?: string;

  // Communication
  preferredContactMethod?: string;
  bestTimeToContact?: string;
  additionalNotes?: string;

  // Files
  rfpFile?: RequestInfoAttachment | null;
  supportingDocs?: RequestInfoAttachment[] | null;

  // Consent
  consent: boolean;
}

export async function sendRequestInfoAction(payload: RequestInfoPayload) {
  try {
    if (!payload.consent) {
      return { success: false, error: "Privacy consent is required." };
    }

    // 1. Save submission directly into Strapi Collection Type (information-requests)
    try {
      const strapiBaseUrl = getStrapiBaseUrl();
      const strapiPayload = {
        data: {
          fullName: payload.fullName,
          jobTitle: payload.jobTitle,
          organization: payload.organization,
          department: payload.department,
          email: payload.email,
          phone: payload.phone || null,
          cityCountry: payload.cityCountry || null,
          entityType: payload.entityType,
          needDomain: payload.needDomain,
          requestTitle: payload.requestTitle,
          challengeDescription: payload.challengeDescription,
          expectedOutcomes: payload.expectedOutcomes || null,
          currentStage: payload.currentStage || null,
          expectedStartDate: payload.expectedStartDate || null,
          expectedDuration: payload.expectedDuration || null,
          estimatedBudget: payload.estimatedBudget || null,
          preferredContactMethod: payload.preferredContactMethod || null,
          bestTimeToContact: payload.bestTimeToContact || null,
          additionalNotes: payload.additionalNotes || null,
          rfpFileName: payload.rfpFile?.name || null,
          supportingDocsCount: Array.isArray(payload.supportingDocs) ? payload.supportingDocs.length : 0,
          status: "new",
        },
      };

      const strapiRes = await fetch(`${strapiBaseUrl}/api/information-requests`, {
        method: "POST",
        headers: {
          ...getStrapiRequestHeaders(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify(strapiPayload),
      });

      if (!strapiRes.ok) {
        const errText = await strapiRes.text();
        console.warn("Strapi information-requests API response:", strapiRes.status, errText);
      } else {
        const savedDoc = await strapiRes.json();
        console.log("Successfully saved submission to Strapi:", savedDoc.data?.id || savedDoc.data?.documentId);
      }
    } catch (strapiErr) {
      console.error("Error saving submission to Strapi:", strapiErr);
    }

    // 2. Send email notification via SMTP
    try {
      const smtpHost = process.env.SMTP_HOST;
      const smtpPort = Number(process.env.SMTP_PORT) || 587;
      const smtpUser = process.env.SMTP_USERNAME || process.env.SMTP_USER || "";
      let smtpPass = process.env.SMTP_PASSWORD || process.env.SMTP_PASS || "";

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
        const toAddress = process.env.CONTACT_EMAIL_TO || "info@shuru.sa";

        // Prepare attachments if any
        const attachments: Array<{ filename: string; content: Buffer; contentType?: string }> = [];

        if (payload.rfpFile?.base64) {
          const base64Data = payload.rfpFile.base64.split(";base64,").pop() || payload.rfpFile.base64;
          attachments.push({
            filename: `RFP_${payload.rfpFile.name}`,
            content: Buffer.from(base64Data, "base64"),
            contentType: payload.rfpFile.type,
          });
        }

        if (payload.supportingDocs && Array.isArray(payload.supportingDocs)) {
          for (const doc of payload.supportingDocs) {
            if (doc.base64) {
              const base64Data = doc.base64.split(";base64,").pop() || doc.base64;
              attachments.push({
                filename: doc.name,
                content: Buffer.from(base64Data, "base64"),
                contentType: doc.type,
              });
            }
          }
        }

        const mailSubject = `[طلب معلومات جديد - RFI] ${payload.requestTitle} - ${payload.organization}`;

        const htmlContent = `
          <div dir="rtl" style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #1e293b; max-width: 680px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; background-color: #ffffff; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);">
            
            <div style="background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%); color: #ffffff; padding: 28px 24px; text-align: center; border-bottom: 3px solid #C9A84C;">
              <h2 style="margin: 0 0 8px 0; font-size: 22px; color: #ffffff;">طلب معلومات واستشارات جديد (RFI)</h2>
              <p style="margin: 0; font-size: 14px; color: #94a3b8;">تم استلام طلب جديد وحفظه في لوحة التحكم Strapi</p>
            </div>

            <div style="padding: 24px;">

              <!-- قسم مقدم الطلب -->
              <div style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; margin-bottom: 14px; font-size: 16px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
                  👤 معلومات مقدم الطلب
                </h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; width: 35%;">الاسم الكامل:</td>
                    <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${payload.fullName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">المسمى الوظيفي:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${payload.jobTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">اسم الجهة:</td>
                    <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${payload.organization}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">الإدارة / القسم:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${payload.department}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">البريد الإلكتروني للعمل:</td>
                    <td style="padding: 6px 0; color: #0284c7;"><a href="mailto:${payload.email}" style="color: #0284c7; text-decoration: none;">${payload.email}</a></td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">رقم الجوال:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${payload.phone || "غير محدد"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">المدينة / الدولة:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${payload.cityCountry || "غير محدد"}</td>
                  </tr>
                </table>
              </div>

              <!-- قسم تفاصيل الطلب -->
              <div style="margin-bottom: 24px; background-color: #f8fafc; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; margin-bottom: 14px; font-size: 16px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
                  📋 تفاصيل الطلب والاحتياج
                </h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; width: 35%;">نوع الجهة:</td>
                    <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${payload.entityType}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">مجال الاحتياج:</td>
                    <td style="padding: 6px 0; font-weight: bold; color: #b45309;">${payload.needDomain}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">عنوان الطلب:</td>
                    <td style="padding: 6px 0; font-weight: bold; color: #0f172a;">${payload.requestTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">المرحلة الحالية:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${payload.currentStage || "غير محدد"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">الموعد المتوقع للبدء:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${payload.expectedStartDate || "غير محدد"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">المدة المتوقعة:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${payload.expectedDuration || "غير محدد"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">الميزانية التقديرية:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${payload.estimatedBudget || "لم تحدد بعد"}</td>
                  </tr>
                </table>

                <div style="margin-top: 14px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
                  <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #475569;">وصف الاحتياج أو التحدي:</h4>
                  <p style="margin: 0; font-size: 14px; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${payload.challengeDescription}</p>
                </div>

                ${
                  payload.expectedOutcomes
                    ? `
                <div style="margin-top: 12px;">
                  <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #475569;">النتائج المتوقعة:</h4>
                  <p style="margin: 0; font-size: 14px; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0; white-space: pre-wrap;">${payload.expectedOutcomes}</p>
                </div>`
                    : ""
                }
              </div>

              <!-- قسم التواصل والمستندات -->
              <div style="background-color: #f8fafc; border-radius: 12px; padding: 18px; border: 1px solid #e2e8f0;">
                <h3 style="margin-top: 0; margin-bottom: 14px; font-size: 16px; color: #0f172a; border-bottom: 2px solid #e2e8f0; padding-bottom: 6px;">
                  📞 التواصل والمرفقات
                </h3>
                <table style="width: 100%; border-collapse: collapse; font-size: 14px;">
                  <tr>
                    <td style="padding: 6px 0; color: #64748b; width: 35%;">طريقة التواصل المفضلة:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${payload.preferredContactMethod || "غير محدد"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">أفضل وقت للتواصل:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${payload.bestTimeToContact || "غير محدد"}</td>
                  </tr>
                  <tr>
                    <td style="padding: 6px 0; color: #64748b;">الملفات المرفقة:</td>
                    <td style="padding: 6px 0; color: #0f172a;">${attachments.length > 0 ? `${attachments.length} ملف(ات) مرفقة مع البريد` : "لا توجد مرفقات"}</td>
                  </tr>
                </table>

                ${
                  payload.additionalNotes
                    ? `
                <div style="margin-top: 12px; padding-top: 12px; border-top: 1px dashed #cbd5e1;">
                  <h4 style="margin: 0 0 6px 0; font-size: 13px; color: #475569;">ملاحظات إضافية:</h4>
                  <p style="margin: 0; font-size: 14px; background: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #e2e8f0;">${payload.additionalNotes}</p>
                </div>`
                    : ""
                }
              </div>

            </div>

            <div style="background-color: #f1f5f9; padding: 14px 24px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0;">
              تم الإرسال والحفظ عبر نظام طلب المعلومات - منصة شروع الاستشارية
            </div>
          </div>
        `;

        const mailOptions = {
          from: `"SHURU RFI Portal" <${fromAddress}>`,
          to: toAddress,
          replyTo: payload.email,
          subject: mailSubject,
          text: `
طلب معلومات واستشارات جديد (RFI)
----------------------------------
مقدم الطلب: ${payload.fullName} (${payload.jobTitle})
الجهة: ${payload.organization} - ${payload.department}
البريد: ${payload.email}
الجوال: ${payload.phone || "N/A"}
المدينة: ${payload.cityCountry || "N/A"}

تفاصيل الطلب:
نوع الجهة: ${payload.entityType}
مجال الاحتياج: ${payload.needDomain}
عنوان الطلب: ${payload.requestTitle}
المرحلة الحالية: ${payload.currentStage || "N/A"}
الموعد المتوقع للبدء: ${payload.expectedStartDate || "N/A"}
المدة المتوقعة: ${payload.expectedDuration || "N/A"}
الميزانية التقديرية: ${payload.estimatedBudget || "لم تحدد بعد"}

وصف الاحتياج:
${payload.challengeDescription}

النتائج المتوقعة:
${payload.expectedOutcomes || "N/A"}

التواصل والملاحظات:
طريقة التواصل المفضلة: ${payload.preferredContactMethod || "N/A"}
أفضل وقت للتواصل: ${payload.bestTimeToContact || "N/A"}
ملاحظات: ${payload.additionalNotes || "N/A"}
عدد المرفقات: ${attachments.length}
          `,
          html: htmlContent,
          attachments,
        };

        await transporter.sendMail(mailOptions);
      }
    } catch (mailErr) {
      console.warn("SMTP email notification warning:", mailErr);
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to process request info submission:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit request",
    };
  }
}
