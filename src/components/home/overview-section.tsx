'use client';

import Link from 'next/link';
import { Target, Activity, Zap, CheckCircle, ArrowRight } from 'lucide-react';

const iconMap: Record<string, React.ReactNode> = {
  Activity: <Activity className="h-6 w-6" />,
  Target: <Target className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  Check: <CheckCircle className="h-6 w-6 text-primary" />,
};

function getIcon(name?: string, defaultIcon?: React.ReactNode) {
  if (!name) return defaultIcon;
  return iconMap[name] || defaultIcon;
}

export function OverviewSection({ overview }: { overview: import('@/strapi/home').StrapiOverviewBlock }) {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-accent/5 relative">
      <div className="absolute inset-0 bg-grid-slate-100/[0.04] dark:bg-grid-slate-900/[0.04] bg-[size:20px_20px]"></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">{overview.title}</h2>
          {overview.introText && (
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground">{overview.introText}</p>
          )}
        </div>
        <div 
          className="mx-auto mt-12 sm:mt-20 max-w-7xl"
        >
          <div 
            className={`mx-auto grid grid-cols-1 gap-8 sm:grid-cols-2 ${
              overview.cards?.length === 1 ? 'lg:grid-cols-1 max-w-sm' :
              overview.cards?.length === 2 ? 'max-w-4xl' :
              overview.cards?.length === 3 ? 'lg:grid-cols-3 max-w-5xl' :
              'lg:grid-cols-4'
            }`}
          >
            {overview.cards?.map((card) => (
              <div 
                key={card.id} 
                className="group relative rounded-3xl border border-border/50 bg-card p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/30 overflow-hidden"
              >
                {/* Decorative background blur circle - hidden on mobile for performance */}
                <div className="hidden md:block absolute top-0 end-0 -m-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all duration-300 group-hover:bg-primary/10"></div>
                
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 text-primary shadow-[inset_0_1px_rgba(255,255,255,0.2)]">
                  <div className="transform group-hover:scale-110 transition-transform duration-300">
                    {getIcon(card.iconName, <Target className="h-6 w-6" />)}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-foreground mb-3">{card.title}</h3>
                <p className="text-muted-foreground leading-relaxed">{card.description}</p>
              </div>
            ))}
          </div>
          {overview.ctaText && overview.ctaLink && (
            <div 
              className="mt-16 text-center"
            >
              <Link href={overview.ctaLink} className="group inline-flex items-center text-base font-semibold leading-6 text-primary hover:text-primary/80 transition-colors">
                {overview.ctaText} 
                <ArrowRight className="ms-2 h-4 w-4 transform transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
