"use client";

import { useEffect, useRef } from "react";
import { animate } from "motion/react";

export function AnimatedCounter({
  value,
  className,
}: {
  value: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const controls = animate(0, value, {
      duration: 1.6,
      ease: [0.16, 1, 0.3, 1],
      onUpdate(latest) {
        node.textContent = Math.round(latest).toLocaleString("pt-BR");
      },
    });

    return () => controls.stop();
  }, [value]);

  return (
    <span ref={ref} className={className}>
      0
    </span>
  );
}
