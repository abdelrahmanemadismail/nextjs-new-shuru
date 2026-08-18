"use client";

import { useTranslations } from "next-intl";
import {
  Compass,
  Briefcase,
  Layers,
  Users,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  ArrowRight,
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
      title: isAr ? "المستوى الأول: الشريك المشرف" : "Tier 1: Managing Partner / Director",
      subtitle: isAr ? "Strategic Oversight & Governance" : "Strategic Oversight & Governance",
      desc: isAr
        ? "الإشراف الاستراتيجي الشامل، وضمان الجودة، وتوجيه القرارات الحرجة والمواءمة المباشرة مع الإدارة العليا واللجان القيادية."
        : "High-level strategic oversight, quality assurance, steering critical decisions, and aligning directly with executive leadership.",
      color: "from-amber-500/20 via-primary/20 to-primary/10",
      accent: "text-amber-500 border-amber-500/30 bg-amber-500/10",
      badge: isAr ? "الإشراف والحوكمة" : "Governance & Oversight",
      deliverable: isAr ? "حوكمة المشروع والاعتماد النهائي" : "Project Governance & Sign-off",
    },
    {
      id: "leadConsultant",
      icon: Briefcase,
      level: "02",
      title: isAr ? "المستوى الثاني: قائد المسار الاستشاري" : "Tier 2: Engagement Lead",
      subtitle: isAr ? "Engagement Lead & Execution" : "Engagement Lead & Execution",
      desc: isAr
        ? "إدارة خطة التنفيذ الميدانية اليومية، وقيادة فرق العمل، وضبط الجداول الزمنية والميزانيات لضمان موثوقية التسليم."
        : "Directing day-to-day operations, managing workstreams, controlling schedules and budgets, and ensuring delivery reliability.",
      color: "from-primary/25 via-primary/15 to-primary/5",
      accent: "text-primary border-primary/30 bg-primary/10",
      badge: isAr ? "قيادة المسار والتنفيذ" : "Engagement Leadership",
      deliverable: isAr ? "إدارة الخطة الزمنية والتسليم الموثوق" : "Execution Roadmap & Delivery",
    },
    {
      id: "subjectMatterExperts",
      icon: Layers,
      level: "03",
      title: isAr ? "المستوى الثالث: الخبراء التخصصيون" : "Tier 3: Subject Matter Experts (SMEs)",
      subtitle: isAr ? "Specialized Domain Expertise" : "Specialized Domain Expertise",
      desc: isAr
        ? "تقديم الحلول الفنية العميقة في مجالات تأسيس مكاتب PMO، الحوكمة، الذكاء الاصطناعي، وإدارة المعرفة وهندسة العمليات."
        : "Delivering deep technical mastery in PMO setups, governance frameworks, enterprise AI, knowledge assets, and process re-engineering.",
      color: "from-emerald-500/20 via-emerald-500/10 to-transparent",
      accent: "text-emerald-500 border-emerald-500/30 bg-emerald-500/10",
      badge: isAr ? "العمق الفني والتخصصي" : "Technical Mastery",
      deliverable: isAr ? "المخرجات الفنية والأدلة المعيارية" : "Technical Blueprints & SOPs",
    },
    {
      id: "clientCounterparts",
      icon: Users,
      level: "04",
      title: isAr ? "المستوى الرابع: النظراء المؤسسيين" : "Tier 4: Client Counterparts",
      subtitle: isAr ? "Knowledge Transfer & Enablement" : "Knowledge Transfer & Enablement",
      desc: isAr
        ? "العمل التشاركي الميداني مع الكفاءات الداخلية للمؤسسة وتدريبهم المستمر لضمان استدامة الأثر ونقل المعرفة المؤسسية الكاملة."
        : "Co-creating on-the-ground with internal organizational talent and continuous upskilling to embed lasting capabilities and knowledge transfer.",
      color: "from-blue-500/20 via-blue-500/10 to-transparent",
      accent: "text-blue-500 border-blue-500/30 bg-blue-500/10",
      badge: isAr ? "التمكين ونقل المعرفة" : "Enablement & Transfer",
      deliverable: isAr ? "تمكين الكوادر واستدامة القدرات" : "Internal Enablement & Retention",
    },
  ];

  return (
    <section id="delivery-model" className="relative overflow-hidden rounded-3xl bg-card border border-border/80 p-8 sm:p-12 shadow-xl">
      {/* Background ambient lighting */}
      <div className="absolute -top-24 -right-24 w-80 h-80 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 relative z-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold mb-4 border border-primary/20 backdrop-blur-sm">
          <Sparkles className="w-4 h-4" />
          <span>{isAr ? "نموذج العمل المتدرج" : "4-Tier Delivery Model"}</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-foreground tracking-tight mb-4 leading-tight">
          {isAr ? "نموذج تقديم الاستشارات متعدد المستويات" : "Structured 4-Tier Engagement Model"}
        </h2>
        <p className="text-muted-foreground text-sm sm:text-base leading-relaxed">
          {isAr
            ? "هيكل تشغيلي منظم يضمن الإشراف الاستراتيجي رفيع المستوى، والقيادة الميدانية، والعمق التخصصي، مع التركيز على بناء واستدامة القدرات الداخلية لمنظمتكم."
            : "A proven operating framework ensuring strategic direction, on-the-ground leadership, deep technical mastery, and internal organizational capability enablement."}
        </p>
      </div>

      {/* Model Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
        {tiers.map((tier) => {
          const IconComponent = tier.icon;
          return (
            <div
              key={tier.id}
              className="group relative rounded-2xl bg-background/90 backdrop-blur-md border border-border/80 hover:border-primary/50 p-6 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col justify-between"
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
                <h3 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
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
                <span>{tier.deliverable}</span>
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
              ? "يتكامل هذا النموذج لضمان تسليم المشاريع في موعدها وميزانيتها المعتمدة مع بناء قدرات فرقكم الداخلية لاستدامة الأثر."
              : "This synergistic model ensures milestone delivery on schedule with top-tier governance and lasting internal team empowerment."}
          </span>
        </p>
      </div>
    </section>
  );
}
