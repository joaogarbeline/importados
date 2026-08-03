import { StarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({
  rating,
  size = "sm",
}: {
  rating: number;
  size?: "sm" | "md";
}) {
  const rounded = Math.round(rating);
  const starSize = size === "md" ? "size-5" : "size-3.5";

  return (
    <div
      className="flex items-center gap-0.5"
      aria-label={`${rating.toFixed(1)} de 5 estrelas`}
    >
      {[1, 2, 3, 4, 5].map((i) => (
        <StarIcon
          key={i}
          className={cn(
            starSize,
            i <= rounded
              ? "fill-primary text-primary"
              : "fill-none text-muted-foreground/40"
          )}
        />
      ))}
    </div>
  );
}

export function averageRating(reviews: { rating: number }[]) {
  if (reviews.length === 0) return 0;
  return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
}
