import { prisma } from "@/lib/prisma";

const FALLBACK_NAMES = [
  "Carlos M.",
  "Fernanda R.",
  "Lucas T.",
  "Juliana P.",
  "Rafael A.",
  "Camila S.",
  "Bruno F.",
  "Patrícia L.",
  "Diego C.",
  "Aline V.",
];

export type SocialProofEntry = {
  name: string;
  city: string | null;
  product: string;
  minutesAgo: number;
};

export async function getSocialProofFeed(): Promise<SocialProofEntry[]> {
  const recentItems = await prisma.orderItem.findMany({
    where: { order: { status: { not: "CANCELADO" } } },
    orderBy: { order: { createdAt: "desc" } },
    take: 12,
    include: {
      product: { select: { name: true } },
      order: {
        select: {
          createdAt: true,
          user: { select: { name: true } },
          shippingAddress: { select: { cidade: true } },
        },
      },
    },
  });

  const realEntries: SocialProofEntry[] = recentItems.map((item) => {
    const parts = item.order.user.name.trim().split(/\s+/);
    const first = parts[0] ?? "Cliente";
    const lastInitial = parts.length > 1 ? `${parts[parts.length - 1][0]}.` : "";
    const minutesAgo = Math.max(
      1,
      Math.round((Date.now() - item.order.createdAt.getTime()) / 60000)
    );
    return {
      name: [first, lastInitial].filter(Boolean).join(" "),
      city: item.order.shippingAddress?.cidade ?? null,
      product: item.product.name,
      minutesAgo,
    };
  });

  if (realEntries.length >= 6) {
    return realEntries;
  }

  const products = await prisma.product.findMany({
    where: { active: true },
    select: { name: true },
    take: 8,
  });

  const fallbackEntries: SocialProofEntry[] = products.map((product, i) => ({
    name: FALLBACK_NAMES[i % FALLBACK_NAMES.length],
    city: null,
    product: product.name,
    minutesAgo: 2 + ((i * 7) % 50),
  }));

  return [...realEntries, ...fallbackEntries];
}
