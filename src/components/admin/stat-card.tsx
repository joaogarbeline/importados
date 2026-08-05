import { ArrowDownRightIcon, ArrowUpRightIcon, type LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  trend,
  tone = "default",
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: LucideIcon;
  trend?: number;
  tone?: "default" | "warning" | "critical" | "success";
}) {
  return (
    <Card className="card-lift">
      <CardContent className="flex flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs font-extrabold tracking-wide text-muted-foreground uppercase">
            {label}
          </span>
          {Icon && (
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Icon className="size-4" />
            </div>
          )}
        </div>

        <div
          className={cn(
            "text-2xl font-extrabold tracking-tight tabular-nums",
            tone === "warning" && "text-warning",
            tone === "critical" && "text-destructive",
            tone === "success" && "text-success"
          )}
        >
          {value}
        </div>

        {(hint || trend !== undefined) && (
          <div className="flex items-center gap-2">
            {trend !== undefined && (
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-xs font-extrabold",
                  trend >= 0 ? "text-success" : "text-destructive"
                )}
              >
                {trend >= 0 ? (
                  <ArrowUpRightIcon className="size-3" />
                ) : (
                  <ArrowDownRightIcon className="size-3" />
                )}
                {Math.abs(trend).toFixed(1)}%
              </span>
            )}
            {hint && (
              <p className="text-xs font-semibold text-muted-foreground">{hint}</p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
