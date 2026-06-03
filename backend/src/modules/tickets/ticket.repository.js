const prisma = require("../../lib/prisma");

const ticketSelect = {
  id: true,
  title: true,
  description: true,
  status: true,
  priority: true,
  slaLevel: true,
  category: true,
  requesterId: true,
  requesterEmail: true,
  managerName: true,
  managerEmail: true,
  establishment: true,
  occurrenceType: true,
  technicianKey: true,
  assignedToId: true,
  resolvedAt: true,
  resolutionNote: true,
  createdAt: true,
  updatedAt: true,
  requester: { select: { id: true, name: true, email: true, department: true } },
  assignedTo: { select: { id: true, name: true, email: true } },
  attachments: { select: { id: true, originalName: true, mimeType: true, size: true, createdAt: true } },
};

function findMany(where, { skip, take, orderBy = { updatedAt: "desc" } }) {
  return Promise.all([
    prisma.ticket.findMany({ where, skip, take, orderBy, select: ticketSelect }),
    prisma.ticket.count({ where }),
  ]);
}

function findById(id) {
  return prisma.ticket.findUnique({
    where: { id },
    select: {
      ...ticketSelect,
      history: { orderBy: { changedAt: "desc" }, take: 100 },
    },
  });
}

function create(data) {
  return prisma.ticket.create({
    data,
    select: ticketSelect,
  });
}

async function updateTicket(id, data, historyEntries = []) {
  return prisma.$transaction(async (tx) => {
    const ticket = await tx.ticket.update({
      where: { id },
      data,
      select: ticketSelect,
    });
    if (historyEntries.length) {
      await tx.ticketHistory.createMany({
        data: historyEntries.map((h) => ({
          ticketId: id,
          field: h.field,
          oldValue: h.oldValue != null ? String(h.oldValue) : null,
          newValue: String(h.newValue),
        })),
      });
    }
    return ticket;
  });
}

function addComment(data) {
  return prisma.comment.create({
    data,
    select: {
      id: true,
      message: true,
      isInternal: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });
}

function listComments(ticketId) {
  return prisma.comment.findMany({
    where: { ticketId },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      message: true,
      isInternal: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true, role: true } },
    },
  });
}

function findAttachment(ticketId, attachmentId) {
  return prisma.ticketAttachment.findFirst({
    where: { id: attachmentId, ticketId },
  });
}

module.exports = {
  findMany,
  findById,
  create,
  updateTicket,
  addComment,
  listComments,
  findAttachment,
};
