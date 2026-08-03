'use client';

import { usePathname } from 'next/navigation';
import { ShieldCheck, Award, Users, CheckCircle, Building2, Workflow } from 'lucide-react';

export function TrustSection() {
  const pathname = usePathname();
  const localeMatch = pathname?.match(/^\/(ar|en)/);
  const locale = localeMatch ? localeMatch[1] : 'ar';
  const isAr = locale === 'ar';

  const highlights = [
    {
      icon: Award,
      title: isAr ? 'خبرات استشارية وتنفيذية' : 'Consulting & Field Expertise',
      desc: isAr ? 'فريق قيادي يتمتع بخبرات متراكمة في إدارة المبادرات الوطنية الكبرى والتحول المؤسسي.' : 'Leadership team with extensive track records in major national transformational programs.',
    },
    {
      icon: Workflow,
      title: isAr ? 'منهجيات تنفيذ معتمدة' : 'Proven Methodologies',
      desc: isAr ? 'أطر عمل محوّكمة تضمن سرعة الانطلاق واستدامة الأداء وضبط المخاطر.' : 'Governed frameworks guaranteeing speed, risk management, and outcome sustainability.',
    },
    {
      icon: Building2,
      title: isAr ? 'شراكات وتنوع القطاعات' : 'Cross-Sector Partnerships',
      desc: isAr ? 'سجل حافل بالعمل مع القطاعات الحكومية، والشركات الكبرى، والمؤسسات التنموية.' : 'Proven success record across public entities, enterprises, and non-profits.',
    },
    {
      icon: Users,
      title: isAr ? 'تمكين الفرق ونقل المعرفة' : 'Team Empowerment',
      desc: isAr ? 'لا نكتفي بتقديم التوصيات، بل نعمل جنباً إلى جنب لبناء قدرات الفريق المحلي.' : 'We work side-by-side with local teams to transfer knowledge and build capability.',
    },
  ];

  return (
    <section className="py-16 sm:py-20 bg-accent/10 border-t border-border/40 relative overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-12">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-3">
            <ShieldCheck className="h-4 w-4" />
            <span>{isAr ? 'مقومات الثقة والأثر' : 'Pillars of Trust & Impact'}</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-foreground">
            {isAr ? 'لماذا تختار شروع كشريك تنفيذ؟' : 'Why Partner With Shuru?'}
          </h2>
          <p className="mt-3 text-sm sm:text-base text-muted-foreground">
            {isAr ? 'نجمع بين الخبرة العميقة والمنهجيات الذكية لضمان أعلى معايير الجودة والانضباط.' : 'Combining deep expertise with smart execution methodologies for reliable outcomes.'}
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {highlights.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="rounded-2xl bg-card border border-border/50 p-6 shadow-sm flex flex-col justify-between">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-foreground mb-2">{item.title}</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
                <div className="mt-4 pt-3 border-t border-border/40 flex items-center gap-1.5 text-xs text-primary font-semibold">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>{isAr ? 'معتمد وموثق' : 'Verified Standard'}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
