"use client";

import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

type TopBannerProps = {
  message?: string;
  dismissible?: boolean;
  onDismiss?: () => void;
  linkUrl?: string;
  linkText?: string;
};

export default function TopBanner({
  message = "Welcome to Shuru. Subscribe to get the latest updates.",
  dismissible = true,
  onDismiss,
  linkUrl,
  linkText = "Subscribe now",
}: TopBannerProps) {
  return (
    <div
      className="relative w-full border-b border-primary/20 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground"
      role="banner"
      aria-label="Top banner"
    >
      <div className="w-full px-4 py-2">
        <div className="flex items-center justify-center gap-3 text-center">
          <p className="text-xs font-medium sm:text-sm">{message}</p>

          {linkUrl ? (
            <a
              href={linkUrl}
              className="text-xs font-bold underline underline-offset-2 hover:no-underline sm:text-sm"
            >
              {linkText}
            </a>
          ) : null}

          {dismissible ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={onDismiss}
              className="absolute start-2 top-1/2 h-6 w-6 -translate-y-1/2 rounded-full p-0 text-primary-foreground hover:bg-primary-foreground/20"
              aria-label="Dismiss banner"
            >
              <X className="h-3.5 w-3.5" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}