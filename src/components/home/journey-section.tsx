'use client';

import { usePathname } from 'next/navigation';
import { Search, Compass, Rocket, GraduationCap, CheckCircle2, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { getCardGridContainerClasses, getCardItemClasses } from '@/lib/grid-utils';
import { cn } from '@/lib/utils';

export function JourneySection() {
  const pathname = usePathname();
  const localeMatch = pathname?.match(/^\/(ar|en)/);
  const locale = localeMatch ? localeMatch[1] : 'ar';
  const isAr = locale === 'ar';

  const steps = [
    {
      number: '01',
      title: isAr ? 'التشخيص والتقييم' : 'Diagnosis & Assessment',
      description: isAr
        ? 'دراسة الواقع الميداني وتحديد الاختناقات والفجوات التشغيلية بدقة.'
        : 'Analyzing operational realities and pin-pointing bottlenecks.',
      deliverable: isAr ? 'المخرج: تقرير الفجوات وخارطة الطريق' : 'Deliverable: Gap Analysis & Roadmap',
      icon: Search,
    },
    {
      number: '02',
      title: isAr ? 'التصميم الهندسي' : 'Operational Design',
      description: isAr
        ? 'بناء نماذج التشغيل المستهدفة وتصميم مؤشرات قياس الأداء والحلول.'
        : 'Designing target operating models and performance KPI metrics.',
      deliverable: isAr ? 'المخرج: نموذج التشغيل ومؤشرات KIs' : 'Deliverable: Target Operating Model & KPIs',
      icon: Compass,
    },
    {
      number: '03',
      title: isAr ? 'التفعيل والمتابعة' : 'Activation & Execution',
      description: isAr
        ? 'إدارة المبادرات ميدانياً ومتابعة الإنجاز عبر لوحات بيانات لحظية.'
        : 'Executing initiatives on the ground with live performance dashboards.',
      deliverable: isAr ? 'المخرج: تشغيل ميداني ولوحات متابعة' : 'Deliverable: Live Field Execution & Dashboards',
      icon: Rocket,
    },
    {
      number: '04',
      title: isAr ? 'بناء القدرات والتمكين' : 'Capacity Building',
      description: isAr
        ? 'نقل الخبرات وتطوير الكفاءات لضمان استدامة الأداء بعد تسليم المشروعات.'
        : 'Transferring knowledge and empowering teams for sustained impact.',
      deliverable: isAr ? 'المخرج: فرق عمل ممكّنة ونقل معرفي' : 'Deliverable: Empowered Teams & Knowledge Transfer',
      icon: GraduationCap,
    },
  ];

  return (
    <section className="py-16 sm:py-24 bg-background border-t border-border/40 relative">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-primary bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
            {isAr ? 'منهجية شروع' : 'Shuru Methodology'}
          </span>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground mt-4">
            {isAr ? 'رحلة العمل: من الفكرة إلى الأثر المستدام' : 'Our Work Journey: From Concept to Impact'}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-muted-foreground">
            {isAr
              ? 'رحلة واضحة المعالم بأربع مراحل متسلسلة تضمن وضوح المخرجات والشفافية التامة في كل خطوة.'
              : 'A structured 4-stage process ensuring total clarity and measurable deliverables at every phase.'}
          </p>
        </div>

        {/* Timeline Steps Grid */}
        <div className={getCardGridContainerClasses(steps.length, "gap-6 relative")}>
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div
                key={index}
                className={cn(
                  "group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-6 shadow-sm hover:shadow-lg hover:border-primary/40 transition-all duration-300",
                  getCardItemClasses(steps.length, index)
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-3xl font-black text-primary/30 group-hover:text-primary transition-colors">
                      {step.number}
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-foreground mb-2">{step.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed mb-4">
                    {step.description}
                  </p>
                </div>

                {/* Deliverable Pill */}
                <div className="mt-4 pt-3 border-t border-border/50">
                  <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary bg-primary/5 px-2.5 py-1 rounded-lg w-full">
                    <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{step.deliverable}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Link
            href={`/${locale}/contact`}
            className="inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <span>{isAr ? 'احجز جلسة تشخيص مجانية لجهة أعمالك' : 'Book a Diagnostic Session for Your Entity'}</span>
            <ArrowRight className="h-4 w-4 rtl:-scale-x-100" />
          </Link>
        </div>
      </div>
    </section>
  );
}
