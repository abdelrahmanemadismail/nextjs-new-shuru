"use client";

import Link from "next/link";
import { Sparkles, ArrowRight, ShieldCheck, Award, Users, ChevronDown } from "lucide-react";
import { type Locale } from "@/lib/i18n";

interface ExpertsHeroProps {
  locale: Locale;
  badgeText?: string;
  title?: string;
  subtitle?: string;
  primaryCtaText?: string;
  primaryCtaLink?: string;
  secondaryCtaText?: string;
  secondaryCtaLink?: string;
}

export function ExpertsHero({
  locale,
  badgeText,
  title,
  subtitle,
  primaryCtaText,
  primaryCtaLink = "/request-info",
  secondaryCtaText,
  secondaryCtaLink = "#experts-directory",
}: ExpertsHeroProps) {
  const isAr = locale === "ar";

  const defaultBadge = isAr
    ? "شبكة الخبراء والمستشارين التنفيذيين"
    : "Executive Advisory & Expert Practice";

  const defaultTitle = isAr
    ? "نخبة من قادة التنفيذ والتحول المؤسسي في خدمتك"
    : "Elite Transformation Leaders and Subject Matter Experts at Your Service";

  const defaultSubtitle = isAr
    ? "نجمع بين الخبرة الاستشارية العميقة والمعرفة الميدانية الدقيقة لبيئة الأعمال والأنظمة السعودية، لنقدم حلولاً تنفيذية تصنع أثراً حقيقياً ومستداماً."
    : "We combine deep strategic advisory experience with on-the-ground operational expertise in Saudi Arabia to ensure measurable, sustainable outcomes.";

  const defaultPrimaryCta = isAr ? "طلب استشارة مع خبير" : "Request an Advisory Session";
  const defaultSecondaryCta = isAr ? "استعراض شبكة الخبراء" : "Explore Expert Directory";

  const trustMetrics = [
    {
      icon: Award,
      value: "+18",
      label: isAr ? "سنة متوسط الخبرة الاستشارية" : "Years Avg. Advisory Experience",
    },
    {
      icon: ShieldCheck,
      value: "100%",
      label: isAr ? "خبراء معتمدون ومرخصون" : "Certified & Licensed Experts",
    },
    {
      icon: Users,
      value: "+50",
      label: isAr ? "برنامج تحولي ومكتب PMO مُدار" : "Transformations & PMOs Delivered",
    },
  ];

  return (
    <div className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-border/40 bg-gradient-to-b from-primary/10 via-background to-background">
      {/* Background decorative grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Ambient background glows */}
      <div className="absolute top-10 start-1/4 -translate-x-1/2 w-96 h-96 bg-primary/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-20 end-1/4 translate-x-1/2 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 max-w-5xl text-center">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs sm:text-sm font-bold mb-6 border border-primary/20 backdrop-blur-md shadow-sm">
          <Sparkles className="w-4 h-4" />
          <span>{badgeText || defaultBadge}</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground mb-6 leading-[1.2] max-w-4xl mx-auto">
          {title || defaultTitle}
        </h1>

        {/* Subtitle */}
        <p className="text-muted-foreground text-base sm:text-xl max-w-3xl mx-auto leading-relaxed mb-10">
          {subtitle || defaultSubtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14">
          <Link
            href={`/${locale}${primaryCtaLink.startsWith("/") ? primaryCtaLink : `/${primaryCtaLink}`}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-full bg-primary text-primary-foreground font-bold text-sm sm:text-base shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all"
          >
            <span>{primaryCtaText || defaultPrimaryCta}</span>
            <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
          </Link>

          <a
            href={secondaryCtaLink}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-full border border-border/80 bg-card/80 hover:bg-accent text-foreground font-semibold text-sm sm:text-base backdrop-blur-md transition-all shadow-sm"
          >
            <span>{secondaryCtaText || defaultSecondaryCta}</span>
            <ChevronDown className="w-4 h-4 text-muted-foreground" />
          </a>
        </div>

        {/* Trust Stats Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-8 border-t border-border/50 max-w-3xl mx-auto">
          {trustMetrics.map((metric, idx) => {
            const IconComp = metric.icon;
            return (
              <div
                key={idx}
                className="flex items-center justify-center sm:justify-start gap-3 p-4 rounded-2xl bg-card/60 border border-border/60 backdrop-blur-md"
              >
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
                  <IconComp className="w-5 h-5" />
                </div>
                <div className="text-start">
                  <div className="text-xl font-extrabold text-foreground tracking-tight">
                    {metric.value}
                  </div>
                  <div className="text-[11px] font-medium text-muted-foreground leading-tight">
                    {metric.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
