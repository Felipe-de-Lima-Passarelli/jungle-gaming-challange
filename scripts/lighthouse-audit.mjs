import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";

const baseUrl = process.env.AUDIT_URL ?? "http://127.0.0.1:4173";
mkdirSync("artifacts/lighthouse", { recursive: true });
const pages = ["/", "/nft/1"];
const profiles = ["desktop", "mobile"];
let failed = false;
for (const page of pages)
  for (const profile of profiles)
    for (let run = 1; run <= 3; run++) {
      const output = `artifacts/lighthouse/${page === "/" ? "home" : "nft-detail"}-${profile}-${run}`;
      const args = [
        "--yes",
        "lighthouse",
        `${baseUrl}${page}`,
        "--output=html",
        "--output=json",
        `--output-path=${output}`,
        "--chrome-flags=--headless --no-sandbox",
      ];
      if (profile === "desktop") args.push("--preset=desktop");
      const result = spawnSync("npx", args, {
        stdio: "inherit",
        shell: process.platform === "win32",
      });
      if (result.status !== 0) failed = true;
    }
if (failed) process.exit(1);
console.log(
  "Auditorias concluídas. Compare as três medições por página e perfil antes de reportar medianas.",
);
