import React from "react";

type ThemeLogoProps = {
  lightLogoUrl: string | null;
  darkLogoUrl: string | null;
  alt: string;
  className?: string;
};

export function ThemeLogo({ lightLogoUrl, darkLogoUrl, alt, className = "" }: ThemeLogoProps) {
  if (!lightLogoUrl && !darkLogoUrl) {
    return <span className="text-lg font-semibold tracking-wide">Shuru</span>;
  }

  // If we only have one logo, use it for both themes
  const effectiveLightUrl = lightLogoUrl || darkLogoUrl;
  const effectiveDarkUrl = darkLogoUrl || lightLogoUrl;

  return (
    <>
      {effectiveLightUrl && (
        <img
          src={effectiveLightUrl}
          alt={alt}
          className={`${className} dark:hidden`}
          loading="lazy"
        />
      )}
      {effectiveDarkUrl && (
        <img
          src={effectiveDarkUrl}
          alt={alt}
          className={`${className} hidden dark:block`}
          loading="lazy"
        />
      )}
    </>
  );
}
