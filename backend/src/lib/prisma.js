const { PrismaClient } = require("@prisma/client");

const prisma = globalThis.__ticketdeskPrisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.__ticketdeskPrisma = prisma;
}

module.exports = prisma;
