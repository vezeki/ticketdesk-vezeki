const { AppError } = require("./error.middleware");

function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError("Não autenticado", 401));
    }
    if (!roles.length || roles.includes(req.user.role)) {
      return next();
    }
    next(new AppError("Sem permissão", 403));
  };
}

module.exports = { authorize };
