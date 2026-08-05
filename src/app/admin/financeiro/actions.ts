"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/auth-helpers";

const expenseSchema = z.object({
  description: z.string().min(1, "Informe a descrição"),
  category: z.string().min(1, "Informe a categoria"),
  amount: z.coerce.number().positive("O valor deve ser maior que zero"),
  date: z.string().min(1, "Informe a data"),
});

export type ExpenseFormState = { error?: string } | undefined;

export async function createExpenseAction(
  _prevState: ExpenseFormState,
  formData: FormData
): Promise<ExpenseFormState> {
  await requireAdmin();

  const parsed = expenseSchema.safeParse({
    description: formData.get("description"),
    category: formData.get("category"),
    amount: formData.get("amount"),
    date: formData.get("date"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Dados inválidos." };
  }

  await prisma.expense.create({
    data: {
      description: parsed.data.description,
      category: parsed.data.category,
      amount: parsed.data.amount,
      date: new Date(parsed.data.date),
    },
  });

  revalidatePath("/admin/financeiro");
}

export async function deleteExpenseAction(expenseId: string) {
  await requireAdmin();
  await prisma.expense.delete({ where: { id: expenseId } });
  revalidatePath("/admin/financeiro");
}
