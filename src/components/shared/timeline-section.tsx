"use client";

import { motion } from "framer-motion";
import type { StrapiTimelineStep } from "@/strapi/page";

interface TimelineSectionProps {
  title: string;
  steps: StrapiTimelineStep[];
}

export function TimelineSection({ title, steps }: TimelineSectionProps) {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 md:px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight">{title}</h2>
        </motion.div>

        <div className="max-w-4xl mx-auto relative">
          {/* Vertical line through steps */}
          <div className="absolute left-[20px] md:left-1/2 md:-ml-px top-0 bottom-0 w-px bg-border hidden md:block" />

          <div className="space-y-12 md:space-y-24">
            {steps.map((step, idx) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
                className={`relative flex flex-col md:flex-row gap-8 items-center ${
                  idx % 2 === 0 ? "md:flex-row-reverse" : ""
                }`}
              >
                {/* Step Content */}
                <div className={`md:w-1/2 flex flex-col ${idx % 2 === 0 ? "md:items-start md:text-left text-start" : "md:items-end md:text-right text-start"} w-full`}>
                  <div className="bg-card p-6 md:p-8 rounded-2xl shadow-sm border border-border/50 hover:shadow-lg transition-shadow duration-300 w-full relative group">
                    <span className="text-4xl md:text-6xl font-black text-primary/10 absolute -top-4 -right-2 md:group-hover:-top-6 transition-all duration-300">
                      0{idx + 1}
                    </span>
                    <h3 className="text-xl md:text-2xl font-bold mb-3 relative z-10">{step.title}</h3>
                    <p className="text-muted-foreground leading-relaxed relative z-10">{step.description}</p>
                  </div>
                </div>

                {/* Center Node */}
                <div className="hidden md:flex absolute left-1/2 -ml-[24px] w-12 h-12 bg-background border-4 border-primary rounded-full items-center justify-center shadow-sm z-10">
                   <span className="text-primary font-bold text-lg">{idx + 1}</span>
                </div>

              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}