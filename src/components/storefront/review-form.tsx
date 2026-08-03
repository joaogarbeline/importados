"use client";

import { useActionState, useState } from "react";
import { StarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import type { ReviewFormState } from "@/app/(store)/loja/[slug]/actions";

const initialState: ReviewFormState = undefined;

export function ReviewForm({
  action,
}: {
  action: (
    state: ReviewFormState,
    formData: FormData
  ) => Promise<ReviewFormState>;
}) {
  const [rating, setRating] = useState(5);
  const [state, formAction, pending] = useActionState(action, initialState);

  if (state?.success) {
    return (
      <Alert>
        <AlertDescription>
          Obrigado pela sua avaliação! Ela já está publicada.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="rating" value={rating} />

      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-1.5">
        <Label>Sua nota</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              type="button"
              onClick={() => setRating(i)}
              aria-label={`${i} estrela(s)`}
            >
              <StarIcon
                className={cn(
                  "size-6 transition-colors",
                  i <= rating
                    ? "fill-primary text-primary"
                    : "fill-none text-muted-foreground/40"
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="authorName">Seu nome</Label>
        <Input id="authorName" name="authorName" required />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label htmlFor="comment">Comentário</Label>
        <Textarea id="comment" name="comment" rows={3} required />
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Enviando..." : "Enviar avaliação"}
        </Button>
      </div>
    </form>
  );
}
