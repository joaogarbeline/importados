"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

const productSchema = z.object({
  name: z.string().min(2, "Informe o nome do produto"),
  slug: z
    .string()
    .min(2, "Informe o slug")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens"),
  description: z.string().min(1, "Informe a descrição"),
  price: z.coerce.number().positive("O preço deve ser maior que zero"),
  sku: z.string().min(1, "Informe o SKU"),
  category: z.string().min(1, "Informe a categoria"),
  stockQty: z.coerce.number().int().min(0, "O estoque não pode ser negativo"),
  isPreOrder: z.coerce.boolean(),
  active: z.coerce.boolean(),
  images: z.string().optional(),
});

function parseImages(raw: string | undefined) {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);
}

export type ProductFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    sku: formData.get("sku"),
    category: formData.get("category"),
    stockQty: formData.get("stockQty"),
    isPreOrder: formData.get("isPreOrder") === "on",
    active: formData.get("active") === "on",
    images: formData.get("images"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> };
  }

  const { images, ...data } = parsed.data;

  try {
    await prisma.product.create({
      data: { ...data, images: parseImages(images) },
    });
  } catch {
    return { error: "Já existe um produto com esse slug ou SKU." };
  }

  revalidatePath("/admin/produtos");
  redirect("/admin/produtos");
}

export async function updateProductAction(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  await requireAdmin();

  const parsed = productSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    sku: formData.get("sku"),
    category: formData.get("category"),
    stockQty: formData.get("stockQty"),
    isPreOrder: formData.get("isPreOrder") === "on",
    active: formData.get("active") === "on",
    images: formData.get("images"),
  });

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> };
  }

  const { images, ...data } = parsed.data;

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { ...data, images: parseImages(images) },
    });
  } catch {
    return { error: "Já existe um produto com esse slug ou SKU." };
  }

  revalidatePath("/admin/produtos");
  revalidatePath(`/admin/produtos/${productId}`);
  redirect("/admin/produtos");
}

export async function toggleProductActiveAction(productId: string, active: boolean) {
  await requireAdmin();
  await prisma.product.update({ where: { id: productId }, data: { active } });
  revalidatePath("/admin/produtos");
}
