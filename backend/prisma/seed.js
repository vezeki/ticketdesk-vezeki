const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hash = await bcrypt.hash("Admin@123", 12);
  await prisma.user.upsert({
    where: { email: "admin@local.dev" },
    update: {},
    create: {
      name: "Administrador",
      email: "admin@local.dev",
      password: hash,
      role: "ADMIN",
      department: "TI",
    },
  });

  const techHash = await bcrypt.hash("Tec@123", 12);
  await prisma.user.upsert({
    where: { email: "tecnico@local.dev" },
    update: {},
    create: {
      name: "Técnico Demo",
      email: "tecnico@local.dev",
      password: techHash,
      role: "TECNICO",
      department: "TI",
    },
  });

  const userHash = await bcrypt.hash("User@123", 12);
  await prisma.user.upsert({
    where: { email: "usuario@local.dev" },
    update: {},
    create: {
      name: "Usuário Demo",
      email: "usuario@local.dev",
      password: userHash,
      role: "USUARIO",
      department: "Financeiro",
    },
  });

  console.log("Seed OK — admin@local.dev / Admin@123 | tecnico@local.dev / Tec@123 | usuario@local.dev / User@123");
}

main()
  .then(() => prisma.$disconnect())
  .catch((e) => {
    console.error(e);
    prisma.$disconnect();
    process.exit(1);
  });
