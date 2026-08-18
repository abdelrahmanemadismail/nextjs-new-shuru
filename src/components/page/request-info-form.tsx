"use client";

import { useState, useTransition, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  User,
  Building2,
  FileText,
  MessageSquare,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Paperclip,
  Trash2,
  Clock,
  ShieldCheck,
  Briefcase,
  Layers,
  Send,
  Calendar,
  DollarSign,
  Phone,
  Mail,
  HelpCircle,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { sendRequestInfoAction, type RequestInfoAttachment } from "@/lib/actions/request-info";

interface UploadedFileState {
  file: File;
  name: string;
  size: number;
  type: string;
  base64?: string;
}

export interface RequestInfoFormProps {
  workflowBadge?: string;
  workflowTitle?: string;
  workflowStep1Number?: string;
  workflowStep1Title?: string;
  workflowStep1Desc?: string;
  workflowStep2Number?: string;
  workflowStep2Title?: string;
  workflowStep2Desc?: string;
  workflowStep3Number?: string;
  workflowStep3Title?: string;
  workflowStep3Desc?: string;
  consentText?: string;
}

export function RequestInfoForm({
  workflowBadge,
  workflowTitle,
  workflowStep1Number,
  workflowStep1Title,
  workflowStep1Desc,
  workflowStep2Number,
  workflowStep2Title,
  workflowStep2Desc,
  workflowStep3Number,
  workflowStep3Title,
  workflowStep3Desc,
  consentText,
}: RequestInfoFormProps = {}) {
  const t = useTranslations("requestInfo");
  const [isPending, startTransition] = useTransition();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [rfpFile, setRfpFile] = useState<UploadedFileState | null>(null);
  const [supportingDocs, setSupportingDocs] = useState<UploadedFileState[]>([]);

  const rfpInputRef = useRef<HTMLInputElement>(null);
  const supportingInputRef = useRef<HTMLInputElement>(null);

  const pathname = usePathname();
  const localeMatch = pathname?.match(/^\/(ar|en)/);
  const locale = localeMatch ? localeMatch[1] : "ar";
  const isAr = locale === "ar";

  const formSchema = z.object({
    // Applicant Info
    fullName: z.string().min(2, { message: isAr ? "الاسم الكامل مطلوب" : "Full name is required" }),
    jobTitle: z.string().min(2, { message: isAr ? "المسمى الوظيفي مطلوب" : "Job title is required" }),
    organization: z.string().min(2, { message: isAr ? "اسم الجهة مطلوب" : "Organization name is required" }),
    department: z.string().min(2, { message: isAr ? "الإدارة / القسم مطلوب" : "Department is required" }),
    email: z.string().email({ message: isAr ? "يرجى إدخال بريد إلكتروني صحيح للعمل" : "Valid work email is required" }),
    phone: z.string().optional(),
    cityCountry: z.string().optional(),

    // Request Info
    entityType: z.string().min(1, { message: isAr ? "يرجى تحديد نوع الجهة" : "Please select entity type" }),
    needDomain: z.string().min(1, { message: isAr ? "يرجى تحديد مجال الاحتياج" : "Please select area of need" }),
    requestTitle: z.string().min(3, { message: isAr ? "عنوان الطلب مطلوب" : "Request title is required" }),
    challengeDescription: z.string().min(10, {
      message: isAr ? "يرجى تقديم وصف للاحتياج أو التحدي (10 أحرف على الأقل)" : "Please describe your need or challenge (at least 10 chars)",
    }),
    expectedOutcomes: z.string().optional(),
    currentStage: z.string().optional(),
    expectedStartDate: z.string().optional(),
    expectedDuration: z.string().optional(),
    estimatedBudget: z.string().optional(),

    // Communication
    preferredContactMethod: z.string().optional(),
    bestTimeToContact: z.string().optional(),
    additionalNotes: z.string().optional(),

    // Consent
    consent: z.boolean().refine((val) => val === true, {
      message: isAr ? "يجب الموافقة على الشروط للمتابعة" : "You must agree to the privacy policy to proceed",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      jobTitle: "",
      organization: "",
      department: "",
      email: "",
      phone: "",
      cityCountry: "",
      entityType: isAr ? "جهة حكومية" : "Government Entity",
      needDomain: isAr ? "تأسيس أو تطوير PMO" : "PMO Setup & Enhancement",
      requestTitle: "",
      challengeDescription: "",
      expectedOutcomes: "",
      currentStage: isAr ? "إعداد نطاق العمل" : "Scope of Work Preparation",
      expectedStartDate: "",
      expectedDuration: "",
      estimatedBudget: isAr ? "لم تحدد بعد" : "Not determined yet",
      preferredContactMethod: isAr ? "البريد الإلكتروني" : "Email",
      bestTimeToContact: "",
      additionalNotes: "",
      consent: false,
    },
  });

  // Convert File to Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleRfpFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      toast.error(isAr ? "حجم الملف يتجاوز الحد المسموح (20 ميجابايت)" : "File size exceeds 20 MB limit");
      return;
    }

    try {
      const base64 = await fileToBase64(file);
      setRfpFile({
        file,
        name: file.name,
        size: file.size,
        type: file.type || "application/octet-stream",
        base64,
      });
    } catch {
      toast.error(isAr ? "تعذر قراءة الملف" : "Failed to read file");
    }
  };

  const handleSupportingDocsChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newDocs: UploadedFileState[] = [];
    for (const file of files) {
      if (file.size > 20 * 1024 * 1024) {
        toast.error(isAr ? `الملف ${file.name} يتجاوز 20 ميجابايت` : `File ${file.name} exceeds 20 MB`);
        continue;
      }
      try {
        const base64 = await fileToBase64(file);
        newDocs.push({
          file,
          name: file.name,
          size: file.size,
          type: file.type || "application/octet-stream",
          base64,
        });
      } catch {
        // Skip failed
      }
    }
    setSupportingDocs((prev) => [...prev, ...newDocs]);
  };

  const removeSupportingDoc = (index: number) => {
    setSupportingDocs((prev) => prev.filter((_, i) => i !== index));
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const rfpPayload: RequestInfoAttachment | null = rfpFile
          ? {
              name: rfpFile.name,
              type: rfpFile.type,
              size: rfpFile.size,
              base64: rfpFile.base64,
            }
          : null;

        const supportingPayload: RequestInfoAttachment[] = supportingDocs.map((d) => ({
          name: d.name,
          type: d.type,
          size: d.size,
          base64: d.base64,
        }));

        const result = await sendRequestInfoAction({
          ...values,
          rfpFile: rfpPayload,
          supportingDocs: supportingPayload,
        });

        if (result.success) {
          setIsSubmitted(true);
          toast.success(
            isAr
              ? "تم إرسال طلبكم بنجاح! سيتواصل معكم فريق شروع قريباً."
              : "Your request has been submitted successfully! The Shuru team will contact you soon."
          );
          window.scrollTo({ top: 0, behavior: "smooth" });
        } else {
          toast.error(result.error || (isAr ? "حدث خطأ أثناء إرسال الطلب" : "Failed to submit request"));
        }
      } catch (err) {
        console.error("Submission error:", err);
        toast.error(isAr ? "حدث خطأ غير متوقع. يرجى المحاولة لاحقاً." : "An unexpected error occurred. Please try again.");
      }
    });
  }

  // Render Success State View
  if (isSubmitted) {
    return (
      <div className="w-full max-w-3xl mx-auto py-12 px-4 sm:px-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-card border border-primary/20 rounded-3xl p-8 sm:p-12 shadow-2xl relative overflow-hidden text-center">
          <div className="absolute -top-24 -right-24 w-72 h-72 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

          {/* Success Icon */}
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-emerald-500/20 to-primary/20 text-emerald-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-emerald-500/10 animate-bounce">
            <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold mb-4 border border-emerald-500/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAr ? "تم استلام الطلب بنجاح" : "Request Successfully Received"}</span>
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4">
            {t("success.title")}
          </h2>

          <p className="text-muted-foreground text-base sm:text-lg max-w-xl mx-auto leading-relaxed mb-10">
            {t("success.message")}
          </p>

          {/* What happens next (recap on success) */}
          <div className="bg-muted/40 rounded-2xl p-6 mb-8 text-start border border-border/60">
            <h4 className="text-sm font-bold text-foreground mb-4 flex items-center gap-2">
              <Clock className="w-4 h-4 text-primary" />
              <span>{t("whatHappensNext.title")}</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-card p-4 rounded-xl border border-border/50">
                <span className="text-xs font-bold text-primary block mb-1">01</span>
                <p className="text-xs font-semibold text-foreground">{t("whatHappensNext.step1.title")}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{t("whatHappensNext.step1.desc")}</p>
              </div>
              <div className="bg-card p-4 rounded-xl border border-border/50">
                <span className="text-xs font-bold text-primary block mb-1">02</span>
                <p className="text-xs font-semibold text-foreground">{t("whatHappensNext.step2.title")}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{t("whatHappensNext.step2.desc")}</p>
              </div>
              <div className="bg-card p-4 rounded-xl border border-border/50">
                <span className="text-xs font-bold text-primary block mb-1">03</span>
                <p className="text-xs font-semibold text-foreground">{t("whatHappensNext.step3.title")}</p>
                <p className="text-[11px] text-muted-foreground mt-1">{t("whatHappensNext.step3.desc")}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => {
                form.reset();
                setRfpFile(null);
                setSupportingDocs([]);
                setIsSubmitted(false);
              }}
              className="w-full sm:w-auto px-6 py-3 rounded-full border border-border bg-card hover:bg-accent text-foreground text-sm font-semibold transition-all shadow-sm"
            >
              {t("success.anotherRequest")}
            </button>
            <Link
              href={`/${locale}`}
              className="w-full sm:w-auto px-8 py-3 rounded-full bg-primary text-primary-foreground text-sm font-bold shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2"
            >
              <span>{t("success.backHome")}</span>
              <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-12">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          {/* SECTION 1: Applicant Information */}
          <div className="rounded-3xl bg-card border border-border/70 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/60">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{t("sections.applicant")}</h3>
                <p className="text-xs text-muted-foreground">
                  {isAr ? "البيانات الأساسية لممثل الجهة والتواصل الأولي" : "Key contact information of the representative"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                      {t("fields.fullName")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={isAr ? "مثال: د. عبدالله التميمي" : "e.g. Dr. Abdullah Al-Tamimi"}
                        className="rounded-xl h-11"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="jobTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                      {t("fields.jobTitle")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={isAr ? "مثال: مدير إدارة المشاريع / مستشار التحول" : "e.g. PMO Director / Transformation Lead"}
                        className="rounded-xl h-11"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="organization"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                      {t("fields.organization")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={isAr ? "اسم الوزارة، الهيئة، أو الشركة" : "Ministry, Authority, or Enterprise Name"}
                        className="rounded-xl h-11"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                      {t("fields.department")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={isAr ? "الإدارة العامة للاستراتيجية / مكتب تحقيق الرؤية" : "Strategy Office / VRO / Operations"}
                        className="rounded-xl h-11"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                      {t("fields.email")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="name@entity.gov.sa"
                        className="rounded-xl h-11"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      {t("fields.phone")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="+966 5X XXX XXXX"
                        className="rounded-xl h-11"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cityCountry"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      {t("fields.cityCountry")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={isAr ? "الرياض، المملكة العربية السعودية" : "Riyadh, Saudi Arabia"}
                        className="rounded-xl h-11"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* SECTION 2: Request Information */}
          <div className="rounded-3xl bg-card border border-border/70 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/60">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <Briefcase className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{t("sections.request")}</h3>
                <p className="text-xs text-muted-foreground">
                  {isAr ? "تحديد طبيعة التكليف والقطاع والنتائج المنشودة" : "Define the scope, entity sector, and expected outcomes"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="entityType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                      {t("fields.entityType")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={isPending}
                        className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring h-11"
                      >
                        <option value={t("options.entityTypes.government")}>{t("options.entityTypes.government")}</option>
                        <option value={t("options.entityTypes.private")}>{t("options.entityTypes.private")}</option>
                        <option value={t("options.entityTypes.nonProfit")}>{t("options.entityTypes.nonProfit")}</option>
                        <option value={t("options.entityTypes.startup")}>{t("options.entityTypes.startup")}</option>
                        <option value={t("options.entityTypes.other")}>{t("options.entityTypes.other")}</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="needDomain"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                      {t("fields.needDomain")} <span className="text-destructive">*</span>
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={isPending}
                        className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring h-11"
                      >
                        <option value={t("options.needDomains.pmo")}>{t("options.needDomains.pmo")}</option>
                        <option value={t("options.needDomains.maturity")}>{t("options.needDomains.maturity")}</option>
                        <option value={t("options.needDomains.governance")}>{t("options.needDomains.governance")}</option>
                        <option value={t("options.needDomains.knowledge")}>{t("options.needDomains.knowledge")}</option>
                        <option value={t("options.needDomains.digitalAi")}>{t("options.needDomains.digitalAi")}</option>
                        <option value={t("options.needDomains.benefits")}>{t("options.needDomains.benefits")}</option>
                        <option value={t("options.needDomains.ppm")}>{t("options.needDomains.ppm")}</option>
                        <option value={t("options.needDomains.executiveStudies")}>{t("options.needDomains.executiveStudies")}</option>
                        <option value={t("options.needDomains.experts")}>{t("options.needDomains.experts")}</option>
                        <option value={t("options.needDomains.contactRequest")}>{t("options.needDomains.contactRequest")}</option>
                        <option value={t("options.needDomains.other")}>{t("options.needDomains.other")}</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="requestTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    {t("fields.requestTitle")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder={
                        isAr
                          ? "مثال: مشروع تأسيس مكتب إدارة المشاريع والتحول الرقمي لعام 2026"
                          : "e.g. PMO Establishment & Strategic Execution Support Project 2026"
                      }
                      className="rounded-xl h-11"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="challengeDescription"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-foreground flex items-center gap-1">
                    {t("fields.challengeDescription")} <span className="text-destructive">*</span>
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        isAr
                          ? "وضح أبرز التحديات الحالية، نطاق العمل المتوقع، والأهداف الاستراتيجية التي تسعون لتحقيقها..."
                          : "Describe current challenges, estimated scope of work, and key strategic objectives..."
                      }
                      className="min-h-[120px] rounded-xl leading-relaxed"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="expectedOutcomes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-foreground">
                    {t("fields.expectedOutcomes")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={
                        isAr
                          ? "ما هي المخرجات الملموسة أو مؤشرات النجاح المتوقعة من هذا التكليف؟"
                          : "What are the tangible deliverables and success indicators expected?"
                      }
                      className="min-h-[80px] rounded-xl"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5">
              <FormField
                control={form.control}
                name="currentStage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      {t("fields.currentStage")}
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={isPending}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring h-11"
                      >
                        <option value={t("options.stages.discovery")}>{t("options.stages.discovery")}</option>
                        <option value={t("options.stages.sowPrep")}>{t("options.stages.sowPrep")}</option>
                        <option value={t("options.stages.proposalPrep")}>{t("options.stages.proposalPrep")}</option>
                        <option value={t("options.stages.bidEval")}>{t("options.stages.bidEval")}</option>
                        <option value={t("options.stages.existingSupport")}>{t("options.stages.existingSupport")}</option>
                        <option value={t("options.stages.other")}>{t("options.stages.other")}</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedStartDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      {t("fields.expectedStartDate")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        className="rounded-xl h-11 text-xs"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="expectedDuration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      {t("fields.expectedDuration")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={isAr ? "مثال: 6 أشهر" : "e.g. 6 Months"}
                        className="rounded-xl h-11 text-xs"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="estimatedBudget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      {t("fields.estimatedBudget")}
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={isPending}
                        className="w-full rounded-xl border border-input bg-background px-3 py-2 text-xs ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring h-11"
                      >
                        <option value={t("options.budgets.notSet")}>{t("options.budgets.notSet")}</option>
                        <option value={t("options.budgets.under100k")}>{t("options.budgets.under100k")}</option>
                        <option value={t("options.budgets.100kTo250k")}>{t("options.budgets.100kTo250k")}</option>
                        <option value={t("options.budgets.250kTo500k")}>{t("options.budgets.250kTo500k")}</option>
                        <option value={t("options.budgets.500kTo1m")}>{t("options.budgets.500kTo1m")}</option>
                        <option value={t("options.budgets.over1m")}>{t("options.budgets.over1m")}</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* SECTION 3: Documents & Scope of Work */}
          <div className="rounded-3xl bg-card border border-border/70 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/60">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{t("sections.documents")}</h3>
                <p className="text-xs text-muted-foreground">{t("fields.fileFormatsNote")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* RFP File Upload */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Paperclip className="w-3.5 h-3.5 text-primary" />
                  <span>{t("fields.rfpFile")}</span>
                </label>

                <input
                  type="file"
                  ref={rfpInputRef}
                  onChange={handleRfpFileChange}
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt"
                  className="hidden"
                />

                {!rfpFile ? (
                  <div
                    onClick={() => rfpInputRef.current?.click()}
                    className="border-2 border-dashed border-border/80 hover:border-primary/50 bg-accent/20 hover:bg-accent/40 transition-all rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 group"
                  >
                    <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <span className="text-xs font-bold text-foreground">
                      {isAr ? "اضغط لرفع ملف كراسة الشروط أو نطاق العمل (RFP)" : "Click to upload RFP or Scope of Work"}
                    </span>
                    <span className="text-[11px] text-muted-foreground">PDF, DOCX, PPTX (Max 20MB)</span>
                  </div>
                ) : (
                  <div className="bg-accent/30 border border-primary/30 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
                        <FileText className="w-5 h-5" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-foreground truncate">{rfpFile.name}</p>
                        <p className="text-[10px] text-muted-foreground">{(rfpFile.size / 1024 / 1024).toFixed(2)} MB</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setRfpFile(null)}
                      className="text-destructive hover:bg-destructive/10 p-2 rounded-xl transition-colors"
                      title={isAr ? "إزالة" : "Remove"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              {/* Supporting Documents Upload */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-primary" />
                  <span>{t("fields.supportingDocs")}</span>
                </label>

                <input
                  type="file"
                  multiple
                  ref={supportingInputRef}
                  onChange={handleSupportingDocsChange}
                  accept=".pdf,.docx,.doc,.xlsx,.xls,.pptx,.ppt"
                  className="hidden"
                />

                <div
                  onClick={() => supportingInputRef.current?.click()}
                  className="border-2 border-dashed border-border/80 hover:border-primary/50 bg-accent/20 hover:bg-accent/40 transition-all rounded-2xl p-6 text-center cursor-pointer flex flex-col items-center justify-center gap-2 group"
                >
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <span className="text-xs font-bold text-foreground">
                    {isAr ? "اضغط لرفع مستندات إضافية داعمة" : "Click to upload additional supporting files"}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    {supportingDocs.length > 0
                      ? isAr
                        ? `تم اختيار ${supportingDocs.length} ملف(ات)`
                        : `${supportingDocs.length} file(s) selected`
                      : "PDF, DOCX, XLSX, PPTX"}
                  </span>
                </div>

                {supportingDocs.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {supportingDocs.map((doc, idx) => (
                      <div
                        key={idx}
                        className="bg-accent/20 border border-border/60 rounded-xl p-2.5 px-3.5 flex items-center justify-between gap-3 text-xs"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <Paperclip className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                          <span className="truncate text-foreground font-medium">{doc.name}</span>
                          <span className="text-[10px] text-muted-foreground shrink-0">
                            ({(doc.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeSupportingDoc(idx)}
                          className="text-destructive hover:bg-destructive/10 p-1.5 rounded-lg transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* SECTION 4: Communication Preferences */}
          <div className="rounded-3xl bg-card border border-border/70 p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border/60">
              <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-foreground">{t("sections.communication")}</h3>
                <p className="text-xs text-muted-foreground">
                  {isAr ? "حدد القناة والوقت المناسب لفريقنا للتواصل معكم" : "Choose preferred channel and time for engagement"}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField
                control={form.control}
                name="preferredContactMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      {t("fields.preferredContactMethod")}
                    </FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        disabled={isPending}
                        className="w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring h-11"
                      >
                        <option value={t("options.contactMethods.email")}>{t("options.contactMethods.email")}</option>
                        <option value={t("options.contactMethods.phone")}>{t("options.contactMethods.phone")}</option>
                        <option value={t("options.contactMethods.virtualMeeting")}>{t("options.contactMethods.virtualMeeting")}</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="bestTimeToContact"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-bold text-foreground">
                      {t("fields.bestTimeToContact")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={isAr ? "مثال: من 9 صباحاً حتى 1 ظهراً" : "e.g. 9:00 AM - 1:00 PM (GMT+3)"}
                        className="rounded-xl h-11"
                        {...field}
                        disabled={isPending}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="additionalNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-bold text-foreground">
                    {t("fields.additionalNotes")}
                  </FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={isAr ? "أي متطلبات أو شروط خاصة تود التنويه عنها..." : "Any additional notes or specific constraints..."}
                      className="min-h-[80px] rounded-xl"
                      {...field}
                      disabled={isPending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* SECTION 5: Privacy Consent & Submit */}
          <div className="rounded-3xl bg-card border border-border/70 p-6 sm:p-8 shadow-sm space-y-6">
            <FormField
              control={form.control}
              name="consent"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 rtl:space-x-reverse space-y-0 p-4 rounded-2xl bg-accent/20 border border-border/60">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      disabled={isPending}
                      id="privacy-consent-checkbox"
                      className="mt-1 h-5 w-5 rounded-md border-input text-primary focus:ring-primary accent-primary cursor-pointer"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <label
                      htmlFor="privacy-consent-checkbox"
                      className="text-xs sm:text-sm font-medium text-foreground cursor-pointer select-none leading-relaxed block"
                    >
                      {t("consentText")}
                    </label>
                    <FormMessage />
                  </div>
                </FormItem>
              )}
            />

            <button
              type="submit"
              disabled={isPending}
              className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-primary via-primary/90 to-primary text-primary-foreground px-10 py-4 text-base font-bold shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 w-full cursor-pointer overflow-hidden"
            >
              <span className="relative z-10 flex items-center justify-center gap-3">
                {isPending ? (
                  <>
                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    <span>{t("submitting")}</span>
                  </>
                ) : (
                  <>
                    <span>{t("submit")}</span>
                    <Send className="h-5 w-5 rtl:-scale-x-100 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
                  </>
                )}
              </span>
            </button>
          </div>
        </form>
      </Form>

      {/* SECTION: 3. ماذا يحدث بعد الإرسال؟ */}
      <div className="rounded-3xl bg-gradient-to-br from-card to-card/70 border border-primary/20 p-8 sm:p-10 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="mb-8 text-center max-w-xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold mb-3 border border-primary/20 backdrop-blur-sm">
            <Clock className="w-3.5 h-3.5" />
            <span>{workflowBadge || (isAr ? "مسار العمل" : "Workflow")}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            {workflowTitle || (isAr ? "ماذا يحدث بعد الإرسال؟" : "What Happens After Submitting?")}
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/80 relative hover:border-primary/40 transition-all hover:shadow-md group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors border border-primary/20">
                {workflowStep1Number || "01"}
              </div>
              <h4 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {workflowStep1Title || (isAr ? "نراجع الطلب" : "Reviewing Request")}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {workflowStep1Desc || (isAr
                  ? "نراجع المعلومات والمستندات المقدمة ونحدد طبيعة الاحتياج."
                  : "We review the submitted details and documentation to define the scope of your need.")}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/80 relative hover:border-primary/40 transition-all hover:shadow-md group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors border border-primary/20">
                {workflowStep2Number || "02"}
              </div>
              <h4 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {workflowStep2Title || (isAr ? "نحدد الخبرات المناسبة" : "Matching Right Expertise")}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {workflowStep2Desc || (isAr
                  ? "نحدد قائد التكليف والخبراء المناسبين من شبكة شروع."
                  : "We assign the engagement lead and tailored subject matter experts from Shuru's network.")}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className="bg-background/80 backdrop-blur-sm rounded-2xl p-6 border border-border/80 relative hover:border-primary/40 transition-all hover:shadow-md group flex flex-col justify-between">
            <div>
              <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center font-extrabold text-base mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors border border-primary/20">
                {workflowStep3Number || "03"}
              </div>
              <h4 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors">
                {workflowStep3Title || (isAr ? "نتواصل معكم" : "Connecting with You")}
              </h4>
              <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {workflowStep3Desc || (isAr
                  ? "نتواصل لتأكيد النطاق والخطوات التالية ونموذج التعاون."
                  : "We connect to align on scope, roadmap, next operational steps, and engagement model.")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
