"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { createOrder } from "@/lib/orders";
import { getCurrentUser } from "@/lib/auth-helpers";

export type CheckoutState = { error?: string } | undefined;

export async function checkoutAction(
  _prevState: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const user = await getCurrentUser();
  if (!user) redirect("/login?callbackUrl=/checkout");

  let items: { productId: string; qty: number }[];
  try {
    items = JSON.parse(String(formData.get("items") ?? "[]"));
  } catch {
    return { error: "Não foi possível ler os itens do carrinho." };
  }

  if (!Array.isArray(items) || items.length === 0) {
    return { error: "Seu carrinho está vazio." };
  }

  const cep = String(formData.get("cep") ?? "").trim();
  const rua = String(formData.get("rua") ?? "").trim();
  const numero = String(formData.get("numero") ?? "").trim();
  const complemento =
    String(formData.get("complemento") ?? "").trim() || undefined;
  const bairro = String(formData.get("bairro") ?? "").trim();
  const cidade = String(formData.get("cidade") ?? "").trim();
  const uf = String(formData.get("uf") ?? "").trim().toUpperCase();
  const notes = String(formData.get("notes") ?? "").trim() || undefined;

  if (!cep || !rua || !numero || !bairro || !cidade || !uf) {
    return { error: "Preencha o endereço de entrega completo." };
  }

  const address = await prisma.address.create({
    data: { userId: user.id, cep, rua, numero, complemento, bairro, cidade, uf },
  });

  let orderId: string;
  try {
    const order = await createOrder({
      userId: user.id,
      shippingAddressId: address.id,
      notes,
      items,
    });
    orderId = order.id;
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Não foi possível concluir o pedido.",
    };
  }

  redirect(`/minha-conta/pedidos/${orderId}?novo=1`);
}
