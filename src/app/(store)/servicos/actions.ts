"use server";

import { prisma } from "@/lib/prisma";
import { sendServiceRequestReceivedEmail } from "@/lib/emails";
import { getCurrentUser } from "@/lib/auth-helpers";

export type ServiceRequestState =
  | { error?: string; success?: boolean }
  | undefined;

export async function createServiceRequestAction(
  _prevState: ServiceRequestState,
  formData: FormData
): Promise<ServiceRequestState> {
  const user = await getCurrentUser();
  const serviceId = String(formData.get("serviceId") ?? "").trim() || undefined;
  const nome = String(formData.get("nome") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const telefone = String(formData.get("telefone") ?? "").trim() || undefined;
  const descricao = String(formData.get("descricao") ?? "").trim();

  if (!nome || !email || !descricao) {
    return { error: "Preencha nome, e-mail e descreva o que você precisa." };
  }

  const request = await prisma.serviceRequest.create({
    data: { serviceId, userId: user?.id, nome, email, telefone, descricao },
  });

  await sendServiceRequestReceivedEmail(request.id);

  return { success: true };
}
