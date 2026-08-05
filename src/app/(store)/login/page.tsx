import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { LoginForm } from "@/components/storefront/login-form";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  const session = await auth();
  if (session?.user) {
    // Já autenticado: admin sempre vai pro painel, independente do
    // callbackUrl que trouxe até aqui.
    redirect(session.user.role === "ADMIN" ? "/admin" : callbackUrl || "/minha-conta");
  }

  return (
    <div className="mx-auto flex w-full max-w-sm flex-col gap-6 px-4 py-16">
      <div className="flex flex-col gap-1 text-center">
        <h1 className="font-heading text-2xl font-semibold">Entrar</h1>
        <p className="text-sm text-muted-foreground">
          Acesse sua conta Triade Sistemas e Importados
        </p>
      </div>
      <LoginForm callbackUrl={callbackUrl} />
      <p className="text-center text-sm text-muted-foreground">
        Não tem conta?{" "}
        <Link
          href="/cadastro"
          className="font-medium text-foreground hover:underline"
        >
          Cadastre-se
        </Link>
      </p>
    </div>
  );
}
