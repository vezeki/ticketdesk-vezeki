const fs = require("fs/promises");
const path = require("path");
const { randomUUID } = require("crypto");
const ticketRepo = require("./ticket.repository");
const prisma = require("../../lib/prisma");
const { AppError } = require("../../middlewares/error.middleware");
const { parsePagination, meta } = require("../../utils/pagination");
const env = require("../../config/env");
const { ticketUploadDir } = require("../../config/paths");

const OPEN_STATUSES = ["ABERTO", "EM_ANDAMENTO", "AGUARDANDO"];

function isOpenTicket(status) {
  return OPEN_STATUSES.includes(status);
}

function sameDepartment(userDept, requesterDept) {
  if (!userDept || !requesterDept) return false;
  return String(userDept).trim().toLowerCase() === String(requesterDept).trim().toLowerCase();
}

function canAccessTicket(user, ticket) {
  if (user.role === "ADMIN" || user.role === "TECNICO") {
    if (user.role === "TECNICO" && env.ticketViewMode === "assigned") {
      return ticket.assignedToId === user.id || ticket.requesterId === user.id;
    }
    return true;
  }
  if (ticket.requesterId === user.id) return true;
  if (isOpenTicket(ticket.status) && sameDepartment(user.department, ticket.requester?.department)) {
    return true;
  }
  return false;
}

function assertTicketAccess(user, ticket) {
  if (!ticket) {
    throw new AppError("Chamado não encontrado", 404);
  }
  if (!canAccessTicket(user, ticket)) {
    throw new AppError("Sem permissão", 403);
  }
}

function normalizeUuid(v) {
  if (v === null || v === undefined || v === "") return null;
  return String(v);
}

async function assertAssignableUser(assignedToId) {
  if (!assignedToId) return;
  const assignee = await prisma.user.findUnique({
    where: { id: assignedToId },
    select: { id: true, active: true, role: true },
  });
  if (!assignee || !assignee.active) {
    throw new AppError("Técnico não encontrado", 404);
  }
  if (assignee.role !== "TECNICO" && assignee.role !== "ADMIN") {
    throw new AppError("Selecione um técnico ou administrador da TI", 422);
  }
}

function buildWhereForList(user, query) {
  const status = query.status || undefined;
  const priority = query.priority || undefined;
  const slaLevel = query.slaLevel || undefined;
  const category = query.category || undefined;
  const technicianKey = query.technicianKey || undefined;
  const assignedToId = normalizeUuid(query.assignedToId);
  const q = query.q ? String(query.q).trim() : "";

  const filters = [];
  if (status) filters.push({ status });
  if (priority) filters.push({ priority });
  if (slaLevel) filters.push({ slaLevel });
  if (category) filters.push({ category });
  if (technicianKey) filters.push({ technicianKey });
  if (assignedToId) filters.push({ assignedToId });

  if (q) {
    filters.push({
      OR: [{ title: { contains: q } }, { description: { contains: q } }, { requesterEmail: { contains: q } }],
    });
  }

  let scope = {};
  if (user.role === "USUARIO") {
    const own = { requesterId: user.id };
    if (user.department) {
      scope = {
        OR: [
          own,
          {
            AND: [
              { status: { in: OPEN_STATUSES } },
              { requester: { department: user.department } },
            ],
          },
        ],
      };
    } else {
      scope = own;
    }
  } else if (user.role === "TECNICO" && env.ticketViewMode === "assigned") {
    scope = { OR: [{ assignedToId: user.id }, { requesterId: user.id }] };
  }

  if (!filters.length) {
    return scope;
  }
  return { AND: [scope, ...filters] };
}

function sanitizeTicketForUser(user, ticket) {
  if (!ticket || user.role !== "USUARIO") return ticket;
  const { slaLevel, ...rest } = ticket;
  return rest;
}

function sanitizeTicketsForUser(user, tickets) {
  return tickets.map((t) => sanitizeTicketForUser(user, t));
}

async function list(user, query) {
  const { page, limit, skip } = parsePagination(query);
  const where = buildWhereForList(user, query);
  const [items, total] = await ticketRepo.findMany(where, { skip, take: limit });
  return { data: sanitizeTicketsForUser(user, items), meta: meta(total, page, limit) };
}

async function getById(user, id) {
  const ticket = await ticketRepo.findById(id);
  assertTicketAccess(user, ticket);
  return sanitizeTicketForUser(user, ticket);
}

async function persistAttachments(ticketId, files) {
  if (!files?.length) return;
  const dir = ticketUploadDir(ticketId);
  await fs.mkdir(dir, { recursive: true });
  for (const file of files) {
    const ext = path.extname(file.originalname || "").slice(0, 12) || "";
    const stored = `${randomUUID()}${ext}`;
    const full = path.join(dir, stored);
    await fs.writeFile(full, file.buffer);
    await prisma.ticketAttachment.create({
      data: {
        ticketId,
        fileName: stored,
        originalName: (file.originalname || "arquivo").slice(0, 240),
        mimeType: file.mimetype || "application/octet-stream",
        size: file.size || 0,
      },
    });
  }
}

async function create(user, body, files = []) {
  const category = body.category && String(body.category).trim() ? body.category : "Outros";

  const ticket = await ticketRepo.create({
    title: body.title,
    description: body.description,
    priority: "MEDIA",
    slaLevel: "ATE_48H",
    category,
    requesterId: user.id,
    requesterEmail: body.requesterEmail,
    managerName: body.managerName,
    managerEmail: body.managerEmail,
    establishment: body.establishment,
    occurrenceType: body.occurrenceType,
    technicianKey: body.technicianKey,
    assignedToId: null,
    status: "EM_ANDAMENTO",
  });

  try {
    await persistAttachments(ticket.id, files);
  } catch (e) {
    console.error(e);
    throw new AppError("Chamado criado, mas falhou ao salvar anexos. Edite o chamado e tente anexar novamente.", 500);
  }

  return ticketRepo.findById(ticket.id);
}

function diffHistory(before, after, fields) {
  const entries = [];
  for (const f of fields) {
    if (before[f] !== after[f]) {
      entries.push({ field: f, oldValue: before[f], newValue: after[f] });
    }
  }
  return entries;
}

function isClosingStatus(s) {
  return s === "RESOLVIDO" || s === "CANCELADO";
}

function snapshot(t) {
  return {
    title: t.title,
    description: t.description,
    priority: t.priority,
    slaLevel: t.slaLevel,
    category: t.category,
    status: t.status,
    assignedToId: t.assignedToId,
    resolutionNote: t.resolutionNote,
    technicianKey: t.technicianKey,
    requesterEmail: t.requesterEmail,
    managerName: t.managerName,
    managerEmail: t.managerEmail,
    establishment: t.establishment,
    occurrenceType: t.occurrenceType,
  };
}

async function update(user, id, body) {
  if (user.role !== "ADMIN" && user.role !== "TECNICO") {
    throw new AppError("Sem permissão", 403);
  }
  const existing = await ticketRepo.findById(id);
  assertTicketAccess(user, existing);

  if (user.role === "TECNICO" && body.status && isClosingStatus(body.status)) {
    throw new AppError("Para concluir o chamado use Finalizar com o comentário de encerramento.", 422);
  }

  const data = {};
  if (body.title != null) data.title = body.title;
  if (body.description != null) data.description = body.description;
  if (body.priority != null) data.priority = body.priority;
  if (body.category != null) data.category = body.category;
  if (body.slaLevel != null) data.slaLevel = body.slaLevel;
  if (body.technicianKey != null) data.technicianKey = body.technicianKey;
  if (body.status != null) {
    data.status = body.status;
  }

  const becomesClosed =
    body.status != null && isClosingStatus(body.status) && !isClosingStatus(existing.status);

  const reopens =
    body.status != null && !isClosingStatus(body.status) && isClosingStatus(existing.status);

  if (reopens) {
    data.resolvedAt = null;
    data.resolutionNote = null;
  }

  if (becomesClosed) {
    const note = body.resolutionNote != null ? String(body.resolutionNote).trim() : "";
    if (note.length < 5) {
      throw new AppError("Informe o comentário de finalização (mínimo 5 caracteres).", 422);
    }
    data.resolutionNote = note;
    data.resolvedAt = new Date();
  }

  const historyFields = [
    "title",
    "description",
    "priority",
    "slaLevel",
    "category",
    "status",
    "assignedToId",
    "resolutionNote",
    "technicianKey",
    "requesterEmail",
    "managerName",
    "managerEmail",
    "establishment",
    "occurrenceType",
  ];

  const before = snapshot(existing);
  const after = { ...before, ...data };
  const historyEntries = diffHistory(before, after, historyFields);

  const ticket = await ticketRepo.updateTicket(id, data, historyEntries);

  if (becomesClosed && data.resolutionNote) {
    await ticketRepo.addComment({
      ticketId: id,
      userId: user.id,
      message: `Finalização (${existing.status} → ${body.status}): ${data.resolutionNote}`,
      isInternal: false,
    });
  }

  return ticket;
}

async function finalize(user, id, resolutionNote) {
  if (user.role !== "ADMIN" && user.role !== "TECNICO") {
    throw new AppError("Sem permissão", 403);
  }
  const existing = await ticketRepo.findById(id);
  assertTicketAccess(user, existing);
  if (existing.status === "RESOLVIDO") {
    throw new AppError("Chamado já está finalizado.", 422);
  }

  const note = String(resolutionNote || "").trim();
  if (note.length < 5) {
    throw new AppError("Comentário de finalização obrigatório (mínimo 5 caracteres).", 422);
  }

  const data = {
    status: "RESOLVIDO",
    resolutionNote: note,
    resolvedAt: new Date(),
  };

  const before = snapshot(existing);
  const after = { ...before, ...data };
  const historyFields = [
    "title",
    "description",
    "priority",
    "slaLevel",
    "category",
    "status",
    "assignedToId",
    "resolutionNote",
    "technicianKey",
    "requesterEmail",
    "managerName",
    "managerEmail",
    "establishment",
    "occurrenceType",
  ];
  const historyEntries = diffHistory(before, after, historyFields);

  const ticket = await ticketRepo.updateTicket(id, data, historyEntries);
  await ticketRepo.addComment({
    ticketId: id,
    userId: user.id,
    message: `Finalização (${existing.status} → RESOLVIDO): ${note}`,
    isInternal: false,
  });
  return ticket;
}

async function assign(user, id, assignedToId) {
  if (user.role !== "ADMIN") {
    throw new AppError("Somente ADMIN pode atribuir", 403);
  }
  const normalized = normalizeUuid(assignedToId);
  if (normalized) {
    await assertAssignableUser(normalized);
  }
  const existing = await ticketRepo.findById(id);
  if (!existing) {
    throw new AppError("Chamado não encontrado", 404);
  }
  const before = snapshot(existing);
  const data = { assignedToId: normalized };
  let newStatus = existing.status;
  if (normalized && existing.status === "ABERTO") {
    data.status = "EM_ANDAMENTO";
    newStatus = "EM_ANDAMENTO";
  }
  const after = { ...before, ...data, status: newStatus };
  const historyEntries = diffHistory(before, after, ["assignedToId", "status"]);
  return ticketRepo.updateTicket(id, data, historyEntries);
}

async function addComment(user, ticketId, { message, isInternal }) {
  const ticket = await ticketRepo.findById(ticketId);
  assertTicketAccess(user, ticket);

  let internal = Boolean(isInternal);
  if (internal && user.role === "USUARIO") {
    throw new AppError("Usuário não pode criar comentário interno", 403);
  }
  if (!internal && user.role === "USUARIO" && ticket.requesterId !== user.id) {
    throw new AppError("Somente o solicitante pode comentar neste chamado", 403);
  }

  return ticketRepo.addComment({
    ticketId,
    userId: user.id,
    message,
    isInternal: internal,
  });
}

async function listComments(user, ticketId) {
  const ticket = await ticketRepo.findById(ticketId);
  assertTicketAccess(user, ticket);
  const rows = await ticketRepo.listComments(ticketId);
  if (user.role === "USUARIO") {
    return rows.filter((c) => !c.isInternal);
  }
  return rows;
}

async function getAttachmentForDownload(user, ticketId, attachmentId) {
  const ticket = await ticketRepo.findById(ticketId);
  assertTicketAccess(user, ticket);
  const att = await ticketRepo.findAttachment(ticketId, attachmentId);
  if (!att) {
    throw new AppError("Anexo não encontrado", 404);
  }
  const dir = ticketUploadDir(ticketId);
  const absolutePath = path.join(dir, att.fileName);
  return { absolutePath, downloadName: att.originalName };
}

module.exports = {
  list,
  getById,
  create,
  update,
  finalize,
  assign,
  addComment,
  listComments,
  getAttachmentForDownload,
};
