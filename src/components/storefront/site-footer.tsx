export function SiteFooter() {
  return (
    <footer className="border-t py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-2 px-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} Triade Sistemas e Importados. Todos os
          direitos reservados.
        </p>
        <p>contato@performancetriade.com.br</p>
      </div>
    </footer>
  );
}
