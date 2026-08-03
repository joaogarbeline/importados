import { cn } from "@/lib/utils";

export function Logo({
  tagline = "Importados",
  className,
}: {
  tagline?: string | false;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col leading-none", className)}>
      <span className="text-gradient-brand font-heading text-lg font-extrabold tracking-tight">
        Triade
      </span>
      {tagline && (
        <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
          {tagline}
        </span>
      )}
    </div>
  );
}
