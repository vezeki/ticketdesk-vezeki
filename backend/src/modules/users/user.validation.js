const { body, param } = require("express-validator");
const { validate } = require("../../middlewares/validate.middleware");

const createUserValidation = [
  body("name").trim().isLength({ min: 2 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("role").optional().isIn(["ADMIN", "TECNICO", "USUARIO"]),
  body("department").trim().isLength({ min: 2, max: 80 }).withMessage("Departamento obrigatório"),
  validate,
];

const updateUserValidation = [
  param("id").isUUID(),
  body("name").optional().trim().isLength({ min: 2 }),
  body("email").optional().isEmail().normalizeEmail(),
  body("password").optional().isLength({ min: 8 }),
  body("role").optional().isIn(["ADMIN", "TECNICO", "USUARIO"]),
  body("department").optional().trim(),
  body("active").optional().isBoolean(),
  validate,
];

const updateMeValidation = [
  body("name").optional().trim().isLength({ min: 2 }),
  body("department").optional().trim().isLength({ min: 2, max: 80 }),
  body("password").optional().isLength({ min: 8 }),
  validate,
];

module.exports = {
  createUserValidation,
  updateUserValidation,
  updateMeValidation,
};
