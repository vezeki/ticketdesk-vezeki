const userRepo = require("./user.repository");
const { TECHNICIAN_KEYS, LABELS } = require("../../constants/technicians");
const { hashPassword } = require("../../utils/hash");
const { AppError } = require("../../middlewares/error.middleware");
const { parsePagination, meta } = require("../../utils/pagination");

async function list(query) {
  const { page, limit, skip } = parsePagination(query);
  const search = query.search ? String(query.search) : undefined;
  const [items, total] = await userRepo.listUsers({ skip, take: limit, search });
  return { data: items, meta: meta(total, page, limit) };
}

async function getById(id) {
  const user = await userRepo.findById(id);
  if (!user) {
    throw new AppError("Usuário não encontrado", 404);
  }
  return user;
}

async function create(payload, actorRole) {
  const existing = await userRepo.findByEmail(payload.email);
  if (existing) {
    throw new AppError("E-mail já cadastrado", 409);
  }
  if (payload.role === "ADMIN" && actorRole !== "ADMIN") {
    throw new AppError("Sem permissão para criar ADMIN", 403);
  }
  if ((payload.role === "TECNICO" || payload.role === "ADMIN") && actorRole !== "ADMIN") {
    throw new AppError("Sem permissão para este papel", 403);
  }
  const password = await hashPassword(payload.password);
  return userRepo.createUser({
    name: payload.name,
    email: payload.email,
    password,
    role: payload.role || "USUARIO",
    department: payload.department?.trim() || null,
  });
}

async function update(id, payload, actorRole) {
  await getById(id);
  if (payload.email) {
    const other = await userRepo.findByEmail(payload.email);
    if (other && other.id !== id) {
      throw new AppError("E-mail já cadastrado", 409);
    }
  }
  if (payload.role === "ADMIN" && actorRole !== "ADMIN") {
    throw new AppError("Sem permissão", 403);
  }
  const data = { ...payload };
  if (data.password) {
    data.password = await hashPassword(data.password);
  }
  delete data.id;
  return userRepo.updateUser(id, data);
}

async function deactivate(id) {
  await getById(id);
  return userRepo.softDeleteUser(id);
}

async function me(userId) {
  return getById(userId);
}

async function updateMe(userId, payload) {
  const allowed = {};
  if (payload.name != null) allowed.name = payload.name;
  if (payload.department !== undefined) allowed.department = payload.department;
  if (payload.password) {
    allowed.password = await hashPassword(payload.password);
  }
  return userRepo.updateUser(userId, allowed);
}

async function listTechnicians() {
  return TECHNICIAN_KEYS.map((key) => ({
    id: key,
    key,
    name: LABELS[key],
  }));
}

module.exports = {
  list,
  getById,
  create,
  update,
  deactivate,
  me,
  updateMe,
  listTechnicians,
};
