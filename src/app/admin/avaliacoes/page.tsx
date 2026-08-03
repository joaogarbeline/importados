import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RatingStars } from "@/components/storefront/rating-stars";
import { deleteReviewAction } from "./actions";

export default async function AdminAvaliacoesPage() {
  const reviews = await prisma.review.findMany({
    orderBy: { createdAt: "desc" },
    include: { product: { select: { name: true, slug: true } } },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-bold">Avaliações</h1>
        <p className="text-sm text-muted-foreground">
          Avaliações de produtos enviadas pelos clientes.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">{reviews.length} avaliação(ões)</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3">
          {reviews.map((review) => {
            const removeAction = deleteReviewAction.bind(null, review.id);
            return (
              <div
                key={review.id}
                className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-start sm:justify-between"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{review.authorName}</span>
                    <RatingStars rating={review.rating} />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Produto: {review.product.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {review.comment}
                  </p>
                </div>
                <form action={removeAction}>
                  <Button type="submit" variant="ghost" size="sm" className="text-destructive">
                    Excluir
                  </Button>
                </form>
              </div>
            );
          })}
          {reviews.length === 0 && (
            <p className="py-8 text-center text-muted-foreground">
              Nenhuma avaliação recebida ainda.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
