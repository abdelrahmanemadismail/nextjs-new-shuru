'use client';

import { CheckCircle, Target, Activity, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

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

export function ValueSection({ value }: { value: import('@/strapi/home').StrapiValueBlock }) {
  return (
    <section className="py-16 sm:py-24 lg:py-32 bg-background relative overflow-hidden flex flex-col items-center">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 start-0 -translate-y-1/2 -ms-32 h-96 w-96 rounded-full bg-primary/10 blur-[100px] -z-10"></div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="mx-auto max-w-2xl lg:text-center mb-16 sm:mb-24"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {value.title}
          </h2>
          {value.introText && (
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground font-medium">
              {value.introText}
            </p>
          )}
        </motion.div>

        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(50%); } /* RTL: positive moves container to the right, which makes items flow left natively */
          }
          .animate-marquee {
            animation: marquee 200s linear infinite;
          }
          :root[dir="ltr"] .animate-marquee,
          .ltr .animate-marquee {
            animation-name: marquee-ltr;
          }
          @keyframes marquee-ltr {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
          .animate-marquee:hover {
            animation-play-state: paused;
          }
        `}</style>

        <div className="relative w-full overflow-hidden py-4 sm:py-10" dir="rtl">
          {/* Fading Edges */}
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/4 max-w-[150px] bg-gradient-to-r from-background to-transparent z-10"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/4 max-w-[150px] bg-gradient-to-l from-background to-transparent z-10"></div>

          <div className="flex w-max animate-marquee">
            {Array.from({ length: 20 }).flatMap(() => value.points || []).map((point, index) => (
              <div
                key={`${point.id}-${index}`}
                className="w-[280px] sm:w-[350px] shrink-0 mx-2 sm:mx-3 p-6 sm:p-8 bg-background/60 backdrop-blur-xl rounded-2xl shadow-lg border border-border/50 flex flex-col items-center text-center cursor-pointer group hover:border-primary/50 transition-all duration-300 hover:shadow-primary/5 hover:-translate-y-1 relative overflow-hidden"
              >
                {/* Subtle Hover Gradient Glow */}
                <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

                <div className="relative flex h-14 w-14 sm:h-16 sm:w-16 items-center justify-center rounded-2xl bg-primary/10 mb-5 sm:mb-6 text-primary group-hover:scale-110 transition-transform duration-300 shadow-sm ring-1 ring-primary/20 group-hover:ring-primary/40 group-hover:bg-primary/20">
                  {getIcon(point.iconName, <CheckCircle className="h-7 w-7 sm:h-8 sm:w-8" />)}
                </div>
                <h3 className="relative text-lg sm:text-xl font-bold text-foreground transition-colors group-hover:text-primary mb-2 sm:mb-3">
                  {point.title}
                </h3>
                {point.description && (
                  <p className="relative text-sm sm:text-base text-muted-foreground leading-relaxed">
                    {point.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
