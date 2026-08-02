import { prisma } from "@/lib/prisma";
import { getResend, EMAIL_FROM } from "@/lib/resend";
import { formatBRL } from "@/lib/money";
import type { EmailType } from "@/generated/prisma/enums";

async function sendEmail({
  to,
  subject,
  html,
  orderId,
  type,
}: {
  to: string;
  subject: string;
  html: string;
  orderId?: string;
  type: EmailType;
}) {
  const { data, error } = await getResend().emails.send({
    from: EMAIL_FROM,
    to,
    subject,
    html,
  });

  if (error) {
    console.error(`Falha ao enviar e-mail (${type}) para ${to}:`, error);
    return;
  }

  await prisma.emailLog.create({
    data: { orderId, type, toEmail: to, resendId: data?.id },
  });
}

function orderItemsHtml(
  items: { qty: number; unitPrice: unknown; product: { name: string } }[]
) {
  return items
    .map(
      (item) =>
        `<li>${item.qty}x ${item.product.name} — ${formatBRL(Number(item.unitPrice))}</li>`
    )
    .join("");
}

async function getOrderForEmail(orderId: string) {
  return prisma.order.findUniqueOrThrow({
    where: { id: orderId },
    include: { items: { include: { product: true } }, user: true },
  });
}

export async function sendOrderCreatedEmail(orderId: string) {
  const order = await getOrderForEmail(orderId);

  await sendEmail({
    to: order.user.email,
    orderId: order.id,
    type: "PEDIDO_CRIADO",
    subject: `Pedido #${order.id.slice(-8).toUpperCase()} recebido — Triade Sistemas e Importados`,
    html: `
      <h2>Recebemos seu pedido!</h2>
      <p>Olá ${order.user.name}, seu pedido foi registrado com sucesso.</p>
      <p>Alguns itens são sob encomenda. Assim que o estoque estiver disponível, você receberá um e-mail com o link de pagamento.</p>
      <ul>${orderItemsHtml(order.items)}</ul>
      <p><strong>Total: ${formatBRL(Number(order.total))}</strong></p>
      <p>Triade Sistemas e Importados</p>
    `,
  });
}

export async function sendPaymentReleasedEmail(
  orderId: string,
  paymentLink: string
) {
  const order = await getOrderForEmail(orderId);

  await sendEmail({
    to: order.user.email,
    orderId: order.id,
    type: "PAGAMENTO_LIBERADO",
    subject: `Estoque disponível! Pague seu pedido #${order.id.slice(-8).toUpperCase()}`,
    html: `
      <h2>Boas notícias, ${order.user.name}!</h2>
      <p>O(s) produto(s) do seu pedido chegaram ao estoque. Finalize o pagamento para garantir sua compra:</p>
      <ul>${orderItemsHtml(order.items)}</ul>
      <p><strong>Total: ${formatBRL(Number(order.total))}</strong></p>
      <p><a href="${paymentLink}" style="display:inline-block;padding:12px 20px;background:#111;color:#fff;text-decoration:none;border-radius:6px">Pagar agora</a></p>
      <p>Triade Sistemas e Importados</p>
    `,
  });
}

export async function sendPaymentConfirmedEmail(orderId: string) {
  const order = await getOrderForEmail(orderId);

  await sendEmail({
    to: order.user.email,
    orderId: order.id,
    type: "PAGAMENTO_CONFIRMADO",
    subject: `Pagamento confirmado — pedido #${order.id.slice(-8).toUpperCase()}`,
    html: `
      <h2>Pagamento confirmado!</h2>
      <p>Olá ${order.user.name}, recebemos o pagamento do seu pedido. Em breve iniciaremos a preparação.</p>
      <ul>${orderItemsHtml(order.items)}</ul>
      <p><strong>Total: ${formatBRL(Number(order.total))}</strong></p>
      <p>Triade Sistemas e Importados</p>
    `,
  });
}

export async function sendOrderShippedEmail(orderId: string) {
  const order = await getOrderForEmail(orderId);

  await sendEmail({
    to: order.user.email,
    orderId: order.id,
    type: "PEDIDO_ENVIADO",
    subject: `Seu pedido #${order.id.slice(-8).toUpperCase()} foi enviado`,
    html: `
      <h2>Pedido a caminho!</h2>
      <p>Olá ${order.user.name}, seu pedido acabou de ser enviado.</p>
      <ul>${orderItemsHtml(order.items)}</ul>
      <p>Triade Sistemas e Importados</p>
    `,
  });
}

export async function sendOrderCancelledEmail(orderId: string) {
  const order = await getOrderForEmail(orderId);

  await sendEmail({
    to: order.user.email,
    orderId: order.id,
    type: "PEDIDO_CANCELADO",
    subject: `Pedido #${order.id.slice(-8).toUpperCase()} cancelado`,
    html: `
      <h2>Pedido cancelado</h2>
      <p>Olá ${order.user.name}, seu pedido foi cancelado. Qualquer dúvida, fale com a gente.</p>
      <p>Triade Sistemas e Importados</p>
    `,
  });
}

export async function sendServiceRequestReceivedEmail(
  serviceRequestId: string
) {
  const request = await prisma.serviceRequest.findUniqueOrThrow({
    where: { id: serviceRequestId },
    include: { service: true },
  });

  await sendEmail({
    to: request.email,
    type: "ORCAMENTO_RECEBIDO",
    subject: "Recebemos sua solicitação de orçamento — Triade Sistemas e Importados",
    html: `
      <h2>Obrigado pelo contato, ${request.nome}!</h2>
      <p>Recebemos sua solicitação${request.service ? ` para o serviço "${request.service.name}"` : ""} e nossa equipe vai analisar em breve.</p>
      <p><em>${request.descricao}</em></p>
      <p>Triade Sistemas e Importados</p>
    `,
  });

  await sendEmail({
    to: EMAIL_FROM.replace(/.*<(.+)>/, "$1"),
    type: "ORCAMENTO_RECEBIDO",
    subject: `Novo orçamento recebido de ${request.nome}`,
    html: `
      <h2>Novo pedido de orçamento</h2>
      <p><strong>Nome:</strong> ${request.nome}</p>
      <p><strong>E-mail:</strong> ${request.email}</p>
      <p><strong>Telefone:</strong> ${request.telefone ?? "-"}</p>
      <p><strong>Serviço:</strong> ${request.service?.name ?? "Sob consulta"}</p>
      <p><strong>Descrição:</strong> ${request.descricao}</p>
    `,
  });
}
