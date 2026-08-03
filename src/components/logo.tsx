import { cn } from "@/lib/utils";

export function Logo({
  tagline = "Importados",
  className,
}: {
  tagline?: string | false;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="glow-primary flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary via-primary to-primary/70 font-heading text-base font-extrabold text-primary-foreground">
        T
      </span>
      <span className="flex flex-col leading-none">
        <span className="font-heading text-lg font-extrabold tracking-tight">
          Triade
        </span>
        {tagline && (
          <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
            {tagline}
          </span>
        )}
      </span>
    </div>
  );
}
