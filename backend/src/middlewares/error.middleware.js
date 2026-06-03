const { MulterError } = require("multer");
const env = require("../config/env");

class AppError extends Error {
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
  }
}

function errorHandler(err, req, res, next) {
  if (err instanceof MulterError) {
    return res.status(400).json({ error: err.message || "Erro no upload" });
  }
  const status = err.statusCode || 500;
  const body = {
    error: err.message || "Erro interno",
  };
  if (env.nodeEnv === "development" && err.stack) {
    body.stack = err.stack;
  }
  if (status === 500) {
    console.error(err);
  }
  res.status(status).json(body);
}

module.exports = { AppError, errorHandler };
