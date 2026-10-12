import { spawn } from "node:child_process";
import { resolve } from "node:path";
import { existsSync } from "node:fs";

const rawArgs = process.argv.slice(2);
const nextArgs = ["dev"];

let host = "0.0.0.0";
let port = "3000";

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === "--host") {
    if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith("-")) {
      host = rawArgs[++i];
    }
  } else if (arg.startsWith("--host=")) {
    host = arg.slice(7);
  } else if (arg === "-H" || arg === "--hostname") {
    if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith("-")) {
      host = rawArgs[++i];
    }
  } else if (arg === "--port") {
    if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith("-")) {
      port = rawArgs[++i];
    }
  } else if (arg.startsWith("--port=")) {
    port = arg.slice(7);
  } else if (arg === "-p") {
    if (i + 1 < rawArgs.length && !rawArgs[i + 1].startsWith("-")) {
      port = rawArgs[++i];
    }
  } else {
    // Only forward flags Next.js dev supports
    if (arg === "--turbo" || arg === "--turbopack" || arg === "--experimental-https") {
      nextArgs.push(arg);
    }
  }
}

nextArgs.push("-p", port, "-H", host);

const nextBinCandidate = resolve(process.cwd(), "node_modules/next/dist/bin/next");
const binary = existsSync(nextBinCandidate) ? nextBinCandidate : resolve(process.cwd(), "node_modules/.bin/next");

const child = spawn(process.execPath, [binary, ...nextArgs], {
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
