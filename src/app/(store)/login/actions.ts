"use server";

import { AuthError } from "next-auth";
import { redirect } from "next/navigation";
import { signIn, auth } from "@/lib/auth";

export type LoginState = { error?: string } | undefined;

export async function loginAction(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const callbackUrl = String(formData.get("callbackUrl") ?? "").trim();

  if (!email || !password) {
    return { error: "Informe e-mail e senha." };
  }

  try {
    await signIn("credentials", { email, password, redirect: false });
  } catch (error) {
    if (error instanceof AuthError) {
      return { error: "E-mail ou senha inválidos." };
    }
    throw error;
  }

  const session = await auth();
  const destination =
    callbackUrl || (session?.user.role === "ADMIN" ? "/admin" : "/minha-conta");

  redirect(destination);
}
