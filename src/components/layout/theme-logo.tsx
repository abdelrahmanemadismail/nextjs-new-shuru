"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useTheme } from "next-themes";

type ThemeLogoProps = {
  lightLogoUrl: string | null;
  darkLogoUrl: string | null;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  priority?: boolean;
  sizes?: string;
  quality?: number;
};

export function ThemeLogo({
  lightLogoUrl,
  darkLogoUrl,
  alt,
  className = "",
  width = 400,
  height = 120,
  priority = false,
  sizes,
  quality = 75,
}: ThemeLogoProps) {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!lightLogoUrl && !darkLogoUrl) {
    return <span className="text-lg font-semibold tracking-wide">Shuru</span>;
  }

  // If we only have one logo, use it for both themes
  const effectiveLightUrl = lightLogoUrl || darkLogoUrl;
  const effectiveDarkUrl = darkLogoUrl || lightLogoUrl;

  // Fallback to light logo on SSR/initial mount to prevent hydration mismatch.
  // Switch to the resolved theme logo once mounted.
  const activeLogoUrl = mounted && resolvedTheme === "dark" ? effectiveDarkUrl : effectiveLightUrl;

  if (!activeLogoUrl) return null;

  return (
    <Image
      src={activeLogoUrl}
      alt={alt}
      width={width}
      height={height}
      className={className}
      priority={priority}
      sizes={sizes}
      quality={quality}
    />
  );
}
