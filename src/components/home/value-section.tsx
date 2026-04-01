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
    <section className="py-16 sm:py-24 lg:py-32 bg-background relative overflow-hidden">
      {/* Decorative Glow */}
      <div className="absolute top-1/2 start-0 -translate-y-1/2 -ms-32 h-96 w-96 rounded-full bg-primary/10 blur-[100px] -z-10"></div>
      
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-foreground">
            {value.title}
          </h2>
          {value.introText && (
            <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-8 text-muted-foreground font-medium">
              {value.introText}
            </p>
          )}
        </div>
        <div className="mx-auto mt-12 sm:mt-20 max-w-2xl lg:max-w-5xl">
          <motion.dl 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={{
              visible: { transition: { staggerChildren: 0.1 } }
            }}
            className="flex flex-wrap justify-center gap-x-12 gap-y-12 lg:gap-y-16"
          >
            {value.points?.map((point) => (
              <motion.div 
                key={point.id} 
                variants={{
                  hidden: { opacity: 0, x: -20 },
                  visible: { opacity: 1, x: 0, transition: { duration: 0.5 } }
                }}
                className="w-full lg:w-[calc(50%-1.5rem)] group relative ps-16 sm:ps-20 transition-all duration-300 hover:translate-x-2 rtl:hover:-translate-x-2"
              >
                <dt className="text-xl font-bold leading-7 text-foreground">
                  <div className="absolute start-0 top-0 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/15 to-primary/5 shadow-sm transform group-hover:scale-110 transition-transform duration-300">
                    <div className="text-primary transform transition-transform group-hover:rotate-12 duration-300">
                      {getIcon(point.iconName, <CheckCircle className="h-7 w-7 text-primary" />)}
                    </div>
                  </div>
                  {point.title}
                </dt>
                {point.description && (
                  <dd className="mt-3 text-base leading-relaxed text-muted-foreground">
                    {point.description}
                  </dd>
                )}
              </motion.div>
            ))}
          </motion.dl>
        </div>
      </div>
    </section>
  );
}
