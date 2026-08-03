"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";

const reviewSchema = z.object({
  authorName: z.string().min(2, "Informe seu nome"),
  rating: z.coerce.number().int().min(1).max(5),
  comment: z.string().min(3, "Escreva um comentário"),
});

export type ReviewFormState = { error?: string; success?: boolean } | undefined;

export async function createReviewAction(
  slug: string,
  _prevState: ReviewFormState,
  formData: FormData
): Promise<ReviewFormState> {
  const user = await getCurrentUser();

  const product = await prisma.product.findUnique({ where: { slug } });
  if (!product) return { error: "Produto não encontrado." };

  const parsed = reviewSchema.safeParse({
    authorName: formData.get("authorName") || user?.name || "",
    rating: formData.get("rating"),
    comment: formData.get("comment"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.review.create({
    data: {
      productId: product.id,
      authorName: parsed.data.authorName,
      rating: parsed.data.rating,
      comment: parsed.data.comment,
    },
  });

  revalidatePath(`/loja/${slug}`);
  return { success: true };
}
