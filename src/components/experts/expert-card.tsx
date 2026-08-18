"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Award,
  Briefcase,
  ExternalLink,
  Linkedin,
  Sparkles,
  ArrowRight,
  Layers,
} from "lucide-react";
import { type StrapiExpert } from "@/strapi/experts";
import { type Locale } from "@/lib/i18n";

interface ExpertCardProps {
  expert: StrapiExpert;
  locale: Locale;
  onSelect: (expert: StrapiExpert) => void;
}

export function ExpertCard({ expert, locale, onSelect }: ExpertCardProps) {
  const isAr = locale === "ar";

  const expertiseTags = expert.expertise
    ? expert.expertise.split(/[,،]/).map((s) => s.trim()).filter(Boolean)
    : [];

  const certTags = expert.certifications
    ? expert.certifications.split(/[,،]/).map((s) => s.trim()).filter(Boolean)
    : [];

  return (
    <div className="group relative rounded-3xl bg-card border border-border/70 hover:border-primary/50 p-6 sm:p-7 transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 flex flex-col justify-between overflow-hidden">
      {/* Top accent glow line on hover */}
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary via-amber-500 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div>
        {/* Top Header with Avatar & Badges */}
        <div className="flex items-start justify-between gap-4 mb-5">
          <div className="relative">
            {expert.avatarUrl ? (
              <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-primary/20 shadow-md">
                <Image
                  src={expert.avatarUrl}
                  alt={expert.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            ) : (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-amber-500/10 border-2 border-primary/20 text-primary flex items-center justify-center font-bold text-xl sm:text-2xl shadow-md">
                {expert.name.charAt(0)}
              </div>
            )}

            {expert.featured && (
              <span className="absolute -bottom-2 -right-1 sm:-right-2 bg-gradient-to-r from-amber-500 to-primary text-white p-1 rounded-full shadow-md">
                <Sparkles className="w-3.5 h-3.5" />
              </span>
            )}
          </div>

          <div className="flex flex-col items-end gap-2">
            {expert.featured && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[11px] font-bold border border-amber-500/20">
                <Sparkles className="w-3 h-3" />
                <span>{isAr ? "خبير رئيسي" : "Featured Lead"}</span>
              </span>
            )}

            {expert.linkedin && (
              <a
                href={expert.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 rounded-xl border border-border bg-background hover:bg-primary hover:text-primary-foreground text-muted-foreground transition-colors shadow-sm"
                title="LinkedIn"
                onClick={(e) => e.stopPropagation()}
              >
                <Linkedin className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>

        {/* Info */}
        <div className="space-y-2 mb-4">
          <h3 className="text-lg sm:text-xl font-bold text-foreground group-hover:text-primary transition-colors leading-snug">
            {expert.name}
          </h3>
          <p className="text-xs sm:text-sm font-semibold text-primary/90">
            {expert.title}
          </p>
          {expert.bio && (
            <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed pt-1">
              {expert.bio}
            </p>
          )}
        </div>

        {/* Areas of Expertise Tags */}
        {expertiseTags.length > 0 && (
          <div className="space-y-1.5 mb-4">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 block">
              {isAr ? "مجالات الخبرة" : "Areas of Expertise"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {expertiseTags.slice(0, 3).map((tag, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-accent/40 text-foreground border border-border/60"
                >
                  {tag}
                </span>
              ))}
              {expertiseTags.length > 3 && (
                <span className="px-2 py-1 rounded-lg text-[11px] font-medium bg-muted text-muted-foreground">
                  +{expertiseTags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Certifications Tags */}
        {certTags.length > 0 && (
          <div className="space-y-1.5 mb-5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80 block">
              {isAr ? "الشهادات والاعتمادات" : "Certifications"}
            </span>
            <div className="flex flex-wrap gap-1.5">
              {certTags.slice(0, 3).map((cert, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-primary/10 text-primary border border-primary/20"
                >
                  {cert}
                </span>
              ))}
              {certTags.length > 3 && (
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-muted text-muted-foreground">
                  +{certTags.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      <div className="pt-4 border-t border-border/50 flex gap-2">
        <button
          onClick={() => onSelect(expert)}
          className="flex-1 py-2.5 px-4 rounded-xl border border-border bg-accent/20 hover:bg-accent text-foreground text-xs font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-sm group-hover:border-primary/40"
        >
          <span>{isAr ? "عرض السيرة" : "View Bio"}</span>
        </button>

        <Link
          href={`/${locale}/request-info?expert=${expert.slug}`}
          className="py-2.5 px-4 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-bold transition-all duration-200 flex items-center justify-center gap-1.5 shadow-sm shadow-primary/20"
        >
          <span>{isAr ? "طلب اجتماع" : "Engage"}</span>
          <ArrowRight className="w-3.5 h-3.5 rtl:-scale-x-100" />
        </Link>
      </div>
    </div>
  );
}
