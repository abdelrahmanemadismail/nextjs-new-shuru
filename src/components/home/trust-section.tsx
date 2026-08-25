'use client';

import { ShieldCheck, Award, Users, CheckCircle, Building2, Workflow, Sparkles } from 'lucide-react';
import type { StrapiTrustSectionBlock } from '@/strapi/home';
import { getCardGridContainerClasses, getCardItemClasses } from '@/lib/grid-utils';
import { cn } from '@/lib/utils';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Award,
  Workflow,
  Building2,
  Users,
  ShieldCheck,
  CheckCircle,
};

function getTrustIcon(name?: string) {
  if (!name) return Award;
  return iconMap[name] || Sparkles;
}

export function TrustSection({ block }: { block: StrapiTrustSectionBlock }) {
  const items = block?.items || [];

  return (
    <section className="py-16 sm:py-20 bg-accent/10 border-t border-border/40 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          {block.badge && (
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
              <ShieldCheck className="h-4 w-4" />
              <span>{block.badge}</span>
            </div>
          )}
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {block.title}
          </h2>
          {block.introText && (
            <p className="mt-3 text-sm sm:text-base text-muted-foreground whitespace-pre-line">
              {block.introText}
            </p>
          )}
        </div>

        {items.length > 0 && (
          <div className={getCardGridContainerClasses(items.length, "gap-6")}>
            {items.map((item, idx) => {
              const Icon = getTrustIcon(item.icon);
              return (
                <div
                  key={item.id || idx}
                  className={cn(
                    "rounded-2xl bg-card border border-border/50 p-6 shadow-sm flex flex-col justify-between hover:border-primary/40 transition-colors",
                    getCardItemClasses(items.length, idx)
                  )}
                >
                  <div>
                    <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  {item.tag && (
                    <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1.5 text-xs text-primary font-semibold">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>{item.tag}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
