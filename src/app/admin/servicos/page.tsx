import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ServiceForm } from "@/components/admin/service-form";
import { ServiceRequestStatusSelect } from "@/components/admin/service-request-status-select";
import { toggleServiceActiveAction } from "./actions";

const COMPLEXITY_LABEL: Record<string, string> = {
  SIMPLES: "Simples",
  MEDIA: "Média",
  COMPLEXA: "Complexa",
};

export default async function AdminServicosPage() {
  const [services, requests] = await Promise.all([
    prisma.service.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.serviceRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { service: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Serviços</h1>
        <p className="text-sm text-muted-foreground">
          Catálogo de serviços de programação e solicitações de orçamento
          recebidas.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Novo serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {services.length} serviço(s) cadastrado(s)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Categoria</TableHead>
                <TableHead>Complexidade</TableHead>
                <TableHead>Preço</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => {
                const toggleAction = toggleServiceActiveAction.bind(
                  null,
                  service.id,
                  !service.active
                );
                return (
                  <TableRow key={service.id}>
                    <TableCell className="max-w-[200px] truncate font-medium">
                      {service.name}
                    </TableCell>
                    <TableCell>{service.category}</TableCell>
                    <TableCell>
                      {COMPLEXITY_LABEL[service.complexity] ?? service.complexity}
                    </TableCell>
                    <TableCell>
                      {service.priceType === "FIXO" && service.price
                        ? formatBRL(service.price)
                        : "Sob orçamento"}
                    </TableCell>
                    <TableCell>
                      {service.active ? (
                        <Badge variant="default">Ativo</Badge>
                      ) : (
                        <Badge variant="outline">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <form action={toggleAction}>
                        <Button type="submit" variant="ghost" size="sm">
                          {service.active ? "Desativar" : "Ativar"}
                        </Button>
                      </form>
                    </TableCell>
                  </TableRow>
                );
              })}
              {services.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Nenhum serviço cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {requests.length} solicitação(ões) de orçamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Contato</TableHead>
                <TableHead>Serviço</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell className="max-w-[140px] truncate font-medium">
                    {request.nome}
                  </TableCell>
                  <TableCell className="max-w-[180px] truncate text-muted-foreground">
                    {request.email}
                    {request.telefone ? ` · ${request.telefone}` : ""}
                  </TableCell>
                  <TableCell className="max-w-[140px] truncate">
                    {request.service?.name ?? "Sob consulta"}
                  </TableCell>
                  <TableCell className="max-w-[260px] truncate text-muted-foreground">
                    {request.descricao}
                  </TableCell>
                  <TableCell>
                    <ServiceRequestStatusSelect
                      requestId={request.id}
                      status={request.status}
                    />
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("pt-BR", {
                      dateStyle: "short",
                    }).format(request.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
              {requests.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={6}
                    className="text-center text-muted-foreground"
                  >
                    Nenhuma solicitação recebida ainda.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
