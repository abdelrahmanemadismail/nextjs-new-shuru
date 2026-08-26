"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Calendar, Building2, ArrowRight } from "lucide-react";
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
import { sendContactEmail } from "@/lib/actions/contact";

export interface ContactFormProps {
  step1Title?: string;
  entityTypeLabel?: string;
  entityTypeOptions?: string[];
  desiredServiceLabel?: string;
  desiredServiceOptions?: string[];
  challengeLabel?: string;
  challengeOptions?: string[];
  step2Title?: string;
  fullNameLabel?: string;
  emailLabel?: string;
  phoneLabel?: string;
  companyLabel?: string;
  preferredDateLabel?: string;
  messageLabel?: string;
  submitButtonText?: string;
  submittingButtonText?: string;
  successMessage?: string;
}

export function ContactForm({
  step1Title,
  entityTypeLabel,
  entityTypeOptions,
  desiredServiceLabel,
  desiredServiceOptions,
  challengeLabel,
  challengeOptions,
  step2Title,
  fullNameLabel,
  emailLabel,
  phoneLabel,
  companyLabel,
  preferredDateLabel,
  messageLabel,
  submitButtonText,
  submittingButtonText,
  successMessage,
}: ContactFormProps) {
  const t = useTranslations("contact");
  const [isPending, startTransition] = useTransition();

  const pathname = usePathname();
  const localeMatch = pathname?.match(/^\/(ar|en)/);
  const locale = localeMatch ? localeMatch[1] : 'ar';
  const isAr = locale === 'ar';

  const defaultEntityTypes = isAr
    ? ["جهة حكومية / شبه حكومية", "شركة / قطاع خاص", "مؤسسة أصلية / قطاع ثالث", "أخرى"]
    : ["Government / Semi-Government", "Enterprise / Private Sector", "Non-Profit / Foundation", "Other"];

  const defaultServices = isAr
    ? [
        "1. التشخيص وإعادة الهيكلة التشغيلية",
        "2. تصميم استراتيجية التنفيذ والخرائط",
        "3. التنفيذ الذكي والتشغيل الميداني",
        "4. بناء القدرات وتطوير الكفاءات",
      ]
    : [
        "1. Operational Diagnosis & Restructuring",
        "2. Execution Strategy & Roadmap Design",
        "3. Smart Field Execution & Live KPIs",
        "4. Capacity Building & Team Enablement",
      ];

  const defaultChallenges = isAr
    ? [
        "بطء تنفيذ المبادرات وتأخر المخرجات عن الجدول الزمني",
        "صعوبة قياس الأداء وغياب لوحات المتابعة اللحظية",
        "فجوة بين الخطط الاستراتيجية والتشغيل الميداني",
        "تأهيل الفرق وتطوير القدرات التشغيلية الداخلية",
      ]
    : [
        "Slow initiative delivery & delayed milestones",
        "Difficulty tracking live performance & metrics",
        "Gap between high-level strategy and field execution",
        "Up-skilling internal teams & operational enablement",
      ];

  const entityTypes = entityTypeOptions && entityTypeOptions.length > 0 ? entityTypeOptions : defaultEntityTypes;
  const services = desiredServiceOptions && desiredServiceOptions.length > 0 ? desiredServiceOptions : defaultServices;
  const challenges = challengeOptions && challengeOptions.length > 0 ? challengeOptions : defaultChallenges;

  const formSchema = z.object({
    fullName: z.string().min(2, { message: isAr ? "الاسم مطلوب" : "Name is required" }),
    email: z.string().email({ message: isAr ? "يرجى إدخال بريد إلكتروني صحيح" : "Invalid email address" }),
    phone: z.string().min(6, { message: isAr ? "رقم الهاتف مطلوب" : "Phone number is required" }),
    company: z.string().min(2, { message: isAr ? "اسم الجهة مطلوب" : "Organization is required" }),
    entityType: z.string().min(1, { message: isAr ? "يرجى اختيار نوع الجهة" : "Please select entity type" }),
    challenge: z.string().min(1, { message: isAr ? "يرجى اختيار التحدي الرئيسي" : "Please select primary challenge" }),
    desiredService: z.string().min(1, { message: isAr ? "يرجى اختيار الخدمة المطلوبة" : "Please select desired service" }),
    preferredDate: z.string().optional(),
    message: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      company: "",
      entityType: entityTypes[0] || "",
      challenge: challenges[0] || "",
      desiredService: services[0] || "",
      preferredDate: "",
      message: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    startTransition(async () => {
      try {
        const result = await sendContactEmail({
          ...values,
          subject: `${values.company} - ${values.entityType} (${values.desiredService})`,
        });
        if (result.success) {
          const defaultSuccess = isAr
            ? "تم حجز طلب جلسة التشخيص بنجاح! سيتواصل معك فريقنا قريباً."
            : "Diagnostic session request received! Our team will contact you shortly.";
          toast.success(successMessage || defaultSuccess);
          form.reset();
        } else {
          console.error("Contact form submission failed:", result.error);
          toast.error(t("form.error"));
        }
      } catch (error) {
        console.error("Contact form error:", error);
        toast.error(t("form.error"));
      }
    });
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Step 1: Sector & Service Selection */}
        <div className="space-y-4 rounded-2xl bg-accent/30 p-5 border border-border/50">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <span>{step1Title || (isAr ? "1. معلومات الجهة والتحدي" : "1. Entity & Challenge Details")}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="entityType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">
                    {entityTypeLabel || (isAr ? "نوع الجهة / القطاع *" : "Entity Type / Sector *")}
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isPending}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {entityTypes.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="desiredService"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">
                    {desiredServiceLabel || (isAr ? "الخدمة / المسار المطلوب *" : "Desired Track / Service *")}
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isPending}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      {services.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="challenge"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold text-foreground">
                  {challengeLabel || (isAr ? "التحدي الرئيسي الذي تواجهه جهتك حالياً *" : "Primary Challenge Facing Your Entity *")}
                </FormLabel>
                <FormControl>
                  <select
                    {...field}
                    disabled={isPending}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    {challenges.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Step 2: Session Schedule & Personal Info */}
        <div className="space-y-4 rounded-2xl bg-accent/30 p-5 border border-border/50">
          <h3 className="text-base font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            <span>{step2Title || (isAr ? "2. موعد الجلسة والبيانات الشخصية" : "2. Appointment & Contact Info")}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    {fullNameLabel || t("form.fullName")}
                  </FormLabel>
                  <FormControl>
                    <Input className="rounded-xl" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    {emailLabel || t("form.email")}
                  </FormLabel>
                  <FormControl>
                    <Input className="rounded-xl" type="email" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    {phoneLabel || t("form.phone")}
                  </FormLabel>
                  <FormControl>
                    <Input className="rounded-xl" type="tel" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    {companyLabel || (isAr ? "اسم الشركة / المؤسسة *" : "Organization Name *")}
                  </FormLabel>
                  <FormControl>
                    <Input className="rounded-xl" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="preferredDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">
                    {preferredDateLabel || (isAr ? "الموعد والوقت المناسب للجلسة" : "Preferred Date & Time")}
                  </FormLabel>
                  <FormControl>
                    <Input type="datetime-local" className="rounded-xl" {...field} disabled={isPending} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold">
                  {messageLabel || (isAr ? "ملاحظات أو تفاصيل إضافية (اختياري)" : "Additional Notes (Optional)")}
                </FormLabel>
                <FormControl>
                  <Textarea
                    className="min-h-[90px] rounded-xl"
                    {...field}
                    disabled={isPending}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="group relative inline-flex items-center justify-center rounded-full bg-primary px-10 py-4 text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300 disabled:pointer-events-none disabled:opacity-50 w-full cursor-pointer overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-2">
            {isPending
              ? (submittingButtonText || (isAr ? "جاري إرسال الطلب..." : "Submitting Request..."))
              : (submitButtonText || (isAr ? "تأكيد وحجز جلسة التشخيص" : "Confirm Diagnostic Session Booking"))}
            <ArrowRight className="h-5 w-5 rtl:-scale-x-100" />
          </span>
        </button>
      </form>
    </Form>
  );
}
