"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

export type UserFormState = { error?: string; success?: string } | undefined;

const baseUserSchema = z.object({
  name: z.string().min(2, "Informe o nome"),
  email: z.string().email("Informe um e-mail válido"),
  phone: z.string().optional(),
  role: z.enum(["ADMIN", "CUSTOMER"], { message: "Selecione um perfil" }),
});

function readForm(formData: FormData) {
  return {
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone"),
    role: formData.get("role"),
    password: formData.get("password"),
  };
}

export async function createUserAction(
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  await requireAdmin();

  const raw = readForm(formData);
  const schema = baseUserSchema.extend({
    password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres"),
  });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const email = parsed.data.email.trim().toLowerCase();
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "Já existe uma conta com este e-mail." };
  }

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);
  const user = await prisma.user.create({
    data: {
      name: parsed.data.name.trim(),
      email,
      phone: parsed.data.phone?.trim() || null,
      role: parsed.data.role,
      passwordHash,
    },
  });

  revalidatePath("/admin/usuarios");
  redirect(`/admin/usuarios/${user.id}`);
}

export async function updateUserAction(
  userId: string,
  _prevState: UserFormState,
  formData: FormData
): Promise<UserFormState> {
  const admin = await requireAdmin();

  const raw = readForm(formData);
  const schema = baseUserSchema.extend({
    password: z
      .string()
      .min(6, "A senha precisa ter pelo menos 6 caracteres")
      .optional()
      .or(z.literal("").transform(() => undefined)),
  });
  const parsed = schema.safeParse(raw);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) return { error: "Usuário não encontrado." };

  const email = parsed.data.email.trim().toLowerCase();
  if (email !== target.email) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return { error: "Já existe uma conta com este e-mail." };
  }

  if (target.role === "ADMIN" && parsed.data.role === "CUSTOMER") {
    const otherAdmins = await prisma.user.count({
      where: { role: "ADMIN", id: { not: userId } },
    });
    if (otherAdmins === 0) {
      return { error: "Não é possível rebaixar o último administrador do sistema." };
    }
  }

  await prisma.user.update({
    where: { id: userId },
    data: {
      name: parsed.data.name.trim(),
      email,
      phone: parsed.data.phone?.trim() || null,
      role: parsed.data.role,
      ...(parsed.data.password
        ? { passwordHash: await bcrypt.hash(parsed.data.password, 10) }
        : {}),
    },
  });

  revalidatePath("/admin/usuarios");
  revalidatePath(`/admin/usuarios/${userId}`);

  if (userId === admin.id) {
    // Se o admin editou a própria conta, sinaliza sucesso em vez de
    // redirecionar (evita perder a sessão em fluxo de troca de senha).
    return { success: "Dados atualizados." };
  }

  redirect("/admin/usuarios");
}

export async function deleteUserAction(userId: string) {
  const admin = await requireAdmin();

  if (userId === admin.id) {
    throw new Error("Você não pode excluir a própria conta.");
  }

  const target = await prisma.user.findUnique({ where: { id: userId } });
  if (!target) throw new Error("Usuário não encontrado.");

  if (target.role === "ADMIN") {
    const otherAdmins = await prisma.user.count({
      where: { role: "ADMIN", id: { not: userId } },
    });
    if (otherAdmins === 0) {
      throw new Error("Não é possível excluir o último administrador do sistema.");
    }
  }

  const orderCount = await prisma.order.count({ where: { userId } });
  if (orderCount > 0) {
    throw new Error(
      "Este usuário tem pedidos vinculados e não pode ser excluído. Rebaixe o perfil em vez de excluir."
    );
  }

  await prisma.user.delete({ where: { id: userId } });
  revalidatePath("/admin/usuarios");
}
