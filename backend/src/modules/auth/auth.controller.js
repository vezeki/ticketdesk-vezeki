const { body } = require("express-validator");
const { validate } = require("../../middlewares/validate.middleware");
const authService = require("./auth.service");

const loginValidation = [
  body("email").isEmail().normalizeEmail(),
  body("password").isString().notEmpty(),
  validate,
];

const forgotValidation = [
  body("email").isEmail().normalizeEmail(),
  validate,
];

const resetValidation = [
  body("token").isString().notEmpty(),
  body("password").isLength({ min: 8 }),
  validate,
];

const registerValidation = [
  body("name").trim().isLength({ min: 2 }),
  body("email").isEmail().normalizeEmail(),
  body("password").isLength({ min: 8 }),
  body("department").optional().trim(),
  validate,
];

async function login(req, res, next) {
  try {
    const { accessToken, user } = await authService.login(req.body.email, req.body.password);
    const refreshToken = authService.createRefreshToken(user.id);
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: "/",
    });
    res.json({ user, accessToken });
  } catch (e) {
    next(e);
  }
}

async function logout(req, res, next) {
  try {
    res.clearCookie("refreshToken", { path: "/" });
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}

async function refresh(req, res, next) {
  try {
    const token = req.cookies?.refreshToken;
    const { accessToken } = await authService.refresh(token);
    res.json({ accessToken });
  } catch (e) {
    next(e);
  }
}

async function forgotPassword(req, res, next) {
  try {
    await authService.forgotPassword(req.body.email);
    res.json({ message: "Se o e-mail existir, você receberá instruções." });
  } catch (e) {
    next(e);
  }
}

async function resetPassword(req, res, next) {
  try {
    await authService.resetPassword(req.body.token, req.body.password);
    res.json({ message: "Senha alterada com sucesso." });
  } catch (e) {
    next(e);
  }
}

async function register(req, res, next) {
  try {
    const user = await authService.selfRegister(req.body);
    res.status(201).json({ user });
  } catch (e) {
    next(e);
  }
}

module.exports = {
  login,
  logout,
  refresh,
  forgotPassword,
  resetPassword,
  register,
  loginValidation,
  forgotValidation,
  resetValidation,
  registerValidation,
};
