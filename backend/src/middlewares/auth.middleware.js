const { verifyAccessToken } = require("../utils/jwt");
const { AppError } = require("./error.middleware");
const prisma = require("../lib/prisma");

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      throw new AppError("Não autenticado", 401);
    }
    const token = header.slice(7);
    const decoded = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.sub },
      select: { id: true, email: true, name: true, role: true, department: true, active: true },
    });
    if (!user || !user.active) {
      throw new AppError("Não autenticado", 401);
    }
    req.user = user;
    next();
  } catch (e) {
    if (e.name === "JsonWebTokenError" || e.name === "TokenExpiredError") {
      return next(new AppError("Token inválido ou expirado", 401));
    }
    next(e);
  }
}

module.exports = { auth };
