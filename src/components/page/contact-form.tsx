"use client";

import { useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { Calendar, Building2, Target, CheckCircle2, ArrowRight } from "lucide-react";
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

export function ContactForm() {
  const t = useTranslations("contact");
  const [isPending, startTransition] = useTransition();

  const pathname = usePathname();
  const localeMatch = pathname?.match(/^\/(ar|en)/);
  const locale = localeMatch ? localeMatch[1] : 'ar';
  const isAr = locale === 'ar';

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
      entityType: isAr ? "قطاع حكومي" : "Government",
      challenge: isAr ? "بطء تنفيذ المبادرات والتعثر التشغيلي" : "Initiative Delivery Bottlenecks",
      desiredService: isAr ? "تشخيص وإعادة هيكلة المسارات" : "Diagnosis & Restructuring",
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
          toast.success(isAr ? "تم حجز طلب جلسة التشخيص بنجاح! سيتواصل معك فريقنا قريباً." : "Diagnostic session request received! Our team will contact you shortly.");
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
            <span>{isAr ? '1. معلومات الجهة والتحدي' : '1. Entity & Challenge Details'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="entityType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold text-foreground">
                    {isAr ? 'نوع الجهة / القطاع *' : 'Entity Type / Sector *'}
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isPending}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value={isAr ? "قطاع حكومي" : "Government Sector"}>{isAr ? 'جهة حكومية / شبه حكومية' : 'Government / Semi-Government'}</option>
                      <option value={isAr ? "قطاع خاص / شركات" : "Private Sector"}>{isAr ? 'شركة / قطاع خاص' : 'Enterprise / Private Sector'}</option>
                      <option value={isAr ? "قطاع غير ربحي" : "Non-Profit"}>{isAr ? 'مؤسسة أصلية / قطاع ثالث' : 'Non-Profit / Foundation'}</option>
                      <option value={isAr ? "أخرى" : "Other"}>{isAr ? 'قطاع آخر' : 'Other'}</option>
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
                    {isAr ? 'الخدمة / المسار المطلوب *' : 'Desired Track / Service *'}
                  </FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      disabled={isPending}
                      className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value={isAr ? "تشخيص وإعادة هيكلة المسارات" : "Diagnosis & Restructuring"}>
                        {isAr ? '1. التشخيص وإعادة الهيكلة التشغيلية' : '1. Operational Diagnosis & Restructuring'}
                      </option>
                      <option value={isAr ? "تصميم استراتيجية التنفيذ" : "Execution Strategy Design"}>
                        {isAr ? '2. تصميم استراتيجية التنفيذ والخرائط' : '2. Execution Strategy & Roadmap Design'}
                      </option>
                      <option value={isAr ? "التنفيذ الذكي ومتابعة الأداء" : "Smart Execution & KPIs"}>
                        {isAr ? '3. التنفيذ الذكي والتشغيل الميداني' : '3. Smart Field Execution & Live KPIs'}
                      </option>
                      <option value={isAr ? "بناء القدرات والتمكين المؤسسي" : "Capacity Building"}>
                        {isAr ? '4. بناء القدرات وتطوير الكفاءات' : '4. Capacity Building & Team Enablement'}
                      </option>
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
                  {isAr ? 'التحدي الرئيسي الذي تواجهه جهتك حالياً *' : 'Primary Challenge Facing Your Entity *'}
                </FormLabel>
                <FormControl>
                  <select
                    {...field}
                    disabled={isPending}
                    className="w-full rounded-xl border border-input bg-background px-3 py-2.5 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value={isAr ? "بطء تنفيذ المبادرات والتعثر التشغيلي" : "Slow Initiative Delivery"}>
                      {isAr ? 'بطء تنفيذ المبادرات وتأخر المخرجات عن الجدول الزمني' : 'Slow initiative delivery & delayed milestones'}
                    </option>
                    <option value={isAr ? "غياب نظام متابعة الأداء واللوحات اللحظية" : "Lack of Real-time Performance System"}>
                      {isAr ? 'صعوبة قياس الأداء وغياب لوحات المتابعة اللحظية' : 'Difficulty tracking live performance & metrics'}
                    </option>
                    <option value={isAr ? "صعوبة تحويل الاستراتيجية إلى تشغيل ميداني" : "Strategy-to-Execution Gap"}>
                      {isAr ? 'فجوة بين الخطط الاستراتيجية والتشغيل الميداني' : 'Gap between high-level strategy and field execution'}
                    </option>
                    <option value={isAr ? "الحاجة لنقل المعرفة وبناء قدرات الفرق" : "Need for Team Capacity Building"}>
                      {isAr ? 'تأهيل الفرق وتطوير القدرات التشغيلية الداخلية' : 'Up-skilling internal teams & operational enablement'}
                    </option>
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
            <span>{isAr ? '2. موعد الجلسة والبيانات الشخصية' : '2. Appointment & Contact Info'}</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-semibold">{t("form.fullName")}</FormLabel>
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
                  <FormLabel className="text-xs font-semibold">{t("form.email")}</FormLabel>
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
                  <FormLabel className="text-xs font-semibold">{t("form.phone")}</FormLabel>
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
                  <FormLabel className="text-xs font-semibold">{isAr ? 'اسم الشركة / المؤسسة *' : 'Organization Name *'}</FormLabel>
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
                  <FormLabel className="text-xs font-semibold">{isAr ? 'الموعد والوقت المناسب للجلسة' : 'Preferred Date & Time'}</FormLabel>
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
                <FormLabel className="text-xs font-semibold">{isAr ? 'ملاحظات أو تفاصيل إضافية (اختياري)' : 'Additional Notes (Optional)'}</FormLabel>
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
            {isPending ? (isAr ? 'جاري إرسال الطلب...' : 'Submitting Request...') : (isAr ? 'تأكيد وحجز جلسة التشخيص' : 'Confirm Diagnostic Session Booking')}
            <ArrowRight className="h-5 w-5 rtl:-scale-x-100" />
          </span>
        </button>
      </form>
    </Form>
  );
}
