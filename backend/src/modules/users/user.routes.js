const express = require("express");
const { auth } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");
const ctrl = require("./user.controller");
const val = require("./user.validation");

const router = express.Router();

router.get("/me", auth, ctrl.me);
router.put("/me", auth, val.updateMeValidation, ctrl.updateMe);

router.get("/technicians", auth, ctrl.listTechnicians);

router.get("/", auth, authorize("ADMIN"), ctrl.list);
router.post("/", auth, authorize("ADMIN"), val.createUserValidation, ctrl.create);
router.put("/:id", auth, authorize("ADMIN"), val.updateUserValidation, ctrl.update);
router.delete("/:id", auth, authorize("ADMIN"), ctrl.remove);

module.exports = router;
