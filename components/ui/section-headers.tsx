import React from "react";

interface SectionProps {
  children: React.ReactNode;
  className?: string;
}

export const Section = ({ children, className = "" }: SectionProps) => (
  <section className={`py-24 md:py-32 ${className}`}>
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
  </section>
);

export const SectionTitle = ({ children, className = "" }: SectionProps) => (
  <h2
    className={`text-4xl md:text-5xl font-bold text-gray-900 dark:text-white text-center ${className}`}
  >
    {children}
  </h2>
);

export const SectionSubtitle = ({ children, className = "" }: SectionProps) => (
  <p
    className={`text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto text-center ${className}`}
  >
    {children}
  </p>
);
