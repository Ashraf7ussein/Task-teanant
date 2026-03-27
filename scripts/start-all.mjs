import net from "node:net";
import { spawn } from "node:child_process";

function runCommand(command, label) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, {
      stdio: "inherit",
      shell: true,
    });

    child.on("error", (error) => {
      reject(new Error(`${label} failed to start: ${error.message}`));
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolve();
        return;
      }

      reject(new Error(`${label} exited with code ${code ?? "unknown"}`));
    });
  });
}

function waitForPort(port, host, timeoutMs = 60000) {
  const startedAt = Date.now();

  return new Promise((resolve, reject) => {
    const attemptConnection = () => {
      const socket = net.connect({ port, host });

      socket.once("connect", () => {
        socket.end();
        resolve();
      });

      socket.once("error", () => {
        socket.destroy();

        if (Date.now() - startedAt >= timeoutMs) {
          reject(
            new Error(`Timed out waiting for ${host}:${port} after ${timeoutMs}ms`),
          );
          return;
        }

        setTimeout(attemptConnection, 1000);
      });
    };

    attemptConnection();
  });
}

async function main() {
  console.log("Starting Postgres and Redis with Docker...");
  await runCommand("docker compose up -d postgres redis", "Docker compose");

  console.log("Waiting for Postgres...");
  await waitForPort(5432, "127.0.0.1");

  console.log("Waiting for Redis...");
  await waitForPort(6379, "127.0.0.1");

  console.log("Applying Prisma migrations...");
  await runCommand(
    "npm exec --workspace api prisma migrate deploy",
    "Prisma migrate deploy",
  );

  console.log("Starting the web and API apps...");
  const devProcess = spawn("npm run dev", {
    stdio: "inherit",
    shell: true,
  });

  devProcess.on("error", (error) => {
    console.error(`Failed to start dev servers: ${error.message}`);
    process.exit(1);
  });

  devProcess.on("exit", (code) => {
    process.exit(code ?? 0);
  });

  const forwardSignal = (signal) => {
    if (!devProcess.killed) {
      devProcess.kill(signal);
    }
  };

  process.on("SIGINT", () => forwardSignal("SIGINT"));
  process.on("SIGTERM", () => forwardSignal("SIGTERM"));
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});