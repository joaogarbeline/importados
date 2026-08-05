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
  costPrice: z.coerce.number().min(0).optional().or(z.literal("").transform(() => undefined)),
  sku: z.string().min(1, "Informe o SKU"),
  barcode: z.string().optional(),
  category: z.string().min(1, "Informe a categoria"),
  stockQty: z.coerce.number().int().min(0, "O estoque não pode ser negativo"),
  isPreOrder: z.coerce.boolean(),
  active: z.coerce.boolean(),
  images: z.string().optional(),
  brand: z.string().optional(),
  model: z.string().optional(),
  color: z.string().optional(),
  capacity: z.string().optional(),
  warranty: z.string().optional(),
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
});

function parseImages(raw: string | undefined) {
  if (!raw) return [];
  return raw
    .split("\n")
    .map((url) => url.trim())
    .filter(Boolean);
}

function emptyToNull(value: string | undefined) {
  return value && value.trim() !== "" ? value.trim() : null;
}

function readForm(formData: FormData) {
  return {
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    price: formData.get("price"),
    costPrice: formData.get("costPrice") || undefined,
    sku: formData.get("sku"),
    barcode: formData.get("barcode"),
    category: formData.get("category"),
    stockQty: formData.get("stockQty"),
    isPreOrder: formData.get("isPreOrder") === "on",
    active: formData.get("active") === "on",
    images: formData.get("images"),
    brand: formData.get("brand"),
    model: formData.get("model"),
    color: formData.get("color"),
    capacity: formData.get("capacity"),
    warranty: formData.get("warranty"),
    metaTitle: formData.get("metaTitle"),
    metaDescription: formData.get("metaDescription"),
  };
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

  const parsed = productSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> };
  }

  const { images, costPrice, barcode, brand, model, color, capacity, warranty, metaTitle, metaDescription, ...data } =
    parsed.data;

  try {
    await prisma.product.create({
      data: {
        ...data,
        images: parseImages(images),
        costPrice: costPrice ?? null,
        barcode: emptyToNull(barcode),
        brand: emptyToNull(brand),
        model: emptyToNull(model),
        color: emptyToNull(color),
        capacity: emptyToNull(capacity),
        warranty: emptyToNull(warranty),
        metaTitle: emptyToNull(metaTitle),
        metaDescription: emptyToNull(metaDescription),
      },
    });
  } catch {
    return { error: "Já existe um produto com esse slug, SKU ou código de barras." };
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

  const parsed = productSchema.safeParse(readForm(formData));

  if (!parsed.success) {
    return { fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string> };
  }

  const { images, costPrice, barcode, brand, model, color, capacity, warranty, metaTitle, metaDescription, ...data } =
    parsed.data;

  try {
    await prisma.product.update({
      where: { id: productId },
      data: {
        ...data,
        images: parseImages(images),
        costPrice: costPrice ?? null,
        barcode: emptyToNull(barcode),
        brand: emptyToNull(brand),
        model: emptyToNull(model),
        color: emptyToNull(color),
        capacity: emptyToNull(capacity),
        warranty: emptyToNull(warranty),
        metaTitle: emptyToNull(metaTitle),
        metaDescription: emptyToNull(metaDescription),
      },
    });
  } catch {
    return { error: "Já existe um produto com esse slug, SKU ou código de barras." };
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
