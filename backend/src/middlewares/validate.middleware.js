const { validationResult } = require("express-validator");
const { AppError } = require("./error.middleware");

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const msg = errors.array().map((e) => e.msg).join("; ");
    return next(new AppError(msg || "Dados inválidos", 422));
  }
  next();
}

module.exports = { validate };
