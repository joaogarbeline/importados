"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin } from "@/lib/auth-helpers";
import { addStock } from "@/lib/orders";

const schema = z.object({
  productId: z.string().min(1, "Selecione um produto"),
  qty: z.coerce.number().int().positive("A quantidade deve ser maior que zero"),
  reason: z.string().min(1, "Informe o motivo da entrada"),
});

export type AddStockState =
  | { error?: string; success?: string }
  | undefined;

export async function addStockAction(
  _prevState: AddStockState,
  formData: FormData
): Promise<AddStockState> {
  await requireAdmin();

  const parsed = schema.safeParse({
    productId: formData.get("productId"),
    qty: formData.get("qty"),
    reason: formData.get("reason"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const releasedOrderIds = await addStock(
    parsed.data.productId,
    parsed.data.qty,
    parsed.data.reason
  );

  revalidatePath("/admin/estoque");
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/pedidos");

  const count = releasedOrderIds.length;
  return {
    success:
      count > 0
        ? `Estoque adicionado! ${count} pedido(s) liberado(s) para pagamento e notificado(s) por e-mail.`
        : "Estoque adicionado. Nenhum pedido pendente foi liberado ainda.",
  };
}
