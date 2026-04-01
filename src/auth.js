const crypto = require("node:crypto");

const COOKIE_NAME = "ideabank_auth";

function getPassword() {
  return process.env.ACCESS_PASSWORD || "ideabank2026";
}

function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function parseCookies(cookieHeader = "") {
  return cookieHeader
    .split(";")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .reduce((acc, entry) => {
      const [key, ...valueParts] = entry.split("=");
      acc[key] = decodeURIComponent(valueParts.join("="));
      return acc;
    }, {});
}

function isAuthenticated(req) {
  const cookies = parseCookies(req.headers.cookie);
  return cookies[COOKIE_NAME] === hashPassword(getPassword());
}

function buildAuthCookie() {
  return `${COOKIE_NAME}=${hashPassword(getPassword())}; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800`;
}

function buildLogoutCookie() {
  return `${COOKIE_NAME}=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`;
}

module.exports = {
  COOKIE_NAME,
  buildAuthCookie,
  buildLogoutCookie,
  getPassword,
  hashPassword,
  isAuthenticated,
  parseCookies
};
