"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";
import { syncPaymentFromMercadoPago } from "@/lib/orders";
import type { PaymentStatus } from "@/generated/prisma/enums";

const MANUAL_STATUSES: PaymentStatus[] = ["ESTORNADO", "CANCELADO"];

export type PaymentActionState = { error?: string; success?: string } | undefined;

/**
 * Marca manualmente um pagamento como estornado ou cancelado. Não altera o
 * status do pedido automaticamente — cancele o pedido separadamente em
 * /admin/pedidos se necessário.
 */
export async function setPaymentStatusAction(paymentId: string, status: PaymentStatus) {
  await requireAdmin();

  if (!MANUAL_STATUSES.includes(status)) {
    throw new Error("Status inválido para atualização manual.");
  }

  const payment = await prisma.payment.update({
    where: { id: paymentId },
    data: { status },
  });

  revalidatePath("/admin/pagamentos");
  revalidatePath(`/admin/pedidos/${payment.orderId}`);
}

/**
 * Rebusca o pagamento direto na API do Mercado Pago e aplica o status atual
 * no banco (útil quando o webhook falhou ou atrasou).
 */
export async function syncPaymentAction(paymentId: string): Promise<PaymentActionState> {
  await requireAdmin();

  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return { error: "Pagamento não encontrado." };
  if (!payment.mpPaymentId) {
    return { error: "Este pagamento ainda não tem um ID do Mercado Pago para sincronizar." };
  }

  try {
    await syncPaymentFromMercadoPago(payment.mpPaymentId);
  } catch {
    return { error: "Não foi possível consultar o Mercado Pago agora. Tente novamente." };
  }

  revalidatePath("/admin/pagamentos");
  revalidatePath(`/admin/pedidos/${payment.orderId}`);
  return { success: "Pagamento sincronizado com o Mercado Pago." };
}
