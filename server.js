const fs = require("node:fs");
const path = require("node:path");
const http = require("node:http");
const { buildAuthCookie, buildLogoutCookie, getPassword, isAuthenticated } = require("./src/auth");
const { addReaction, buildPhotoPayload, buildRankings, ensureDataFile } = require("./src/reaction-store");
const { renderGalleryPage, renderLoginPage } = require("./src/templates");

const PORT = Number(process.env.PORT || 3200);
const PUBLIC_DIR = path.join(__dirname, "public");

ensureDataFile();

function sendHtml(res, statusCode, html, headers = {}) {
  res.writeHead(statusCode, {
    "Content-Type": "text/html; charset=utf-8",
    ...headers
  });
  res.end(html);
}

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8"
  });
  res.end(JSON.stringify(payload));
}

function redirect(res, location, headers = {}) {
  res.writeHead(302, {
    Location: location,
    ...headers
  });
  res.end();
}

function parseBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
      if (raw.length > 1e6) {
        reject(new Error("Payload too large"));
        req.destroy();
      }
    });
    req.on("end", () => resolve(raw));
    req.on("error", reject);
  });
}

function parseFormEncoded(raw) {
  const params = new URLSearchParams(raw);
  return Object.fromEntries(params.entries());
}

function getPhotoPayload() {
  return {
    photos: buildPhotoPayload(),
    rankings: buildRankings()
  };
}

function serveStatic(req, res, pathname) {
  const safePath = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!safePath.startsWith(PUBLIC_DIR) || !fs.existsSync(safePath) || fs.statSync(safePath).isDirectory()) {
    sendHtml(res, 404, renderLoginPage("요청한 리소스를 찾을 수 없습니다."));
    return;
  }

  const contentType = safePath.endsWith(".css")
    ? "text/css; charset=utf-8"
    : safePath.endsWith(".svg")
      ? "image/svg+xml"
      : "application/octet-stream";

  res.writeHead(200, { "Content-Type": contentType });
  fs.createReadStream(safePath).pipe(res);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = url.pathname;
  const authed = isAuthenticated(req);
  const gatedPath = pathname !== "/" && pathname !== "/login" && !pathname.startsWith("/styles.css") && !pathname.startsWith("/assets/");

  if (!authed && gatedPath) {
    redirect(res, "/");
    return;
  }

  if (req.method === "GET" && pathname === "/") {
    if (authed) {
      redirect(res, "/gallery");
      return;
    }
    sendHtml(res, 200, renderLoginPage());
    return;
  }

  if (req.method === "POST" && pathname === "/login") {
    const raw = await parseBody(req);
    const form = parseFormEncoded(raw);
    if (form.password === getPassword()) {
      redirect(res, "/gallery", {
        "Set-Cookie": buildAuthCookie()
      });
      return;
    }
    sendHtml(res, 401, renderLoginPage("비밀번호가 올바르지 않습니다."));
    return;
  }

  if (req.method === "POST" && pathname === "/logout") {
    redirect(res, "/", {
      "Set-Cookie": buildLogoutCookie()
    });
    return;
  }

  if (req.method === "GET" && pathname === "/gallery") {
    sendHtml(res, 200, renderGalleryPage(getPhotoPayload()));
    return;
  }

  if (req.method === "GET" && pathname === "/api/photos") {
    sendJson(res, 200, getPhotoPayload());
    return;
  }

  if (req.method === "POST" && pathname === "/api/reactions") {
    try {
      const raw = await parseBody(req);
      const payload = JSON.parse(raw || "{}");
      addReaction(payload.photoId, payload.reactionId);
      sendJson(res, 200, getPhotoPayload());
    } catch (error) {
      sendJson(res, 400, { error: error.message });
    }
    return;
  }

  if (req.method === "GET" && (pathname === "/styles.css" || pathname.startsWith("/assets/"))) {
    const relativePath = pathname === "/styles.css" ? "styles.css" : pathname.slice(1);
    serveStatic(req, res, relativePath);
    return;
  }

  sendHtml(res, 404, authed ? renderGalleryPage(getPhotoPayload()) : renderLoginPage("요청한 페이지를 찾을 수 없습니다."));
});

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`Cute gallery running on http://localhost:${PORT}`);
  });
}

module.exports = {
  server
};
