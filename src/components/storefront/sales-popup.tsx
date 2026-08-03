"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { ShoppingBagIcon } from "lucide-react";
import type { SocialProofEntry } from "@/lib/social-proof";

export function SalesPopup() {
  const [feed, setFeed] = useState<SocialProofEntry[]>([]);
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/social-proof");
        const data = await res.json();
        if (!cancelled) setFeed(data.feed ?? []);
      } catch {
        // popup social é cosmético — falha silenciosa não deve afetar a loja
      }
    }

    load();
    const refresh = setInterval(load, 5 * 60 * 1000);
    return () => {
      cancelled = true;
      clearInterval(refresh);
    };
  }, []);

  useEffect(() => {
    if (feed.length === 0) return;

    const showAfter = setTimeout(() => setVisible(true), 3000);
    const hideAfter = setTimeout(() => setVisible(false), 8000);
    const nextAfter = setTimeout(() => {
      setIndex((i) => (i + 1) % feed.length);
    }, 8600);

    return () => {
      clearTimeout(showAfter);
      clearTimeout(hideAfter);
      clearTimeout(nextAfter);
    };
  }, [feed, index]);

  if (feed.length === 0) return null;
  const entry = feed[index];

  return (
    <div className="pointer-events-none fixed inset-x-3 bottom-3 z-30 flex justify-center sm:inset-x-auto sm:bottom-4 sm:left-4 sm:justify-start">
      <AnimatePresence>
        {visible && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="pointer-events-auto flex w-full max-w-xs items-center gap-3 rounded-xl border border-white/10 bg-card/95 p-3 shadow-xl shadow-black/20 backdrop-blur"
          >
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
              <ShoppingBagIcon className="size-4" />
            </div>
            <div className="text-xs">
              <p className="font-medium text-foreground">
                {entry.name}
                {entry.city ? ` · ${entry.city}` : ""}
              </p>
              <p className="text-muted-foreground">
                comprou{" "}
                <span className="font-medium text-foreground">
                  {entry.product}
                </span>
              </p>
              <p className="text-muted-foreground">há {entry.minutesAgo} min</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
