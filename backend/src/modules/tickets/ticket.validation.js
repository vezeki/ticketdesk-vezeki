const { body, param, query } = require("express-validator");
const { validate } = require("../../middlewares/validate.middleware");
const { TECHNICIAN_KEYS } = require("../../constants/technicians");

const categories = ["Hardware", "Software", "Rede", "Acesso", "Outros"];
const slaLevels = ["ATE_120H", "ATE_72H", "ATE_48H", "ATE_24H", "ATE_8H", "ATE_4H"];
const establishments = ["Flamin", "Fladis"];

const listValidation = [
  query("page").optional({ values: "falsy" }).isInt({ min: 1 }),
  query("limit").optional({ values: "falsy" }).isInt({ min: 1, max: 500 }),
  query("status")
    .optional({ values: "falsy" })
    .isIn(["ABERTO", "EM_ANDAMENTO", "AGUARDANDO", "RESOLVIDO", "CANCELADO"]),
  query("priority").optional({ values: "falsy" }).isIn(["BAIXA", "MEDIA", "ALTA", "CRITICA"]),
  query("slaLevel").optional({ values: "falsy" }).isIn(slaLevels),
  query("category").optional({ values: "falsy" }).isIn(categories),
  query("technicianKey").optional({ values: "falsy" }).isIn(TECHNICIAN_KEYS),
  query("assignedToId").optional({ values: "falsy" }).isUUID(),
  query("q").optional({ values: "falsy" }).trim().isLength({ max: 120 }),
  validate,
];

const createTicketValidation = [
  body("requesterEmail").isEmail().normalizeEmail(),
  body("managerName").trim().isLength({ min: 2, max: 120 }),
  body("managerEmail").isEmail().normalizeEmail(),
  body("establishment").isIn(establishments),
  body("occurrenceType").trim().isLength({ min: 2, max: 120 }),
  body("technicianKey").isIn(TECHNICIAN_KEYS),
  body("title").trim().isLength({ min: 3, max: 200 }),
  body("description").trim().isLength({ min: 5 }),
  body("category").optional({ values: "falsy" }).isIn(categories),
  validate,
];

const finalizeValidation = [
  param("id").isUUID(),
  body("resolutionNote").trim().isLength({ min: 5, max: 8000 }),
  validate,
];

const updateTicketValidation = [
  param("id").isUUID(),
  body("title").optional().trim().isLength({ min: 3, max: 200 }),
  body("description").optional().trim().isLength({ min: 5 }),
  body("category").optional().isIn(categories),
  body("priority").optional().isIn(["BAIXA", "MEDIA", "ALTA", "CRITICA"]),
  body("slaLevel").optional().isIn(slaLevels),
  body("technicianKey").optional().isIn(TECHNICIAN_KEYS),
  body("status")
    .optional()
    .isIn(["ABERTO", "EM_ANDAMENTO", "AGUARDANDO", "RESOLVIDO", "CANCELADO"]),
  body("resolutionNote").optional().trim().isLength({ min: 5, max: 8000 }),
  validate,
];

const assignValidation = [
  param("id").isUUID(),
  body("assignedToId")
    .optional({ nullable: true })
    .custom((v) => v === null || v === undefined || /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(String(v))),
  validate,
];

const commentValidation = [
  param("id").isUUID(),
  body("message").trim().isLength({ min: 1 }),
  body("isInternal").optional().isBoolean(),
  validate,
];

const idParam = [param("id").isUUID(), validate];

const attachmentParam = [
  param("id").isUUID(),
  param("attachmentId").isUUID(),
  validate,
];

module.exports = {
  listValidation,
  createTicketValidation,
  finalizeValidation,
  updateTicketValidation,
  assignValidation,
  commentValidation,
  idParam,
  attachmentParam,
  slaLevels,
};
