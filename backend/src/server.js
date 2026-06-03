const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const routes = require("./routes");
const { errorHandler } = require("./middlewares/error.middleware");
const env = require("./config/env");

const app = express();

app.use(
  cors({
    origin: env.frontendOrigin,
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api", routes);

app.use(errorHandler);

app.listen(env.port, () => {
  console.log(`API: http://localhost:${env.port}/api  |  Site (frontend): ${env.frontendOrigin}`);
});
