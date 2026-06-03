const { v4: uuidv4 } = require("uuid");
const prisma = require("../../lib/prisma");
const { comparePassword, hashPassword } = require("../../utils/hash");
const { signAccessToken, signRefreshToken, verifyRefreshToken } = require("../../utils/jwt");
const { AppError } = require("../../middlewares/error.middleware");
const { sendMail } = require("../../utils/mailer");
const env = require("../../config/env");

function createRefreshToken(userId) {
  return signRefreshToken({ sub: userId, typ: "refresh" });
}

async function login(email, password) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    throw new AppError("Credenciais inválidas", 401);
  }
  const ok = await comparePassword(password, user.password);
  if (!ok) {
    throw new AppError("Credenciais inválidas", 401);
  }
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const safe = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    department: user.department,
  };
  return { accessToken, user: safe };
}

async function refresh(refreshToken) {
  if (!refreshToken) {
    throw new AppError("Refresh token ausente", 401);
  }
  let decoded;
  try {
    decoded = verifyRefreshToken(refreshToken);
  } catch {
    throw new AppError("Refresh token inválido", 401);
  }
  if (decoded.typ !== "refresh") {
    throw new AppError("Refresh token inválido", 401);
  }
  const user = await prisma.user.findUnique({
    where: { id: decoded.sub },
    select: { id: true, role: true, active: true },
  });
  if (!user || !user.active) {
    throw new AppError("Não autenticado", 401);
  }
  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  return { accessToken };
}

async function forgotPassword(email) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) {
    return;
  }
  const token = uuidv4().replace(/-/g, "") + uuidv4().replace(/-/g, "");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);
  await prisma.passwordReset.create({
    data: { userId: user.id, token, expiresAt },
  });
  const link = `${env.frontendOrigin}/reset-password?token=${token}`;
  await sendMail({
    to: user.email,
    subject: "Recuperação de senha — TicketDesk",
    text: `Use este link (válido por 1h): ${link}`,
    html: `<p>Use este link (válido por 1h):</p><p><a href="${link}">${link}</a></p>`,
  });
}

async function resetPassword(token, newPassword) {
  const row = await prisma.passwordReset.findUnique({ where: { token } });
  if (!row || row.usedAt || row.expiresAt < new Date()) {
    throw new AppError("Token inválido ou expirado", 400);
  }
  const hash = await hashPassword(newPassword);
  await prisma.$transaction([
    prisma.user.update({ where: { id: row.userId }, data: { password: hash } }),
    prisma.passwordReset.update({ where: { id: row.id }, data: { usedAt: new Date() } }),
  ]);
}

async function selfRegister(body) {
  if (!env.allowSelfRegister) {
    throw new AppError("Auto-cadastro desabilitado", 403);
  }
  const exists = await prisma.user.findUnique({ where: { email: body.email } });
  if (exists) {
    throw new AppError("E-mail já cadastrado", 409);
  }
  const password = await hashPassword(body.password);
  const user = await prisma.user.create({
    data: {
      name: body.name,
      email: body.email,
      password,
      role: "USUARIO",
      department: body.department || null,
    },
    select: { id: true, name: true, email: true, role: true, department: true },
  });
  return user;
}

module.exports = {
  login,
  refresh,
  forgotPassword,
  resetPassword,
  selfRegister,
  createRefreshToken,
};
