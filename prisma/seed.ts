import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const adminEmail = process.env.ADMIN_EMAIL ?? "contato@performancetriade.com.br";
  const adminPassword = process.env.ADMIN_PASSWORD ?? "Triade2026@Admin";
  const adminName = process.env.ADMIN_NAME ?? "Triade Sistemas e Importados";

  const passwordHash = await bcrypt.hash(adminPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { passwordHash, role: "ADMIN" },
    create: {
      name: adminName,
      email: adminEmail,
      passwordHash,
      role: "ADMIN",
    },
  });

  console.log(`Admin pronto: ${admin.email}`);

  const bannerCount = await prisma.banner.count();
  if (bannerCount === 0) {
    await prisma.banner.createMany({
      data: [
        {
          imageUrl:
            "https://images.unsplash.com/photo-1623079397242-c2e809a6ef1d?w=1600&q=80&auto=format&fit=crop",
          title: "Motos elétricas importadas com garantia",
          subtitle:
            "Economia, potência e estilo — garanta a sua sob encomenda antes que a próxima leva acabe.",
          linkUrl: "/loja",
          order: 0,
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1592286927505-1def25115558?w=1600&q=80&auto=format&fit=crop",
          title: "Os lançamentos que você procura, direto pra você",
          subtitle:
            "Celulares importados com procedência garantida. Pague só quando o estoque chegar.",
          linkUrl: "/loja",
          order: 1,
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1544117519-31a4b719223d?w=1600&q=80&auto=format&fit=crop",
          title: "Apple Watch original, entrega garantida",
          subtitle: "Estoque limitado — garanta o seu por ordem de chegada.",
          linkUrl: "/loja",
          order: 2,
        },
      ],
    });
    console.log("Banners de demonstração criados.");
  }

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    const products = await Promise.all([
      prisma.product.create({
        data: {
          name: "Moto Elétrica Urbana X1",
          slug: "moto-eletrica-urbana-x1",
          description:
            "Moto elétrica ideal para o dia a dia na cidade: autonomia de até 80km, recarga completa em poucas horas e zero emissão de poluentes.",
          images: [
            "https://images.unsplash.com/photo-1623079397242-c2e809a6ef1d?w=1200&q=80&auto=format&fit=crop",
          ],
          price: 8990.0,
          sku: "MOTO-001",
          stockQty: 0,
          isPreOrder: true,
          category: "Motos Elétricas",
        },
      }),
      prisma.product.create({
        data: {
          name: "Moto Elétrica Off-Road Pro",
          slug: "moto-eletrica-off-road-pro",
          description:
            "Moto elétrica robusta para todo tipo de terreno, motor de alta performance e suspensão reforçada.",
          images: [
            "https://images.unsplash.com/photo-1638743995296-cac26c72fa7a?w=1200&q=80&auto=format&fit=crop",
          ],
          price: 12490.0,
          sku: "MOTO-002",
          stockQty: 0,
          isPreOrder: true,
          category: "Motos Elétricas",
        },
      }),
      prisma.product.create({
        data: {
          name: "iPhone 15 Pro Max",
          slug: "iphone-15-pro-max",
          description:
            "iPhone 15 Pro Max importado, lacrado, com garantia. Câmera profissional e desempenho de ponta.",
          images: [
            "https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=1200&q=80&auto=format&fit=crop",
          ],
          price: 8499.0,
          sku: "PHN-001",
          stockQty: 0,
          isPreOrder: true,
          category: "Celulares",
        },
      }),
      prisma.product.create({
        data: {
          name: "Samsung Galaxy S24 Ultra",
          slug: "samsung-galaxy-s24-ultra",
          description:
            "Galaxy S24 Ultra importado, tela AMOLED, câmera de altíssima resolução e S Pen inclusa.",
          images: [
            "https://images.unsplash.com/photo-1706300896423-7d08346e8dbb?w=1200&q=80&auto=format&fit=crop",
          ],
          price: 7299.0,
          sku: "PHN-002",
          stockQty: 0,
          isPreOrder: true,
          category: "Celulares",
        },
      }),
      prisma.product.create({
        data: {
          name: "Apple Watch Series 9",
          slug: "apple-watch-series-9",
          description:
            "Apple Watch Series 9 original, monitor cardíaco, GPS e resistência à água.",
          images: [
            "https://images.unsplash.com/photo-1551816230-ef5deaed4a26?w=1200&q=80&auto=format&fit=crop",
          ],
          price: 3299.0,
          sku: "WATCH-001",
          stockQty: 0,
          isPreOrder: true,
          category: "Apple Watch",
        },
      }),
      prisma.product.create({
        data: {
          name: "Apple Watch Ultra 2",
          slug: "apple-watch-ultra-2",
          description:
            "Apple Watch Ultra 2, o mais resistente e completo da linha, ideal para esportes extremos.",
          images: [
            "https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=1200&q=80&auto=format&fit=crop",
          ],
          price: 4999.0,
          sku: "WATCH-002",
          stockQty: 0,
          isPreOrder: true,
          category: "Apple Watch",
        },
      }),
      prisma.product.create({
        data: {
          name: "Fone de Ouvido Bluetooth Premium",
          slug: "fone-bluetooth-premium",
          description:
            "Fone de ouvido sem fio com cancelamento de ruído ativo e até 30h de bateria.",
          images: [
            "https://images.unsplash.com/photo-1567928513899-997d98489fbd?w=1200&q=80&auto=format&fit=crop",
          ],
          price: 349.9,
          sku: "AUD-001",
          stockQty: 6,
          isPreOrder: false,
          category: "Eletrônicos",
        },
      }),
      prisma.product.create({
        data: {
          name: "Caixa de Som Portátil à Prova D'água",
          slug: "caixa-de-som-portatil",
          description:
            "Caixa de som Bluetooth compacta, resistente à água, com graves potentes.",
          images: [
            "https://images.unsplash.com/photo-1675319245480-215961c129f1?w=1200&q=80&auto=format&fit=crop",
          ],
          price: 279.9,
          sku: "AUD-002",
          stockQty: 8,
          isPreOrder: false,
          category: "Eletrônicos",
        },
      }),
    ]);
    console.log("Produtos de demonstração criados.");

    const sampleReviews: Record<string, { name: string; rating: number; comment: string }[]> = {
      "moto-eletrica-urbana-x1": [
        { name: "Marcos T.", rating: 5, comment: "Chegou certinho, exatamente como anunciado. Economia absurda no dia a dia." },
        { name: "Renata O.", rating: 5, comment: "Melhor custo-benefício que encontrei. Atendimento ótimo do início ao fim." },
      ],
      "iphone-15-pro-max": [
        { name: "André L.", rating: 5, comment: "Produto original, lacrado, sem nenhum problema. Recomendo demais." },
        { name: "Priscila M.", rating: 4, comment: "Muito bom, só levou um pouco mais de tempo que eu esperava pra chegar." },
      ],
      "apple-watch-series-9": [
        { name: "Thiago B.", rating: 5, comment: "Original e com garantia de verdade. Superou minhas expectativas." },
      ],
      "fone-bluetooth-premium": [
        { name: "Larissa G.", rating: 5, comment: "Som excelente, cancelamento de ruído funciona muito bem." },
        { name: "Felipe N.", rating: 4, comment: "Bom custo-benefício, bateria dura o que promete." },
      ],
    };

    for (const product of products) {
      const reviews = sampleReviews[product.slug];
      if (!reviews) continue;
      await prisma.review.createMany({
        data: reviews.map((r) => ({
          productId: product.id,
          authorName: r.name,
          rating: r.rating,
          comment: r.comment,
        })),
      });
    }
    console.log("Avaliações de demonstração criadas.");
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
