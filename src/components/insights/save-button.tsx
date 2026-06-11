'use client';

import { useState, useTransition, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toggleSaveInsightAction as toggleSaveInsight } from '@/lib/actions/saved-insights';
import { useTranslations } from 'next-intl';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type SaveButtonProps = {
  insightId: string;
  insightType: string;
  initialIsSaved?: boolean;
  isLoggedIn?: boolean;
  locale?: string;
  variant?: 'icon' | 'default';
  className?: string;
};

export function SaveButton({
  insightId,
  insightType,
  initialIsSaved = false,
  isLoggedIn = false,
  locale = 'en',
  variant = 'icon',
  className,
}: SaveButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations('auth');
  const [isSaved, setIsSaved] = useState(initialIsSaved);
  const [isPending, startTransition] = useTransition();

  // Sync initialIsSaved if it changes
  useEffect(() => {
    setIsSaved(initialIsSaved);
  }, [initialIsSaved]);

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!isLoggedIn) {
      toast.error(t('pleaseLogin') || 'Please log in to save insights', {
        action: {
          label: t('login') || 'Login',
          onClick: () => {
            router.push(`/${locale}/auth/login?redirect=${encodeURIComponent(pathname)}`);
          },
        },
      });
      return;
    }

    // Optimistic update
    const previousState = isSaved;
    setIsSaved(!previousState);

    startTransition(async () => {
      const result = await toggleSaveInsight(insightId, insightType);
      if (result.success) {
        setIsSaved(result.saved === true);
        if (result.saved) {
          toast.success(t('saveSuccess') || 'Insight saved!');
        } else {
          toast.success(t('unsaveSuccess') || 'Insight unsaved!');
        }
        router.refresh();
      } else {
        // Revert on failure
        setIsSaved(previousState);
        toast.error(result.error || 'Failed to toggle bookmark');
      }
    });
  };

  const bookmarkIcon = (
    <motion.div
      key={isSaved ? 'saved' : 'unsaved'}
      initial={{ scale: 0.8, rotate: isSaved ? 15 : -15, opacity: 0 }}
      animate={{ scale: 1, rotate: 0, opacity: 1 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: 'spring', stiffness: 300, damping: 15 }}
      className="flex items-center justify-center"
    >
      <Bookmark
        className={cn(
          "h-5 w-5 transition-colors duration-200",
          isSaved
            ? "fill-primary text-primary"
            : "text-muted-foreground group-hover:text-foreground"
        )}
      />
    </motion.div>
  );

  if (variant === 'default') {
    return (
      <Button
        type="button"
        variant="outline"
        onClick={handleToggle}
        disabled={isPending}
        className={cn(
          "rounded-xl h-11 px-5 font-semibold text-sm flex items-center gap-2 border-border/60 hover:bg-accent/40 active:scale-98 transition-all cursor-pointer",
          isSaved && "border-primary/30 bg-primary/5 hover:bg-primary/10",
          className
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {bookmarkIcon}
        </AnimatePresence>
        <span>
          {isSaved
            ? t('saved') || 'Saved'
            : t('save') || 'Save'}
        </span>
      </Button>
    );
  }

  // Circular Icon Button (Floating on Cards)
  return (
    <button
      type="button"
      onClick={handleToggle}
      disabled={isPending}
      className={cn(
        "group h-10 w-10 flex items-center justify-center rounded-full border border-border/50 bg-card/85 backdrop-blur-sm shadow-md hover:bg-background hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/50",
        isSaved && "border-primary/20 bg-primary/5",
        className
      )}
      aria-label={isSaved ? "Unsave insight" : "Save insight"}
    >
      <AnimatePresence mode="wait" initial={false}>
        {bookmarkIcon}
      </AnimatePresence>
    </button>
  );
}
