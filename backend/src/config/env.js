require("dotenv").config();

const required = ["DATABASE_URL", "JWT_SECRET", "REFRESH_TOKEN_SECRET"];

for (const key of required) {
  if (!process.env[key]) {
    console.warn(`[env] Aviso: ${key} não definido — copie .env.example para .env`);
  }
}

module.exports = {
  port: Number(process.env.PORT) || 3333,
  nodeEnv: process.env.NODE_ENV || "development",
  databaseUrl: process.env.DATABASE_URL,
  jwtSecret: process.env.JWT_SECRET || "minhsadpaskdkoqsdlsabolevetrtiroretrere",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "8h",
  refreshSecret: process.env.REFRESH_TOKEN_SECRET || "minhsadpaskdkoqsdlsabodsfsdfsl21fsdff3fdssdrtiroretrere",
  refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d",
  frontendOrigin: process.env.FRONTEND_ORIGIN || "http://localhost:5173",
  ticketViewMode: (process.env.TICKET_VIEW_MODE || "all").toLowerCase(),
  allowSelfRegister: String(process.env.ALLOW_SELF_REGISTER).toLowerCase() === "true",
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || 587,
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    from: process.env.SMTP_FROM || "TicketDesk <noreply@localhost>",
  },
};
