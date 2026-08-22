import { spawn } from "node:child_process";
import { mkdirSync } from "node:fs";
import { resolve } from "node:path";

const [tool, ...args] = process.argv.slice(2);
if (!tool || !/^[a-z0-9-]+$/i.test(tool)) {
  console.error("Kullanım: node scripts/run-tool.mjs <araç> [...argümanlar]");
  process.exit(64);
}

const projectRoot = resolve(import.meta.dirname, "..");
const runtimeRoot = resolve(projectRoot, ".sites-runtime");
const logRoot = resolve(runtimeRoot, "wrangler", "logs");
mkdirSync(logRoot, { recursive: true });

const toolEntries = {
  eslint: ["eslint", "bin", "eslint.js"],
  vinext: ["vinext", "dist", "cli.js"],
  vite: ["vite", "bin", "vite.js"],
};
const entry = toolEntries[tool];
if (!entry) {
  console.error(`Desteklenmeyen araç: ${tool}`);
  process.exit(64);
}
const executable = resolve(projectRoot, "node_modules", ...entry);
const child = spawn(process.execPath, [executable, ...args], {
  cwd: projectRoot,
  stdio: "inherit",
  env: {
    ...process.env,
    WRANGLER_WRITE_LOGS: "false",
    WRANGLER_LOG_PATH: logRoot,
    MINIFLARE_REGISTRY_PATH: resolve(runtimeRoot, "wrangler", "registry"),
  },
  shell: false,
});

child.on("error", (error) => {
  console.error(`${tool} başlatılamadı: ${error.message}`);
  process.exit(69);
});
child.on("exit", (code, signal) => {
  if (signal) console.error(`${tool}, ${signal} sinyaliyle kapandı.`);
  process.exit(code ?? 1);
});
