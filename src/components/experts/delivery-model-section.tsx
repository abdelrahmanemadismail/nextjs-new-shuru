"use client";

import { useTranslations } from "next-intl";
import {
  Compass,
  Briefcase,
  Layers,
  Users,
  CheckCircle2,
  ArrowDown,
  Sparkles,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { type Locale } from "@/lib/i18n";

interface DeliveryModelSectionProps {
  locale: Locale;
}

export function DeliveryModelSection({ locale }: DeliveryModelSectionProps) {
  const t = useTranslations("experts.deliveryModel");
  const isAr = locale === "ar";

  const tiers = [
    {
      id: "director",
      icon: Compass,
      level: "01",
      title: t("tiers.director.title"),
      subtitle: t("tiers.director.subtitle"),
      desc: t("tiers.director.desc"),
      color: "from-amber-500/20 via-primary/20 to-primary/10",
      accent: "text-amber-500 border-amber-500/30 bg-amber-500/10",
      badge: isAr ? "الإشراف الاستراتيجي والحوكمة" : "Strategic Oversight & Governance",
    },
    {
      id: "leadConsultant",
      icon: Briefcase,
      level: "02",
      title: t("tiers.leadConsultant.title"),
      subtitle: t("tiers.leadConsultant.subtitle"),
      desc: t("tiers.leadConsultant.desc"),
      color: "from-primary/25 via-primary/15 to-primary/5",
      accent: "text-primary border-primary/30 bg-primary/10",
      badge: isAr ? "قيادة المسار والتنفيذ الميداني" : "Engagement Lead & Execution",
    },
    {
      id: "subjectMatterExperts",
      icon: Layers,
      level: "03",
      title: t("tiers.subjectMatterExperts.title"),
      subtitle: t("tiers.subjectMatterExperts.subtitle"),
      desc: t("tiers.subjectMatterExperts.desc"),
      color: "from-emerald-500/20 via-emerald-500/10 to-transparent",
      accent: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
      badge: isAr ? "العمق الفني والتخصصي" : "Specialized Domain Expertise",
    },
    {
      id: "clientCounterparts",
      icon: Users,
      level: "04",
      title: t("tiers.clientCounterparts.title"),
      subtitle: t("tiers.clientCounterparts.subtitle"),
      desc: t("tiers.clientCounterparts.desc"),
      color: "from-blue-500/20 via-blue-500/10 to-transparent",
      accent: "text-blue-500 border-blue-500/30 bg-blue-500/10",
      badge: isAr ? "نقل المعرفة والتمكين المؤسسي" : "Knowledge Transfer & Enablement",
    },
  ];

  return (
    <section className="relative overflow-hidden rounded-3xl bg-card border border-border/80 p-8 sm:p-12 shadow-xl">
      {/* Background ambient glows */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold mb-4 border border-primary/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          <span>{t("badge")}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4 leading-tight">
          {t("title")}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          {t("subtitle")}
        </p>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {tiers.map((tier, idx) => {
          const IconComponent = tier.icon;
          return (
            <div
              key={tier.id}
              className="group relative rounded-2xl bg-background/90 backdrop-blur-sm border border-border/80 hover:border-primary/50 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
            >
              {/* Level indicator */}
              <div className="flex items-center justify-between gap-2 mb-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${tier.accent}`}>
                  <IconComponent className="w-6 h-6" />
                </div>
                <span className="text-2xl font-black text-muted-foreground/30 group-hover:text-primary/40 transition-colors">
                  {tier.level}
                </span>
              </div>

              {/* Text content */}
              <div className="space-y-2.5 flex-1">
                <div className="inline-block px-2.5 py-0.5 rounded-md text-[11px] font-bold border mb-1 bg-accent/40 text-foreground border-border/60">
                  {tier.badge}
                </div>
                <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors">
                  {tier.title}
                </h3>
                <h4 className="text-xs font-semibold text-primary/80">
                  {tier.subtitle}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed pt-1">
                  {tier.desc}
                </p>
              </div>

              {/* Bottom tag indicator */}
              <div className="mt-5 pt-3 border-t border-border/40 flex items-center gap-1.5 text-[11px] font-semibold text-foreground/80">
                <CheckCircle2 className="w-3.5 h-3.5 text-primary shrink-0" />
                <span>
                  {idx === 0
                    ? isAr ? "ضمان الجودة والحوكمة" : "Quality & Governance"
                    : idx === 1
                    ? isAr ? "إدارة خطة التنفيذ اليومية" : "Operational Track Lead"
                    : idx === 2
                    ? isAr ? "حلول تخصصية عميقة" : "Deep Technical Solutions"
                    : isAr ? "شراكة واستدامة الأثر" : "Co-Creation & Sustainability"}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Synergistic Connection Banner */}
      <div className="mt-10 pt-6 border-t border-border/60 text-center relative z-10">
        <p className="text-xs sm:text-sm text-muted-foreground font-medium flex items-center justify-center gap-2 flex-wrap">
          <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
          <span>
            {isAr
              ? "يتكامل هذا النموذج لضمان تسليم المشاريع في وقتها المحدد وبأعلى معايير الحوكمة وبناء قدرات فرقكم الداخلية."
              : "This synergistic model ensures milestone delivery on schedule with top-tier governance and lasting internal team empowerment."}
          </span>
        </p>
      </div>
    </section>
  );
}
