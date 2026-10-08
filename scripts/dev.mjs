import { spawn } from "node:child_process";

const rawArgs = process.argv.slice(2);
const nextArgs = ["dev"];

for (let i = 0; i < rawArgs.length; i++) {
  const arg = rawArgs[i];
  if (arg === "--host") {
    const nextVal = rawArgs[++i] || "0.0.0.0";
    nextArgs.push("-H", nextVal);
  } else if (arg.startsWith("--host=")) {
    nextArgs.push("-H", arg.slice(7));
  } else if (arg === "--port") {
    const nextVal = rawArgs[++i] || "3000";
    nextArgs.push("-p", nextVal);
  } else if (arg.startsWith("--port=")) {
    nextArgs.push("-p", arg.slice(7));
  } else {
    nextArgs.push(arg);
  }
}

if (!nextArgs.includes("-p") && !nextArgs.includes("--port")) {
  nextArgs.push("-p", "3000");
}
if (!nextArgs.includes("-H") && !nextArgs.includes("--hostname")) {
  nextArgs.push("-H", "0.0.0.0");
}

const child = spawn("next", nextArgs, {
  stdio: "inherit",
  shell: process.platform === "win32",
  env: process.env,
});

child.on("exit", (code) => {
  process.exit(code ?? 0);
});

process.on("SIGINT", () => child.kill("SIGINT"));
process.on("SIGTERM", () => child.kill("SIGTERM"));
