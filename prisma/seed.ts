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
