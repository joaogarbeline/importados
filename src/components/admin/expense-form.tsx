"use client";

import { useActionState } from "react";
import { createExpenseAction, type ExpenseFormState } from "@/app/admin/financeiro/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";

const EXPENSE_CATEGORIES = [
  "Fornecedores",
  "Frete",
  "Marketing",
  "Impostos",
  "Ferramentas / assinaturas",
  "Folha de pagamento",
  "Outros",
];

const initialState: ExpenseFormState = undefined;

export function ExpenseForm() {
  const [state, formAction, pending] = useActionState(createExpenseAction, initialState);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <form action={formAction} className="flex flex-col gap-3">
      {state?.error && (
        <Alert variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="description">Descrição</Label>
          <Input id="description" name="description" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="category">Categoria</Label>
          <Input
            id="category"
            name="category"
            list="expense-categories"
            placeholder="Ex: Fornecedores"
            required
          />
          <datalist id="expense-categories">
            {EXPENSE_CATEGORIES.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="amount">Valor (R$)</Label>
          <Input id="amount" name="amount" type="number" step="0.01" min="0" required />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="date">Data</Label>
          <Input id="date" name="date" type="date" defaultValue={today} required />
        </div>
      </div>

      <div>
        <Button type="submit" disabled={pending}>
          {pending ? "Salvando..." : "Lançar despesa"}
        </Button>
      </div>
    </form>
  );
}
