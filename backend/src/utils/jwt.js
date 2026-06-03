const jwt = require("jsonwebtoken");
const env = require("../config/env");

function signAccessToken(payload) {
  return jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
}

function signRefreshToken(payload) {
  return jwt.sign(payload, env.refreshSecret, { expiresIn: env.refreshExpiresIn });
}

function verifyAccessToken(token) {
  return jwt.verify(token, env.jwtSecret);
}

function verifyRefreshToken(token) {
  return jwt.verify(token, env.refreshSecret);
}

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
