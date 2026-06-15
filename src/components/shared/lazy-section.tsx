'use client';

import React, { useState, useEffect, useRef } from 'react';

type LazySectionProps = {
  children: React.ReactNode;
  placeholderHeight?: number | string;
};

export function LazySection({ children, placeholderHeight = 250 }: LazySectionProps) {
  const [shouldRender, setShouldRender] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!('IntersectionObserver' in window)) {
      setShouldRender(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShouldRender(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: '200px 0px', // Preload when component is within 200px of viewport
      }
    );

    const currentRef = containerRef.current;
    if (currentRef) {
      observer.observe(currentRef);
    }

    return () => {
      if (currentRef) {
        observer.unobserve(currentRef);
      }
      observer.disconnect();
    };
  }, []);

  const style = shouldRender
    ? {}
    : {
        minHeight: typeof placeholderHeight === 'number' ? `${placeholderHeight}px` : placeholderHeight,
        width: '100%',
      };

  return (
    <div ref={containerRef} style={style}>
      {shouldRender ? children : null}
    </div>
  );
}
