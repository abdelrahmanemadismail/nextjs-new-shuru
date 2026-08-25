 "use client";

import { useState, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Search,
  Sparkles,
  Award,
  Briefcase,
  ExternalLink,
  Linkedin,
  X,
  Send,
  Layers,
  ArrowRight,
  Filter,
} from "lucide-react";
import { type StrapiExpert } from "@/strapi/experts";
import { type Locale } from "@/lib/i18n";
import { ExpertCard } from "./expert-card";
import { getCardGridContainerClasses, getCardItemClasses } from "@/lib/grid-utils";
import { cn } from "@/lib/utils";

interface ExpertsGridProps {
  experts: StrapiExpert[];
  locale: Locale;
  directoryBadge?: string;
  directoryTitle?: string;
  directorySubtitle?: string;
  ctaBadge?: string;
  ctaHeadline?: string;
  ctaDescription?: string;
  ctaButtonText?: string;
  ctaButtonLink?: string;
}

export function ExpertsGrid({
  experts,
  locale,
  directoryBadge,
  directoryTitle,
  directorySubtitle,
  ctaBadge,
  ctaHeadline,
  ctaDescription,
  ctaButtonText,
  ctaButtonLink = "/request-info",
}: ExpertsGridProps) {
  const isAr = locale === "ar";

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("ALL");
  const [activeModalExpert, setActiveModalExpert] = useState<StrapiExpert | null>(null);

  // Extract unique expertise tags across all experts
  const allDomainTags = useMemo(() => {
    const set = new Set<string>();
    experts.forEach((exp) => {
      if (exp.expertise) {
        exp.expertise.split(/[,،]/).forEach((s) => {
          const trimmed = s.trim();
          if (trimmed) set.add(trimmed);
        });
      }
    });
    return Array.from(set);
  }, [experts]);

  // Filter logic
  const filteredExperts = useMemo(() => {
    return experts.filter((exp) => {
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        exp.name.toLowerCase().includes(q) ||
        exp.title.toLowerCase().includes(q) ||
        (exp.bio && exp.bio.toLowerCase().includes(q)) ||
        (exp.expertise && exp.expertise.toLowerCase().includes(q)) ||
        (exp.certifications && exp.certifications.toLowerCase().includes(q));

      const matchesTag =
        selectedTag === "ALL" ||
        (exp.expertise && exp.expertise.toLowerCase().includes(selectedTag.toLowerCase()));

      return matchesSearch && matchesTag;
    });
  }, [experts, searchQuery, selectedTag]);

  const featuredExperts = useMemo(() => {
    return filteredExperts.filter((exp) => exp.featured);
  }, [filteredExperts]);

  const regularExperts = useMemo(() => {
    return filteredExperts.filter((exp) => !exp.featured);
  }, [filteredExperts]);

  return (
    <div id="experts-directory" className="space-y-12">
      {/* Search & Filter Bar */}
      <div className="bg-card border border-border/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:max-w-md">
            <Search className="absolute start-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحث بالاسم، التخصص، أو الشهادة..." : "Search by name, expertise, or certification..."}
              className="w-full h-12 ps-11 pe-4 rounded-full border border-input bg-background text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-inner"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute end-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5 self-start md:self-auto">
            <Filter className="w-3.5 h-3.5 text-primary" />
            <span>
              {isAr
                ? `عرض ${filteredExperts.length} من أصل ${experts.length} خبير ومستشار`
                : `Showing ${filteredExperts.length} of ${experts.length} senior advisors`}
            </span>
          </div>
        </div>

        {/* Domain Tags Pills */}
        {allDomainTags.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setSelectedTag("ALL")}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm ${
                selectedTag === "ALL"
                  ? "bg-primary text-primary-foreground shadow-primary/25"
                  : "bg-accent/40 hover:bg-accent text-foreground border border-border/60"
              }`}
            >
              {isAr ? "جميع التخصصات" : "All Specializations"}
            </button>
            {allDomainTags.map((tag) => (
              <button
                key={tag}
                onClick={() => setSelectedTag(tag === selectedTag ? "ALL" : tag)}
                className={`px-4 py-2 rounded-full text-xs font-bold transition-all shrink-0 cursor-pointer shadow-sm ${
                  selectedTag === tag
                    ? "bg-primary text-primary-foreground shadow-primary/25"
                    : "bg-accent/40 hover:bg-accent text-foreground border border-border/60"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Featured Experts Section (if any match) */}
      {featuredExperts.length > 0 && (
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center border border-amber-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              {isAr ? "قيادات التحول والمستشارون الرئيسيون" : "Featured Lead Advisors"}
            </h3>
          </div>

          <div className={getCardGridContainerClasses(featuredExperts.length, "gap-6")}>
            {featuredExperts.map((expert, idx) => (
              <div key={expert.id} className={cn("h-full flex flex-col", getCardItemClasses(featuredExperts.length, idx))}>
                <ExpertCard
                  expert={expert}
                  locale={locale}
                  onSelect={(exp) => setActiveModalExpert(exp)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Regular Experts Section */}
      {regularExperts.length > 0 && (
        <div className="space-y-6">
          {featuredExperts.length > 0 && (
            <div className="flex items-center gap-2.5 pt-6 border-t border-border/60">
              <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                <Layers className="w-4 h-4" />
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
                {directoryTitle || (isAr ? "جميع المستشارين والخبراء التخصصيين" : "All Subject Matter Experts")}
              </h3>
            </div>
          )}

          <div className={getCardGridContainerClasses(regularExperts.length, "gap-6")}>
            {regularExperts.map((expert, idx) => (
              <div key={expert.id} className={cn("h-full flex flex-col", getCardItemClasses(regularExperts.length, idx))}>
                <ExpertCard
                  expert={expert}
                  locale={locale}
                  onSelect={(exp) => setActiveModalExpert(exp)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No results fallback */}
      {filteredExperts.length === 0 && (
        <div className="bg-card border border-border/80 rounded-3xl p-12 text-center max-w-lg mx-auto space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center mx-auto text-muted-foreground">
            <Search className="w-6 h-6" />
          </div>
          <h4 className="text-lg font-bold text-foreground">
            {isAr ? "لم يتم العثور على خبراء مطابقين" : "No matching experts found"}
          </h4>
          <p className="text-xs text-muted-foreground">
            {isAr
              ? "يرجى تجربة البحث بكلمات مختلفة أو إزالة الفلاتر المحددة."
              : "Try searching with different keywords or clear applied filters."}
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedTag("ALL");
            }}
            className="px-6 py-2.5 rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-md hover:shadow-lg transition-all"
          >
            {isAr ? "إعادة ضبط التصفية" : "Reset Filters"}
          </button>
        </div>
      )}

      {/* Detailed Modal / Quick View */}
      {activeModalExpert && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
          <div
            className="bg-card border border-border/80 rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto space-y-6 animate-in zoom-in-95 duration-200"
            dir={isAr ? "rtl" : "ltr"}
          >
            {/* Close button */}
            <button
              onClick={() => setActiveModalExpert(null)}
              className="absolute top-5 end-5 p-2 rounded-full border border-border bg-background hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Expert Header */}
            <div className="flex items-start gap-4 sm:gap-6 pt-2">
              {activeModalExpert.avatarUrl ? (
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-primary/20 shrink-0 shadow-md">
                  <Image
                    src={activeModalExpert.avatarUrl}
                    alt={activeModalExpert.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-amber-500/10 border-2 border-primary/20 text-primary flex items-center justify-center font-bold text-3xl shrink-0 shadow-md">
                  {activeModalExpert.name.charAt(0)}
                </div>
              )}

              <div className="space-y-1.5 min-w-0">
                {activeModalExpert.featured && (
                  <span className="inline-flex items-center gap-1 px-3 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-bold border border-amber-500/20 mb-1">
                    <Sparkles className="w-3 h-3" />
                    <span>{isAr ? "خبير رئيسي" : "Featured Lead"}</span>
                  </span>
                )}
                <h3 className="text-xl sm:text-2xl font-extrabold text-foreground leading-tight">
                  {activeModalExpert.name}
                </h3>
                <p className="text-sm font-semibold text-primary">
                  {activeModalExpert.title}
                </p>
                {activeModalExpert.linkedin && (
                  <a
                    href={activeModalExpert.linkedin}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-muted-foreground hover:text-primary transition-colors pt-1"
                  >
                    <Linkedin className="w-3.5 h-3.5" />
                    <span>LinkedIn</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Bio */}
            {activeModalExpert.bio && (
              <div className="space-y-2 rounded-2xl bg-accent/20 p-5 border border-border/60">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-primary" />
                  <span>{isAr ? "نبذة عن المسار والخبرات" : "Professional Biography"}</span>
                </h4>
                <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-justify [text-align-last:start] [text-justify:inter-word]">
                  {activeModalExpert.bio}
                </p>
              </div>
            )}

            {/* Expertise Areas */}
            {activeModalExpert.expertise && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-primary" />
                  <span>{isAr ? "مجالات الخبرة والتخصص" : "Areas of Expertise"}</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeModalExpert.expertise.split(/[,،]/).map((tag, idx) => {
                    const trimmed = tag.trim();
                    if (!trimmed) return null;
                    return (
                      <span
                        key={idx}
                        className="px-3 py-1.5 rounded-xl text-xs font-medium bg-card text-foreground border border-border/70 shadow-sm"
                      >
                        {trimmed}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Certifications */}
            {activeModalExpert.certifications && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-primary" />
                  <span>{isAr ? "الشهادات والاعتمادات الدولية" : "Certifications & Credentials"}</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {activeModalExpert.certifications.split(/[,،]/).map((cert, idx) => {
                    const trimmed = cert.trim();
                    if (!trimmed) return null;
                    return (
                      <span
                        key={idx}
                        className="px-3 py-1 rounded-lg text-xs font-bold bg-primary/10 text-primary border border-primary/20"
                      >
                        {trimmed}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="pt-4 border-t border-border/60 flex justify-end">
              <button
                onClick={() => setActiveModalExpert(null)}
                className="w-full sm:w-auto px-8 py-3 rounded-full border border-border bg-card hover:bg-accent text-foreground text-sm font-semibold transition-all"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Consultation CTA Banner */}
      <div className="rounded-3xl bg-gradient-to-r from-primary/15 via-primary/5 to-amber-500/10 border border-primary/20 p-8 sm:p-10 shadow-lg flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-start">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold border border-primary/20">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{ctaBadge || (isAr ? "استشارة مخصصة" : "Tailored Advisory")}</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
            {ctaHeadline || (isAr ? "هل تبحث عن مستشار تنفيذي يقود مبادرتكم القادمة؟" : "Looking for an executive advisor to lead your next initiative?")}
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed text-justify [text-align-last:start] [text-justify:inter-word]">
            {ctaDescription || (isAr
              ? "نساعدكم في تشخيص التحدي وتخصيص الكفاءة الاستشارية الأكثر ملاءمة لطبيعة مشروعكم وسياقه المؤسسي."
              : "We help diagnose your institutional challenge and allocate the expert best suited for your operating context.")}
          </p>
        </div>

        <Link
          href={`/${locale}${ctaButtonLink.startsWith("/") ? ctaButtonLink : `/${ctaButtonLink}`}`}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-primary text-primary-foreground font-bold px-8 py-4 text-sm shadow-xl shadow-primary/25 hover:shadow-2xl hover:shadow-primary/35 hover:-translate-y-0.5 transition-all w-full sm:w-auto"
        >
          <span>{ctaButtonText || (isAr ? "طلب اجتماع استكشافي" : "Request Discovery Session")}</span>
          <ArrowRight className="w-4 h-4 rtl:-scale-x-100" />
        </Link>
      </div>
    </div>
  );
}
