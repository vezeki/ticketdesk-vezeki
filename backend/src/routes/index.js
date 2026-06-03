const express = require("express");
const { auth } = require("../middlewares/auth.middleware");
const authRoutes = require("../modules/auth/auth.routes");
const userRoutes = require("../modules/users/user.routes");
const ticketRoutes = require("../modules/tickets/ticket.routes");
const userController = require("../modules/users/user.controller");

const router = express.Router();

router.get("/", (req, res) => {
  res.json({
    name: "TicketDesk API",
    hint: "Não existe página aqui — use o frontend (ex.: http://localhost:5173) ou endpoints como GET /api/health",
    health: "/api/health",
  });
});

router.get("/technicians", auth, userController.listTechnicians);

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/tickets", ticketRoutes);

router.get("/health", (req, res) => {
  res.json({ ok: true });
});

module.exports = router;
