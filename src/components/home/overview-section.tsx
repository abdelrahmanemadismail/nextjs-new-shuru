'use client';

import Link from 'next/link';
import { Target, Activity, Zap, CheckCircle, ArrowRight, Layers, Cpu, Users2, LineChart } from 'lucide-react';
import { locales, type Locale } from '@/lib/i18n';
import { usePathname } from 'next/navigation';

const iconMap: Record<string, React.ReactNode> = {
  Activity: <Activity className="h-6 w-6" />,
  Target: <Target className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  Check: <CheckCircle className="h-6 w-6 text-primary" />,
  Layers: <Layers className="h-6 w-6" />,
  Cpu: <Cpu className="h-6 w-6" />,
  Users2: <Users2 className="h-6 w-6" />,
  LineChart: <LineChart className="h-6 w-6" />,
};

function getIcon(name?: string, defaultIcon?: React.ReactNode) {
  if (!name) return defaultIcon;
  return iconMap[name] || defaultIcon;
}

const localePathPattern = new RegExp(`^/(${locales.join("|")})(/|$)`);
const isExternalUrl = (url: string) => url.startsWith("http://") || url.startsWith("https://") || url.startsWith("mailto:") || url.startsWith("tel:");

function toLocaleAwareUrl(url: string, locale: string) {
  if (!url || isExternalUrl(url) || url.startsWith("#")) return url;
  if (!url.startsWith("/")) return `/${locale}/${url}`;
  if (localePathPattern.test(url)) return url;
  return url === "/" ? `/${locale}` : `/${locale}${url}`;
}

export function OverviewSection({ overview }: { overview: import('@/strapi/home').StrapiOverviewBlock }) {
  const pathname = usePathname();
  const localeMatch = pathname?.match(/^\/(ar|en)/);
  const locale = localeMatch ? localeMatch[1] : 'ar';
  const isAr = locale === 'ar';

  // Default 4 structured pathways if cards are not present or standard
  const defaultTracks = [
    {
      id: 1,
      title: isAr ? '1. التشخيص وإعادة الهيكلة' : '1. Diagnosis & Restructuring',
      description: isAr ? 'تقييم الجاهزية التشغيلية وسد الفجوات مع بناء الهياكل التنظيمية المرنة.' : 'Operational readiness assessment and bridging gaps with agile organizational structures.',
      iconName: 'Target',
      badge: isAr ? 'المرحلة 01' : 'Phase 01'
    },
    {
      id: 2,
      title: isAr ? '2. تصميم استراتيجية التنفيذ' : '2. Execution Strategy Design',
      description: isAr ? 'تحويل الرؤية والأهداف الكبرى إلى خريطة طريق قابلة للتطبيق والقياس.' : 'Translating strategy into actionable and measurable roadmaps.',
      iconName: 'LineChart',
      badge: isAr ? 'المرحلة 02' : 'Phase 02'
    },
    {
      id: 3,
      title: isAr ? '3. التنفيذ الذكي والميداني' : '3. Smart Field Execution',
      description: isAr ? 'إدارة المبادرات التحولية والتشغيل المباشر مع متابعة لوحات الأداء اللحظية.' : 'Transformational initiative delivery with real-time performance dashboards.',
      iconName: 'Cpu',
      badge: isAr ? 'المرحلة 03' : 'Phase 03'
    },
    {
      id: 4,
      title: isAr ? '4. بناء القدرات والتمكين' : '4. Capacity Building & Enablement',
      description: isAr ? 'تطوير الكفاءات القيادية والتطوير المؤسسي لنقل المعرفة وضمان الاستدامة.' : 'Developing leadership capabilities and internal knowledge transfer.',
      iconName: 'Users2',
      badge: isAr ? 'المرحلة 04' : 'Phase 04'
    }
  ];

  const displayCards = overview.cards && overview.cards.length >= 3 ? overview.cards : defaultTracks;

  return (
    <section id="solutions" className="py-16 sm:py-24 lg:py-28 bg-accent/5 relative overflow-hidden">
      <div className="absolute inset-0 bg-grid-slate-100/[0.04] dark:bg-grid-slate-900/[0.04] bg-[size:20px_20px]"></div>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-3xl text-center">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-4">
            <Layers className="h-3.5 w-3.5" />
            <span>{isAr ? 'مسارات الحلول المتكاملة' : 'Integrated Solution Tracks'}</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {overview.title || (isAr ? 'مسارات التنفيذ الذكي في شروع' : 'Shuru Smart Execution Pathways')}
          </h2>
          {overview.introText ? (
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground">{overview.introText}</p>
          ) : (
            <p className="mt-4 text-base sm:text-lg text-muted-foreground">
              {isAr ? 'نجمع بين التشخيص الدقيق والتنفيذ الميداني وإدارة الأداء لضمان تحويل الخطط إلى نتائج ملموسة.' : 'Combining diagnostic assessment with field execution to guarantee measurable results.'}
            </p>
          )}
        </div>

        <div className="mx-auto mt-12 sm:mt-16 max-w-7xl">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {displayCards.map((card: any, idx: number) => (
              <div 
                key={card.id || idx} 
                className="group relative flex flex-col justify-between rounded-3xl border border-border/60 bg-card p-6 sm:p-8 shadow-sm transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/10 hover:border-primary/40 overflow-hidden"
              >
                <div className="hidden md:block absolute top-0 end-0 -m-8 h-32 w-32 rounded-full bg-primary/5 blur-2xl transition-all duration-300 group-hover:bg-primary/10"></div>
                
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-[inset_0_1px_rgba(255,255,255,0.2)]">
                      <div className="transform group-hover:scale-110 transition-transform duration-300">
                        {getIcon(card.iconName, <Target className="h-6 w-6" />)}
                      </div>
                    </div>
                    {card.badge && (
                      <span className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase bg-accent/60 px-2.5 py-1 rounded-full border border-border/40">
                        {card.badge}
                      </span>
                    )}
                  </div>

                  <h3 className="text-lg sm:text-xl font-bold text-foreground mb-3 leading-snug">{card.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{card.description}</p>
                </div>

                <div className="mt-6 pt-4 border-t border-border/40 flex items-center justify-between text-xs font-semibold text-primary">
                  <span>{isAr ? 'احجز جلسة مسار' : 'Book Track Session'}</span>
                  <ArrowRight className="h-4 w-4 transform transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1" />
                </div>
              </div>
            ))}
          </div>

          {overview.ctaText && overview.ctaLink && (
            <div className="mt-12 sm:mt-16 text-center">
              <Link
                href={toLocaleAwareUrl(overview.ctaLink, locale)}
                className="group inline-flex items-center justify-center rounded-full bg-accent/60 border border-border/70 px-8 py-3.5 text-base font-semibold text-foreground hover:bg-accent hover:border-primary/40 transition-all duration-300 shadow-sm"
              >
                <span>{overview.ctaText}</span>
                <ArrowRight className="ms-2 h-4 w-4 transform transition-transform group-hover:translate-x-1 rtl:-scale-x-100 rtl:group-hover:-translate-x-1 text-primary" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
