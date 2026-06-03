const prisma = require("../../lib/prisma");

function listUsers({ skip, take, search }) {
  const where = {
    ...(search
      ? {
          OR: [
            { name: { contains: search } },
            { email: { contains: search } },
            { department: { contains: search } },
          ],
        }
      : {}),
  };
  return Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        active: true,
        createdAt: true,
        updatedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);
}

function findById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

function listTechnicians() {
  return prisma.user.findMany({
    where: { active: true, role: { in: ["TECNICO", "ADMIN"] } },
    orderBy: { name: "asc" },
    select: { id: true, name: true, email: true, role: true },
  });
}

function createUser(data) {
  return prisma.user.create({
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

function updateUser(id, data) {
  return prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      department: true,
      active: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

function softDeleteUser(id) {
  return prisma.user.update({
    where: { id },
    data: { active: false },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      active: true,
    },
  });
}

module.exports = {
  listUsers,
  listTechnicians,
  findById,
  findByEmail,
  createUser,
  updateUser,
  softDeleteUser,
};
