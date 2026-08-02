import Link from "next/link";
import { SignupForm } from "@/components/storefront/signup-form";

export default function CadastroPage() {
  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-16">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold">Criar conta</h1>
        <p className="text-sm text-muted-foreground">
          Cadastre-se na Triade Sistemas e Importados
        </p>
      </div>
      <SignupForm />
      <p className="text-center text-sm text-muted-foreground">
        Já tem conta?{" "}
        <Link
          href="/login"
          className="font-medium text-foreground hover:underline"
        >
          Entrar
        </Link>
      </p>
    </div>
  );
}
