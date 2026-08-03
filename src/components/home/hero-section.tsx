import Link from 'next/link';
import { ArrowLeft, ArrowRight, ShieldCheck, Zap, BarChart3, Users, CheckCircle2 } from 'lucide-react';
import { type Locale } from '@/lib/i18n';

export function HeroSection({ hero, locale }: { hero: import('@/strapi/home').StrapiHeroBlock; locale: Locale }) {
  const isRtl = locale === 'ar';
  const Icon = isRtl ? ArrowLeft : ArrowRight;

  const primaryCtaText = hero?.primaryCtaText || (isRtl ? 'احجز جلسة تشخيص' : 'Book a Diagnostic Session');
  const primaryCtaLink = hero?.primaryCtaLink
    ? (hero.primaryCtaLink.startsWith('/') ? `/${locale}${hero.primaryCtaLink}` : hero.primaryCtaLink)
    : `/${locale}/contact`;

  const secondaryCtaText = hero?.secondaryCtaText || (isRtl ? 'استكشف مسارات الحلول' : 'Explore Solutions');
  const secondaryCtaLink = hero?.secondaryCtaLink
    ? (hero.secondaryCtaLink.startsWith('/') ? `/${locale}${hero.secondaryCtaLink}` : hero.secondaryCtaLink)
    : `#solutions`;

  return (
    <section className="relative overflow-hidden bg-background pt-12 pb-16 sm:pt-20 sm:pb-24 lg:pt-24 lg:pb-32">
      {/* Background gradients */}
      <div className="absolute inset-x-0 top-0 h-[700px] bg-gradient-to-b from-primary/10 via-primary/5 to-transparent dark:from-primary/20 dark:via-primary/5 pointer-events-none" />
      <div className="hidden md:block absolute top-1/4 -start-32 -z-10 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px] opacity-40"></div>
      <div className="hidden md:block absolute top-1/4 -end-32 -z-10 h-[500px] w-[500px] rounded-full bg-accent/10 blur-[120px] opacity-40"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Eyebrow Positioning Pill */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-xs sm:text-sm font-semibold text-primary mb-6 sm:mb-8 backdrop-blur-sm">
          <ShieldCheck className="h-4 w-4" />
          <span>{isRtl ? 'شروع | شريك التنفيذ الذكي والتحول التشغيلي' : 'SHURU | Smart Execution & Operational Transformation'}</span>
        </div>

        {/* Hero Title */}
        <h1 className="mx-auto max-w-4xl text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-tight py-2 leading-[1.15]">
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground via-foreground/90 to-foreground/70 dark:from-white dark:via-gray-200 dark:to-gray-400 drop-shadow-sm">
            {hero.title || (isRtl ? 'تحويل الخطط الاستراتيجية إلى نتائج ملموسة' : 'Transforming Strategic Plans Into Tangible Results')}
          </span>
        </h1>

        {/* Subtitle / For Whom & Result */}
        <p className="mx-auto mt-5 sm:mt-8 max-w-3xl text-base sm:text-lg md:text-xl leading-relaxed text-muted-foreground font-medium">
          {hero.subtitle || (isRtl
            ? 'نمكّن الجهات الحكومية، والشركات المؤسسية، والقطاع الثالث من تجاوز تحديات التنفيذ وسد الفجوات التشغيلية من خلال منهجيات تنفيذ ذكية تحول المعرفة إلى أثر مستدام.'
            : 'We empower government entities, enterprise organizations, and non-profits to overcome execution bottlenecks through smart methodologies that translate knowledge into lasting impact.')}
        </p>

        {/* Target Audience / Sectors Badges */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-xs sm:text-sm text-foreground/80 font-medium">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent/50 px-3 py-1.5 border border-border/60">
            <Users className="h-3.5 w-3.5 text-primary" />
            {isRtl ? 'الجهات الحكومية' : 'Government Entities'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent/50 px-3 py-1.5 border border-border/60">
            <BarChart3 className="h-3.5 w-3.5 text-primary" />
            {isRtl ? 'الشركات والقطاع الخاص' : 'Enterprises'}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-accent/50 px-3 py-1.5 border border-border/60">
            <Zap className="h-3.5 w-3.5 text-primary" />
            {isRtl ? 'القطاع غير الربحي والمؤسسات' : 'Non-Profits'}
          </span>
        </div>

        {/* Action CTA Buttons */}
        <div className="mt-10 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6">
          <Link
            href={primaryCtaLink}
            className="group relative inline-flex h-14 w-full sm:w-auto items-center justify-center rounded-full bg-primary px-8 sm:px-10 text-base font-bold text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden cursor-pointer"
          >
            <div className="absolute inset-0 w-full h-full bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
            <span className="relative z-10 flex items-center gap-2">
              {primaryCtaText}
              <Icon className="h-5 w-5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
            </span>
          </Link>

          <Link
            href={secondaryCtaLink}
            className="group inline-flex h-14 w-full sm:w-auto items-center justify-center rounded-full border border-border/80 bg-card/80 backdrop-blur-sm px-8 sm:px-10 text-base font-semibold text-foreground shadow-sm hover:bg-accent/40 hover:border-primary/50 hover:-translate-y-1 transition-all duration-300 cursor-pointer"
          >
            {secondaryCtaText}
          </Link>
        </div>

        {/* Smart Execution Visual Showcase Widget */}
        <div className="mt-12 sm:mt-16 max-w-4xl mx-auto rounded-2xl border border-border/70 bg-card/80 p-4 sm:p-6 shadow-xl backdrop-blur-sm">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-start border-b border-border/50 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-foreground">
                  {isRtl ? 'منظومة التنفيذ الذكي من شروع' : 'Shuru Smart Execution Engine'}
                </h4>
                <p className="text-xs text-muted-foreground">
                  {isRtl ? 'ربط التخطيط بالتشغيل الفعلي والنتائج الميدانية' : 'Connecting strategic planning to live operational outputs'}
                </p>
              </div>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-semibold">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              {isRtl ? 'نشط تشغيلياً' : 'Active Execution'}
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 text-start">
            <div className="p-3 sm:p-4 rounded-xl bg-accent/30 border border-border/40">
              <span className="text-xs font-medium text-muted-foreground block mb-1">
                {isRtl ? 'معدل إنجاز المبادرات' : 'Initiatives Delivery'}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-foreground">94.8%</span>
              <div className="w-full bg-accent/60 h-1.5 rounded-full mt-2 overflow-hidden">
                <div className="bg-primary h-full rounded-full w-[94.8%]"></div>
              </div>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-accent/30 border border-border/40">
              <span className="text-xs font-medium text-muted-foreground block mb-1">
                {isRtl ? 'سرعة تفعيل الخطة' : 'Activation Speed'}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-foreground">3X</span>
              <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold block mt-1">
                {isRtl ? 'أسرع من الطرق التقليدية' : 'Faster than average'}
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-accent/30 border border-border/40">
              <span className="text-xs font-medium text-muted-foreground block mb-1">
                {isRtl ? 'المخرجات المعيارية' : 'Standard Deliverables'}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-foreground">100%</span>
              <span className="text-[11px] text-muted-foreground block mt-1">
                {isRtl ? 'موثقة ومقيسة الأثر' : 'Fully Documented'}
              </span>
            </div>

            <div className="p-3 sm:p-4 rounded-xl bg-accent/30 border border-border/40">
              <span className="text-xs font-medium text-muted-foreground block mb-1">
                {isRtl ? 'نقل المعرفة والتمكين' : 'Knowledge Transfer'}
              </span>
              <span className="text-xl sm:text-2xl font-extrabold text-foreground">+50</span>
              <span className="text-[11px] text-primary font-semibold block mt-1">
                {isRtl ? 'فريق كفاءات ممكّن' : 'Empowered Teams'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
