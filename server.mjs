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
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return {};

  return Object.fromEntries(
    readFileSync(filePath, "utf8")
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#") && line.includes("="))
      .map((line) => {
        const index = line.indexOf("=");
        const key = line.slice(0, index).trim();
        const value = line.slice(index + 1).trim().replace(/^["']|["']$/g, "");
        return [key, value];
      })
  );
}

const dashboardEnv = loadEnvFile(dashboardEnvPath);
Object.assign(process.env, dashboardEnv);

const host = process.env.DASHBOARD_HOST || "0.0.0.0";
const port = Number(process.env.PORT || process.env.DASHBOARD_PORT || 4173);
const botApiUrl = process.env.DASHBOARD_BOT_API_URL || process.env.DASHBOARD_API_URL || "http://127.0.0.1:4174";
const publicApiUrl = process.env.DASHBOARD_PUBLIC_API_URL || "";

function startBot() {
  if (process.env.DASHBOARD_START_BOT === "false") return;
  if (!process.env.DISCORD_TOKEN) {
    console.warn("DISCORD_TOKEN absent du .env dashboard: le bot ne sera pas lance automatiquement.");
    return;
  }

  const child = spawn(process.execPath, ["src/index.js"], {
    cwd: botDir,
    env: {
      ...process.env,
      ...dashboardEnv,
    },
    stdio: "inherit",
    windowsHide: true,
  });

  child.on("exit", (code) => {
    console.log(`Bot Discord arrete avec le code ${code}.`);
  });
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(JSON.stringify(payload));
}

function readRequestBody(request) {
  return new Promise((resolve, reject) => {
    const chunks = [];

    request.on("data", (chunk) => chunks.push(chunk));
    request.on("end", () => resolve(Buffer.concat(chunks)));
    request.on("error", reject);
  });
}

async function proxyBotApi(request, response, requestUrl) {
  const targetUrl = new URL(requestUrl.pathname + requestUrl.search, botApiUrl);
  const body = request.method === "GET" || request.method === "HEAD" ? undefined : await readRequestBody(request);
  const botResponse = await fetch(targetUrl, {
    method: request.method,
    headers: {
      "Content-Type": request.headers["content-type"] || "application/json",
    },
    body,
  });

  response.writeHead(botResponse.status, {
    "Content-Type": botResponse.headers.get("content-type") || "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  });
  response.end(Buffer.from(await botResponse.arrayBuffer()));
}

async function getSalaryRolesFromBot() {
  try {
    const response = await fetch(new URL("/api/dashboard/config", botApiUrl));
    if (!response.ok) return [];
    const payload = await response.json();
    return payload.salaryRoles || [];
  } catch {
    return [];
  }
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url, `http://${host}:${port}`);

    if (requestUrl.pathname === "/api/dashboard/config") {
      sendJson(response, 200, {
        clientId: process.env.CLIENT_ID || "",
        guildId: process.env.GUILD_ID || "",
        apiBaseUrl: publicApiUrl,
        salaryRoles: await getSalaryRolesFromBot(),
      });
      return;
    }

    if (requestUrl.pathname.startsWith("/api/dashboard/")) {
      await proxyBotApi(request, response, requestUrl);
      return;
    }

    const requestPath = requestUrl.pathname === "/" ? "/index.html" : requestUrl.pathname;
    const normalizedPath = normalize(requestPath).replace(/^(\.\.[/\\])+/, "");
    const filePath = join(__dirname, normalizedPath);

    if (!filePath.startsWith(__dirname)) {
      response.writeHead(403);
      response.end("Forbidden");
      return;
    }

    const file = await readFile(filePath);
    response.writeHead(200, {
      "Content-Type": mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": "no-store",
    });
    response.end(file);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
});

startBot();

server.listen(port, host, () => {
  console.log(`Dashboard disponible sur http://${host}:${port}/index.html`);
});
