"use client";

import { motion } from "framer-motion";

interface QuoteSectionProps {
  quoteText: string;
  author?: string;
}

export function QuoteSection({ quoteText, author }: QuoteSectionProps) {
  return (
    <section className="py-24 bg-primary text-primary-foreground relative overflow-hidden">
      <div className="container mx-auto px-4 md:px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center space-y-8"
        >
          <svg className="w-12 h-12 md:w-16 md:h-16 mx-auto text-primary-foreground/30 mb-8" fill="currentColor" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M14.024 10.198C12.448 9.202 10.375 8.7 8.083 8.7C4.195 8.7 0.96 11.233 0.138 15.01C-0.34 17.203 0.232 19.539 1.761 21.053C3.308 22.583 5.568 23.326 7.828 23.326C8.537 23.326 9.227 23.238 9.878 23.088C9.533 24.582 8.783 25.807 7.747 26.685C6.733 27.564 5.488 28.141 4.232 28.487L3.197 28.775L4.043 29.566C5.503 30.931 7.424 31.7 9.516 31.7C12.41 31.7 15.155 30.136 16.924 27.525C18.667 24.938 19.648 21.391 19.648 17.291V10.741L14.024 10.198ZM31.144 10.198C29.568 9.202 27.495 8.7 25.203 8.7C21.315 8.7 18.08 11.233 17.258 15.01C16.78 17.203 17.352 19.539 18.881 21.053C20.428 22.583 22.688 23.326 24.948 23.326C25.657 23.326 26.347 23.238 26.998 23.088C26.653 24.582 25.903 25.807 24.867 26.685C23.853 27.564 22.608 28.141 21.352 28.487L20.317 28.775L21.163 29.566C22.623 30.931 24.544 31.7 26.636 31.7C29.53 31.7 32.275 30.136 34.044 27.525C35.787 24.938 36.768 21.391 36.768 17.291V10.741L31.144 10.198Z" />
          </svg>
          <h3 className="text-2xl md:text-4xl lg:text-5xl font-medium leading-tight">
            &ldquo;{quoteText}&rdquo;
          </h3>
          {author && (
            <div className="font-semibold text-xl tracking-wide uppercase pt-4">
              &mdash; {author}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}