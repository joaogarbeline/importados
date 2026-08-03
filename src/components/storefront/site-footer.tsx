import { ShieldCheckIcon, BadgeCheckIcon, TruckIcon } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground sm:justify-start">
          <span className="flex items-center gap-1.5">
            <ShieldCheckIcon className="size-3.5 text-primary" />
            Pagamento seguro
          </span>
          <span className="flex items-center gap-1.5">
            <BadgeCheckIcon className="size-3.5 text-primary" />
            Produtos originais
          </span>
          <span className="flex items-center gap-1.5">
            <TruckIcon className="size-3.5 text-primary" />
            Entrega rastreada
          </span>
        </div>
        <div className="flex flex-col gap-2 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Triade Sistemas e Importados. Todos
            os direitos reservados.
          </p>
          <p>contato@performancetriade.com.br</p>
        </div>
      </div>
    </footer>
  );
}
