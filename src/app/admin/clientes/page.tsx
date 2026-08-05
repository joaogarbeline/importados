import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { formatBRL } from "@/lib/money";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserSearchInput } from "@/components/admin/user-search-input";

export default async function AdminClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;

  const customers = await prisma.user.findMany({
    where: {
      role: "CUSTOMER",
      ...(q
        ? {
            OR: [
              { name: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      orders: { where: { paidAt: { not: null } }, select: { total: true } },
      _count: { select: { orders: true } },
    },
  });

  const rows = customers
    .map((c) => ({
      ...c,
      totalSpent: c.orders.reduce((sum, o) => sum + Number(o.total), 0),
    }))
    .sort((a, b) => b.totalSpent - a.totalSpent);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold tracking-tight">Clientes</h1>
        <p className="text-sm font-semibold text-muted-foreground">
          Histórico de compras e relacionamento com os clientes da loja.
        </p>
      </div>

      <Card>
        <CardHeader className="flex-row items-center justify-between gap-4">
          <CardTitle className="text-base">{rows.length} cliente(s)</CardTitle>
          <UserSearchInput defaultValue={q ?? ""} />
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Telefone</TableHead>
                <TableHead>Pedidos</TableHead>
                <TableHead>Total gasto</TableHead>
                <TableHead>Cliente desde</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((c) => (
                <TableRow key={c.id}>
                  <TableCell className="font-bold">
                    <Link href={`/admin/clientes/${c.id}`} className="hover:underline">
                      {c.name}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">{c.email}</TableCell>
                  <TableCell className="text-muted-foreground">{c.phone ?? "-"}</TableCell>
                  <TableCell>{c._count.orders}</TableCell>
                  <TableCell className="font-bold tabular-nums">
                    {formatBRL(c.totalSpent)}
                  </TableCell>
                  <TableCell>
                    {new Intl.DateTimeFormat("pt-BR").format(c.createdAt)}
                  </TableCell>
                </TableRow>
              ))}
              {rows.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground">
                    Nenhum cliente encontrado.
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
