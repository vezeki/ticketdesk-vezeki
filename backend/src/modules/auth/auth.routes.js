const express = require("express");
const { auth } = require("../../middlewares/auth.middleware");
const ctrl = require("./auth.controller");
const env = require("../../config/env");

const router = express.Router();

router.post("/login", ctrl.loginValidation, ctrl.login);
router.post("/logout", auth, ctrl.logout);
router.post("/refresh", ctrl.refresh);
router.post("/forgot-password", ctrl.forgotValidation, ctrl.forgotPassword);
router.post("/reset-password", ctrl.resetValidation, ctrl.resetPassword);

if (env.allowSelfRegister) {
  router.post("/register", ctrl.registerValidation, ctrl.register);
}

module.exports = router;
