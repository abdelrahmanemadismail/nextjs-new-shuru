'use client';

import Link from 'next/link';
import { type Locale } from '@/lib/i18n';
import { motion } from 'framer-motion';

export function CtaFooterSection({ cta, locale }: { cta: import('@/strapi/home').StrapiCtaFooterBlock; locale: Locale }) {
  return (
    <section className="py-16 sm:py-24 bg-background relative z-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative isolate overflow-hidden group bg-gradient-to-br from-primary via-primary to-primary/80 px-6 py-16 sm:py-24 text-center shadow-2xl shadow-primary/20 sm:rounded-3xl sm:px-16 hover:shadow-primary/30 transition-shadow duration-500 border border-primary/20"
        >
          
          {/* Decorative subtle blurs behind text inside the card */}
          <div className="absolute top-1/2 start-1/4 -z-10 h-64 w-64 -translate-y-1/2 rounded-full bg-white/10 blur-[80px]"></div>
          <div className="absolute top-1/2 end-1/4 -z-10 h-64 w-64 -translate-y-1/2 rounded-full bg-slate-900/10 blur-[80px]"></div>

          <h2 className="mx-auto max-w-2xl text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-md">
            {cta.headline}
          </h2>
          <div className="mt-8 sm:mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Link
              href={`/${locale}${cta.primaryButtonLink}`}
              className="group/btn relative overflow-hidden rounded-full bg-white px-10 py-5 text-base font-bold text-primary shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="absolute inset-0 w-full h-full bg-black/5 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300 ease-out z-0"></div>
              <span className="relative z-10">{cta.primaryButtonText}</span>
            </Link>
            {cta.alternativeText && (
              <div className="text-white/90 text-base font-medium">
                {cta.alternativeLink ? (
                  <Link href={`/${locale}${cta.alternativeLink}`} className="hover:text-white transition-colors underline decoration-white/30 hover:decoration-white underline-offset-4 decoration-2">
                    {cta.alternativeText}
                  </Link>
                ) : (
                  <span>{cta.alternativeText}</span>
                )}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
