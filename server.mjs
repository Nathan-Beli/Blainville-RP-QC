import { spawn } from "node:child_process";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { existsSync, readFileSync } from "node:fs";
import { dirname, extname, join, normalize, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

const dashboardEnvPath = join(__dirname, ".env");
const botDir = resolve(__dirname, "..", "discord-bot");

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  return Object.fromEntries(
    readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l && !l.startsWith("#") && l.includes("="))
      .map((line) => {
        const i = line.indexOf("=");
        return [
          line.slice(0, i).trim(),
          line.slice(i + 1).trim().replace(/^["']|["']$/g, ""),
        ];
      })
  );
}

const dashboardEnv = loadEnvFile(dashboardEnvPath);
Object.assign(process.env, dashboardEnv);

const host = process.env.DASHBOARD_HOST || "0.0.0.0";
const port = Number(process.env.PORT || process.env.DASHBOARD_PORT || 4173);

const botApiUrl =
  process.env.DASHBOARD_BOT_API_URL ||
  process.env.DASHBOARD_API_URL ||
  "http://127.0.0.1:4174";

const publicApiUrl = process.env.DASHBOARD_PUBLIC_API_URL || "";

let botProcess = null;

/* ---------------- BOT START ---------------- */

function startBot() {
  if (process.env.DASHBOARD_START_BOT === "false") return;
  if (!process.env.DISCORD_TOKEN) {
    console.warn("❌ DISCORD_TOKEN manquant → bot non démarré");
    return;
  }

  // ✅ FIX IMPORTANT: ne PAS utiliser process.execPath
  botProcess = spawn("node", ["src/index.js"], {
    cwd: botDir,
    env: { ...process.env, ...dashboardEnv },
    stdio: "inherit",
    windowsHide: true,
  });

  botProcess.on("error", (err) => {
    console.error("❌ Bot spawn error:", err);
  });

  botProcess.on("exit", (code) => {
    console.log(`🤖 Bot arrêté (code ${code})`);
  });
}

/* ---------------- UTILS ---------------- */

function sendJson(res, code, data) {
  res.writeHead(code, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  res.end(JSON.stringify(data));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

/* ---------------- PROXY API BOT ---------------- */

async function proxyBotApi(req, res, url) {
  try {
    const target = new URL(url.pathname + url.search, botApiUrl);

    const body =
      req.method === "GET" || req.method === "HEAD"
        ? undefined
        : await readBody(req);

    const botRes = await fetch(target, {
      method: req.method,
      headers: {
        "Content-Type": req.headers["content-type"] || "application/json",
      },
      body,
    });

    res.writeHead(botRes.status, {
      "Content-Type":
        botRes.headers.get("content-type") ||
        "application/json; charset=utf-8",
      "Cache-Control": "no-store",
    });

    res.end(Buffer.from(await botRes.arrayBuffer()));
  } catch (err) {
    console.error("❌ Proxy error:", err.message);
    sendJson(res, 502, {
      ok: false,
      error: "Bot API unreachable",
    });
  }
}

/* ---------------- SERVER ---------------- */

const server = createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${host}:${port}`);

    /* API CONFIG */
    if (url.pathname === "/api/dashboard/config") {
      return sendJson(res, 200, {
        clientId: process.env.CLIENT_ID || "",
        guildId: process.env.GUILD_ID || "",
        apiBaseUrl: publicApiUrl,
      });
    }

    /* PROXY BOT API */
    if (url.pathname.startsWith("/api/dashboard/")) {
      return proxyBotApi(req, res, url);
    }

    /* STATIC FILES */
    const path = url.pathname === "/" ? "/index.html" : url.pathname;
    const safePath = normalize(path).replace(/^(\.\.[/\\])+/, "");
    const filePath = join(__dirname, safePath);

    if (!filePath.startsWith(__dirname)) {
      res.writeHead(403);
      return res.end("Forbidden");
    }

    const file = await readFile(filePath);

    res.writeHead(200, {
      "Content-Type":
        mimeTypes[extname(filePath).toLowerCase()] ||
        "application/octet-stream",
      "Cache-Control": "no-store",
    });

    res.end(file);
  } catch (err) {
    res.writeHead(404);
    res.end("Not found");
  }
});

/* ---------------- START ---------------- */

startBot();

server.listen(port, host, () => {
  console.log(`🚀 Dashboard: http://${host}:${port}`);
});

/* ---------------- SHUTDOWN ---------------- */

process.on("SIGINT", () => {
  console.log("🛑 Shutdown...");
  if (botProcess) botProcess.kill();
  process.exit();
});

process.on("SIGTERM", () => {
  if (botProcess) botProcess.kill();
  process.exit();
});