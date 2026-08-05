"use client";

import * as React from "react";
import { AnimatePresence, motion } from "motion/react";
import { PackageIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { TiltCard } from "@/components/motion/tilt-card";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = React.useState(0);
  const current = images[active];

  return (
    <div className="flex flex-col gap-3">
      <TiltCard>
        <div className="neon-border relative aspect-square w-full overflow-hidden rounded-2xl bg-muted shadow-xl shadow-black/10">
          <AnimatePresence mode="wait">
            {current ? (
              <motion.img
                key={current}
                src={current}
                alt={name}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="size-full object-cover"
              />
            ) : (
              <div className="flex size-full items-center justify-center text-muted-foreground">
                <PackageIcon className="size-10" />
              </div>
            )}
          </AnimatePresence>
        </div>
      </TiltCard>

      {images.length > 1 && (
        <div className="grid grid-cols-5 gap-2">
          {images.map((img, i) => (
            <button
              key={img + i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Ver imagem ${i + 1}`}
              className={cn(
                "aspect-square overflow-hidden rounded-lg bg-muted ring-2 ring-transparent transition-all",
                i === active
                  ? "ring-primary"
                  : "opacity-70 hover:opacity-100"
              )}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={img}
                alt={`${name} ${i + 1}`}
                className="size-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
