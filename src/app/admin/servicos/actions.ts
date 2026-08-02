"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-helpers";
import { prisma } from "@/lib/prisma";
import type { ServiceRequestStatus } from "@/generated/prisma/enums";

const serviceSchema = z.object({
  name: z.string().min(2, "Informe o nome do serviço"),
  slug: z
    .string()
    .min(2, "Informe o slug")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use apenas letras minúsculas, números e hífens"),
  description: z.string().min(1, "Informe a descrição"),
  category: z.string().min(1, "Informe a categoria"),
  complexity: z.enum(["SIMPLES", "MEDIA", "COMPLEXA"]),
  priceType: z.enum(["FIXO", "ORCAMENTO"]),
  price: z.coerce.number().positive().optional().or(z.literal("")),
});

export type ServiceFormState = {
  error?: string;
  fieldErrors?: Record<string, string>;
};

export async function createServiceAction(
  _prevState: ServiceFormState,
  formData: FormData
): Promise<ServiceFormState> {
  await requireAdmin();

  const rawPrice = formData.get("price");
  const parsed = serviceSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    description: formData.get("description"),
    category: formData.get("category"),
    complexity: formData.get("complexity"),
    priceType: formData.get("priceType"),
    price: rawPrice ? rawPrice : "",
  });

  if (!parsed.success) {
    return {
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string>,
    };
  }

  const { price, priceType, ...data } = parsed.data;

  try {
    await prisma.service.create({
      data: {
        ...data,
        priceType,
        price: priceType === "FIXO" && price ? price : null,
      },
    });
  } catch {
    return { error: "Já existe um serviço com esse slug." };
  }

  revalidatePath("/admin/servicos");
  return {};
}

export async function toggleServiceActiveAction(
  serviceId: string,
  active: boolean
) {
  await requireAdmin();
  await prisma.service.update({ where: { id: serviceId }, data: { active } });
  revalidatePath("/admin/servicos");
}

export async function updateServiceRequestStatusAction(
  requestId: string,
  status: ServiceRequestStatus
) {
  await requireAdmin();
  await prisma.serviceRequest.update({
    where: { id: requestId },
    data: { status },
  });
  revalidatePath("/admin/servicos");
}
