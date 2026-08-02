"use server";

import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { signIn } from "@/lib/auth";

export type SignupState = { error?: string } | undefined;

export async function signupAction(
  _prevState: SignupState,
  formData: FormData
): Promise<SignupState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") ?? "");
  const phone = String(formData.get("phone") ?? "").trim() || undefined;

  if (!name || !email || !password) {
    return { error: "Preencha nome, e-mail e senha." };
  }
  if (password.length < 6) {
    return { error: "A senha precisa ter pelo menos 6 caracteres." };
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Já existe uma conta com este e-mail." };
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { name, email, phone, passwordHash, role: "CUSTOMER" },
  });

  await signIn("credentials", { email, password, redirect: false });

  redirect("/minha-conta");
}
