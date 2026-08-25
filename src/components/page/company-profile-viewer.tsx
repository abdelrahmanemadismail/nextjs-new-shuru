"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  Download,
  FileText,
  ExternalLink,
  Sparkles,
  Shield,
  Layers,
  ArrowRight,
  Maximize2,
  Share2,
  CheckCircle,
  HelpCircle,
  Building2,
  Zap,
  Target,
  LineChart,
  Cpu,
  Award,
  Users,
  Briefcase,
  Globe,
  Compass,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { DownloadPdfButton } from "@/components/ui/download-pdf-button";
import { getCardGridContainerClasses, getCardItemClasses } from "@/lib/grid-utils";
import { cn } from "@/lib/utils";
import type { CompanyProfilePillar } from "@/strapi/company-profile-page";

interface CompanyProfileViewerProps {
  pdfUrl?: string;
  fileName?: string;
  fileTitle?: string;
  fileSubtitle?: string;
  downloadButtonText?: string;
  openNewTabButtonText?: string;
  shareButtonText?: string;
  previewBadge?: string;
  pillars?: CompanyProfilePillar[];
  ctaBadge?: string;
  ctaTitle?: string;
  ctaSubtitle?: string;
  ctaPrimaryButtonText?: string;
  ctaPrimaryButtonLink?: string;
  ctaSecondaryButtonText?: string;
  ctaSecondaryButtonLink?: string;
}

const renderPillarIcon = (name?: string) => {
  switch (name?.toLowerCase()) {
    case "building":
    case "building2":
      return <Building2 className="w-6 h-6" />;
    case "zap":
    case "flash":
      return <Zap className="w-6 h-6" />;
    case "shield":
    case "security":
      return <Shield className="w-6 h-6" />;
    case "target":
      return <Target className="w-6 h-6" />;
    case "linechart":
    case "chart":
      return <LineChart className="w-6 h-6" />;
    case "cpu":
    case "tech":
      return <Cpu className="w-6 h-6" />;
    case "award":
      return <Award className="w-6 h-6" />;
    case "users":
      return <Users className="w-6 h-6" />;
    case "briefcase":
      return <Briefcase className="w-6 h-6" />;
    case "globe":
      return <Globe className="w-6 h-6" />;
    case "compass":
      return <Compass className="w-6 h-6" />;
    case "layers":
      return <Layers className="w-6 h-6" />;
    default:
      return <Building2 className="w-6 h-6" />;
  }
};

export function CompanyProfileViewer({
  pdfUrl = "/documents/shuru-company-profile.pdf",
  fileName = "shuru-company-profile.pdf",
  fileTitle,
  fileSubtitle,
  downloadButtonText,
  openNewTabButtonText,
  shareButtonText,
  previewBadge,
  pillars,
  ctaBadge,
  ctaTitle,
  ctaSubtitle,
  ctaPrimaryButtonText,
  ctaPrimaryButtonLink = "/request-info",
  ctaSecondaryButtonText,
  ctaSecondaryButtonLink = "/contact",
}: CompanyProfileViewerProps) {
  const t = useTranslations("companyProfile");
  const pathname = usePathname();
  const localeMatch = pathname?.match(/^\/(ar|en)/);
  const locale = localeMatch ? localeMatch[1] : "ar";
  const isAr = locale === "ar";

  const [isIOS, setIsIOS] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const userAgent = window.navigator.userAgent.toLowerCase();
      const isIOSDevice =
        /iphone|ipad|ipod/.test(userAgent) ||
        (window.navigator.platform === "MacIntel" && window.navigator.maxTouchPoints > 1);
      setIsIOS(isIOSDevice);
    }
  }, []);

  const handleShare = async () => {
    if (typeof window !== "undefined") {
      if (navigator.share) {
        try {
          await navigator.share({
            title: isAr ? "بروفايل شركة شروع" : "SHURU Company Profile",
            url: window.location.href,
          });
        } catch {
          // Ignored
        }
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      }
    }
  };

  // Fallback pillars if not provided by Strapi
  const defaultPillars: CompanyProfilePillar[] = [
    {
      title: isAr ? "خبرات استشارية وتنفيذية متقدمة" : "Advanced Advisory & Execution",
      description: isAr
        ? "نجمع بين الفكر الاستراتيجي المعمق والقدرة على التشغيل الميداني لضمان تحقيق المستهدفات."
        : "Bridging strategic formulation with rigorous field execution to ensure milestone delivery.",
      iconName: "Building2",
    },
    {
      title: isAr ? "حلول تشغيلية مخصصة" : "Tailored Operational Solutions",
      description: isAr
        ? "تصميم مسارات عمل ونماذج حوكمة تتماشى تماماً مع بيئة عمل جهتك وثقافتها التنظيمية."
        : "Designing governance models and execution tracks uniquely calibrated to your entity's environment.",
      iconName: "Zap",
    },
    {
      title: isAr ? "نقل المعرفة والتمكين المؤسسي" : "Knowledge Transfer & Enablement",
      description: isAr
        ? "بناء قدرات الفرق الداخلية وتأهيل الكفاءات الوطنية لضمان استدامة الأثر والنتائج."
        : "Empowering internal teams and upskilling national talent for enduring, sustainable impact.",
      iconName: "Shield",
    },
  ];

  const activePillars = pillars && pillars.length > 0 ? pillars : defaultPillars;

  return (
    <div className="space-y-10">
      {/* Control & Action Bar */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4 w-full md:w-auto">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 border border-primary/20">
            <FileText className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-foreground">
              {fileTitle || (isAr ? "الملف التعريفي الرسمي (2026)" : "Official Company Profile (2026)")}
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {fileSubtitle || t("fileInfo")}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-start md:justify-end">
          {/* Download Button */}
          <DownloadPdfButton
            pdfUrl={pdfUrl}
            fileName={fileName}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all duration-300 cursor-pointer"
            loadingText={isAr ? "جاري التحميل..." : "Downloading..."}
          >
            <Download className="w-4 h-4" />
            <span>{downloadButtonText || t("downloadPdf")}</span>
          </DownloadPdfButton>

          {/* Open in new tab */}
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card px-5 py-3 text-sm font-semibold text-foreground hover:bg-accent transition-all duration-200 shadow-sm"
          >
            <ExternalLink className="w-4 h-4" />
            <span>{openNewTabButtonText || (isAr ? "فتح في نافذة جديدة" : "Open in New Tab")}</span>
          </a>

          {/* Share Button */}
          <button
            onClick={handleShare}
            className="inline-flex items-center justify-center p-3 rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent transition-colors shadow-sm"
            title={shareButtonText || (isAr ? "مشاركة الرابط" : "Share link")}
          >
            {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Embedded PDF Viewer */}
      <div className="bg-card border border-border/80 rounded-3xl overflow-hidden shadow-xl">
        <div className="bg-muted/60 px-6 py-3.5 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-red-400/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-amber-400/80 inline-block" />
            <span className="w-3 h-3 rounded-full bg-emerald-400/80 inline-block" />
            <span className="text-xs font-semibold text-muted-foreground ms-2">
              {fileName}
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{previewBadge || (isAr ? "معاينة تفاعلية" : "Interactive Preview")}</span>
          </div>
        </div>

        <div className="w-full h-[650px] sm:h-[800px] bg-neutral-950/5 dark:bg-neutral-950 relative flex items-center justify-center">
          {isIOS ? (
            <div className="p-8 max-w-md text-center bg-card border border-border/80 rounded-2xl shadow-lg m-4 space-y-4">
              <div className="w-14 h-14 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto">
                <FileText className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-foreground">
                {isAr ? "استعراض ملف البروفايل" : "View Company Profile PDF"}
              </h4>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {isAr
                  ? "يتطلب نظام iOS فتح مستندات PDF في نافذة مستقلة لتصفح الصفحات كاملة وبدقة عالية."
                  : "iOS Safari requires PDF documents to be opened directly in a new tab for optimal multi-page viewing."}
              </p>
              <div className="flex flex-col gap-2 pt-2">
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-primary text-primary-foreground font-bold py-3 text-sm hover:bg-primary/90 transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>{isAr ? "فتح البروفايل مباشرة" : "Open Profile Directly"}</span>
                </a>
              </div>
            </div>
          ) : (
            <iframe
              src={`${pdfUrl}#toolbar=1&navpanes=0&scrollbar=1`}
              className="w-full h-full border-none"
              title={fileTitle || (isAr ? "بروفايل شركة شروع" : "SHURU Company Profile")}
            />
          )}
        </div>
      </div>

      {/* Value Pillars / Quick Overview */}
      <div className={getCardGridContainerClasses(activePillars.length, "gap-6")}>
        {activePillars.map((pillar, idx) => (
          <div
            key={idx}
            className={cn(
              "bg-card border border-border/70 rounded-3xl p-6 shadow-sm hover:border-primary/40 transition-all group",
              getCardItemClasses(activePillars.length, idx)
            )}
          >
            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              {renderPillarIcon(pillar.iconName)}
            </div>
            <h4 className="text-base font-bold text-foreground mb-2">
              {pillar.title}
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {pillar.description}
            </p>
          </div>
        ))}
      </div>

      {/* Call to Action Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-primary/15 via-primary/5 to-amber-500/10 border border-primary/20 p-8 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-start">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{ctaBadge || (isAr ? "ابدأ رحلة التعاون مع شروع" : "Partner with SHURU")}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            {ctaTitle || t("requestInfoCta")}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground">
            {ctaSubtitle || (isAr
              ? "يمكنك تقديم طلب معلومات (RFI) بالمستندات والمتطلبات وسيتواصل معك خبراؤنا مباشرة."
              : "Submit your Request for Information (RFI) with supporting docs, and our leaders will connect.")}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <Link
            href={ctaPrimaryButtonLink.startsWith("/") ? `/${locale}${ctaPrimaryButtonLink.replace(/^\/(ar|en)/, "")}` : ctaPrimaryButtonLink}
            className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-bold px-6 py-3.5 text-sm shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all"
          >
            <span>{ctaPrimaryButtonText || t("requestInfoBtn")}</span>
            <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
          </Link>
          <Link
            href={ctaSecondaryButtonLink.startsWith("/") ? `/${locale}${ctaSecondaryButtonLink.replace(/^\/(ar|en)/, "")}` : ctaSecondaryButtonLink}
            className="inline-flex items-center justify-center rounded-full border border-border bg-card text-foreground font-semibold px-6 py-3.5 text-sm hover:bg-accent transition-all"
          >
            <span>{ctaSecondaryButtonText || t("contactBtn")}</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
