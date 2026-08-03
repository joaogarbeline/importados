"use server";

import { z } from "zod";
import { signOut } from "@/lib/auth";
import { sendCustomOrderRequestEmail } from "@/lib/emails";

export async function signOutAction() {
  await signOut({ redirectTo: "/" });
}

const customOrderSchema = z.object({
  name: z.string().min(2, "Informe seu nome"),
  email: z.string().email("Informe um e-mail válido"),
  phone: z.string().optional(),
  description: z.string().min(5, "Conte o que você procura"),
});

export type CustomOrderState = { error?: string; success?: boolean } | undefined;

export async function createCustomOrderRequestAction(
  _prevState: CustomOrderState,
  formData: FormData
): Promise<CustomOrderState> {
  const parsed = customOrderSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") || undefined,
    description: formData.get("description"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await sendCustomOrderRequestEmail(parsed.data);

  return { success: true };
}
