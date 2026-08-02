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
            "https://images.unsplash.com/photo-1518770660439-4636190af475?w=1600&q=80&auto=format&fit=crop",
          title: "Sistemas sob medida para o seu negócio",
          subtitle:
            "Da automação simples a plataformas completas — desenvolvimento sob medida.",
          linkUrl: "/servicos",
          order: 0,
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1494412651409-8963ce7935a7?w=1600&q=80&auto=format&fit=crop",
          title: "Produtos importados direto pra você",
          subtitle:
            "Garanta seu pedido agora e pague só quando o estoque chegar.",
          linkUrl: "/loja",
          order: 1,
        },
        {
          imageUrl:
            "https://images.unsplash.com/photo-1550009158-9ebf69173e03?w=1600&q=80&auto=format&fit=crop",
          title: "Tecnologia de ponta, prazo garantido",
          subtitle: "Infraestrutura e sistemas confiáveis para escalar seu negócio.",
          linkUrl: "/loja",
          order: 2,
        },
      ],
    });
    console.log("Banners de demonstração criados.");
  }

  const productCount = await prisma.product.count();
  if (productCount === 0) {
    await prisma.product.createMany({
      data: [
        {
          name: "Fone de Ouvido Bluetooth Premium",
          slug: "fone-bluetooth-premium",
          description:
            "Fone de ouvido sem fio com cancelamento de ruído ativo e até 30h de bateria.",
          images: [
            "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=1200&q=80&auto=format&fit=crop",
          ],
          price: 349.9,
          sku: "AUD-001",
          stockQty: 0,
          isPreOrder: true,
          category: "Áudio",
        },
        {
          name: "Smartwatch Series X",
          slug: "smartwatch-series-x",
          description:
            "Relógio inteligente com monitor cardíaco, GPS integrado e resistência à água.",
          images: [
            "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=80&auto=format&fit=crop",
          ],
          price: 899.0,
          sku: "WEAR-001",
          stockQty: 0,
          isPreOrder: true,
          category: "Wearables",
        },
        {
          name: "Drone 4K com Câmera Estabilizada",
          slug: "drone-4k-camera",
          description:
            "Drone compacto com câmera 4K, gimbal de 3 eixos e até 35 minutos de voo.",
          images: [
            "https://images.unsplash.com/photo-1585386959984-a4155224a1ad?w=1200&q=80&auto=format&fit=crop",
          ],
          price: 2499.0,
          sku: "DRN-001",
          stockQty: 0,
          isPreOrder: true,
          category: "Drones",
        },
        {
          name: "Câmera Mirrorless Profissional",
          slug: "camera-mirrorless-pro",
          description:
            "Câmera mirrorless full-frame com gravação em 4K e sensor de alta resolução.",
          images: [
            "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=1200&q=80&auto=format&fit=crop",
          ],
          price: 7999.0,
          sku: "CAM-001",
          stockQty: 0,
          isPreOrder: true,
          category: "Fotografia",
        },
        {
          name: "Notebook Ultra Slim",
          slug: "notebook-ultra-slim",
          description:
            "Notebook leve e potente, ideal para trabalho e criação de conteúdo.",
          images: [
            "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=1200&q=80&auto=format&fit=crop",
          ],
          price: 5299.0,
          sku: "NB-001",
          stockQty: 2,
          isPreOrder: false,
          category: "Informática",
        },
        {
          name: "Smartphone Import Pro",
          slug: "smartphone-import-pro",
          description:
            "Smartphone importado com tela AMOLED, câmera tripla e carregamento rápido.",
          images: [
            "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=1200&q=80&auto=format&fit=crop",
          ],
          price: 3199.0,
          sku: "PHN-001",
          stockQty: 0,
          isPreOrder: true,
          category: "Celulares",
        },
        {
          name: "Caixa de Som Portátil à Prova D'água",
          slug: "caixa-de-som-portatil",
          description:
            "Caixa de som Bluetooth compacta, resistente à água, com graves potentes.",
          images: [
            "https://images.unsplash.com/photo-1493711662062-fa541adb3fc8?w=1200&q=80&auto=format&fit=crop",
          ],
          price: 279.9,
          sku: "AUD-002",
          stockQty: 5,
          isPreOrder: false,
          category: "Áudio",
        },
        {
          name: "Controle de Videogame Wireless",
          slug: "controle-videogame-wireless",
          description:
            "Controle sem fio compatível com múltiplas plataformas, bateria de longa duração.",
          images: [
            "https://images.unsplash.com/photo-1520170350707-b2da59970118?w=1200&q=80&auto=format&fit=crop",
          ],
          price: 349.0,
          sku: "GAME-001",
          stockQty: 0,
          isPreOrder: true,
          category: "Games",
        },
      ],
    });
    console.log("Produtos de demonstração criados.");
  }

  const serviceCount = await prisma.service.count();
  if (serviceCount === 0) {
    await prisma.service.createMany({
      data: [
        {
          name: "Automação de tarefas e planilhas",
          slug: "automacao-tarefas-planilhas",
          description:
            "Automatize processos repetitivos: geração de relatórios, integração de planilhas, envio de e-mails e notificações.",
          category: "Automação",
          complexity: "SIMPLES",
          priceType: "FIXO",
          price: 1200.0,
        },
        {
          name: "Site institucional",
          slug: "site-institucional",
          description:
            "Site profissional para apresentar sua empresa, com design responsivo e otimizado para buscadores.",
          category: "Sistema Web",
          complexity: "SIMPLES",
          priceType: "FIXO",
          price: 2500.0,
        },
        {
          name: "Sistema de gestão sob medida",
          slug: "sistema-gestao-sob-medida",
          description:
            "Sistema web completo para gerenciar sua operação: cadastros, relatórios, permissões de usuário e integrações.",
          category: "Sistema Web",
          complexity: "MEDIA",
          priceType: "ORCAMENTO",
        },
        {
          name: "Plataforma completa com integrações",
          slug: "plataforma-completa-integracoes",
          description:
            "Desenvolvimento de plataformas robustas com múltiplas integrações (pagamento, ERP, APIs externas) e alta escalabilidade.",
          category: "Sistema Complexo",
          complexity: "COMPLEXA",
          priceType: "ORCAMENTO",
        },
      ],
    });
    console.log("Serviços de demonstração criados.");
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
