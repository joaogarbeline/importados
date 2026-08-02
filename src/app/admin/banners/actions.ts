"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";

const bannerSchema = z.object({
  images: z.string().min(1, "Envie uma imagem para o banner"),
  title: z.string().optional(),
  subtitle: z.string().optional(),
  linkUrl: z.string().optional(),
  order: z.coerce.number().int().default(0),
});

export type BannerFormState = {
  error?: string;
};

export async function createBannerAction(
  _prevState: BannerFormState,
  formData: FormData
): Promise<BannerFormState> {
  await requireAdmin();

  const parsed = bannerSchema.safeParse({
    images: formData.get("images"),
    title: formData.get("title") || undefined,
    subtitle: formData.get("subtitle") || undefined,
    linkUrl: formData.get("linkUrl") || undefined,
    order: formData.get("order") || 0,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const imageUrl = parsed.data.images.split("\n")[0]?.trim();
  if (!imageUrl) {
    return { error: "Envie uma imagem para o banner." };
  }

  await prisma.banner.create({
    data: {
      imageUrl,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      linkUrl: parsed.data.linkUrl,
      order: parsed.data.order,
    },
  });

  revalidatePath("/admin/banners");
  revalidatePath("/");
  return {};
}

export async function toggleBannerActiveAction(
  bannerId: string,
  active: boolean
) {
  await requireAdmin();
  await prisma.banner.update({ where: { id: bannerId }, data: { active } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
}

export async function deleteBannerAction(bannerId: string) {
  await requireAdmin();
  await prisma.banner.delete({ where: { id: bannerId } });
  revalidatePath("/admin/banners");
  revalidatePath("/");
}
