"use client";

import { motion } from "framer-motion";
import type { StrapiChallengeCard } from "@/strapi/page";

interface ChallengesSectionProps {
  title: string;
  introText?: string;
  challenges: StrapiChallengeCard[];
}

export function ChallengesSection({ title, introText, challenges }: ChallengesSectionProps) {
  return (
    <section className="py-20 bg-background overflow-hidden relative">
      <div className="container mx-auto px-4 md:px-6">
        <div className="text-center mb-16 space-y-4">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold tracking-tight"
          >
            {title}
          </motion.h2>
          {introText && (
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
            >
              {introText}
            </motion.p>
          )}
        </div>

        <div className="grid gap-8 md:grid-cols-2 lg:gap-12 max-w-6xl mx-auto">
          {challenges.map((challenge, idx) => (
            <motion.div
              key={challenge.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="group relative rounded-3xl overflow-hidden bg-card border p-8 hover:shadow-xl transition-all duration-300"
            >
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold tracking-wider text-destructive uppercase mb-2">The Pain</h4>
                  <p className="text-lg font-medium">{challenge.pain}</p>
                </div>

                <div className="pl-4 border-l-2 border-primary/20">
                  <h4 className="text-sm font-semibold tracking-wider text-primary uppercase mb-2">Intervention</h4>
                  <p className="text-muted-foreground">{challenge.intervention}</p>
                </div>

                <div>
                  <h4 className="text-sm font-semibold tracking-wider text-green-500 uppercase mb-2">Result</h4>
                  <p className="text-xl font-bold">{challenge.result}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}