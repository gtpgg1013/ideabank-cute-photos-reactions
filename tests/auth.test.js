const test = require("node:test");
const assert = require("node:assert/strict");
const { buildAuthCookie, hashPassword, isAuthenticated, parseCookies } = require("../src/auth");

test("parseCookies reads cookie pairs", () => {
  const cookies = parseCookies("foo=bar; answer=42");
  assert.equal(cookies.foo, "bar");
  assert.equal(cookies.answer, "42");
});

test("auth cookie matches environment password", () => {
  process.env.ACCESS_PASSWORD = "secret-pass";
  const cookie = buildAuthCookie();
  assert.match(cookie, new RegExp(hashPassword("secret-pass")));
});

test("isAuthenticated validates hashed auth cookie", () => {
  process.env.ACCESS_PASSWORD = "secret-pass";
  const req = {
    headers: {
      cookie: `ideabank_auth=${hashPassword("secret-pass")}`
    }
  };
  assert.equal(isAuthenticated(req), true);
});
