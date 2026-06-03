const express = require("express");
const { auth } = require("../../middlewares/auth.middleware");
const { authorize } = require("../../middlewares/role.middleware");
const ctrl = require("./ticket.controller");
const val = require("./ticket.validation");
const { ticketFilesUpload } = require("../../middlewares/upload.middleware");

const router = express.Router();

router.use(auth);

router.get("/", val.listValidation, ctrl.list);
router.post(
  "/",
  authorize("ADMIN", "TECNICO", "USUARIO"),
  (req, res, next) => {
    ticketFilesUpload(req, res, next);
  },
  val.createTicketValidation,
  ctrl.create
);

router.get(
  "/:id/attachments/:attachmentId/download",
  val.attachmentParam,
  ctrl.downloadAttachment
);

router.post("/:id/finalize", authorize("ADMIN", "TECNICO"), val.finalizeValidation, ctrl.finalize);

router.get("/:id", val.idParam, ctrl.getById);
router.put("/:id", authorize("ADMIN", "TECNICO"), val.updateTicketValidation, ctrl.update);
router.put("/:id/assign", authorize("ADMIN"), val.assignValidation, ctrl.assign);
router.get("/:id/comments", val.idParam, ctrl.listComments);
router.post("/:id/comments", val.commentValidation, ctrl.addComment);

module.exports = router;
