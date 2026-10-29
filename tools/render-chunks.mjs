// Memory-safe render: renders a composition in short frame chunks, each in its own process (memory is fully
// released between chunks), then joins them losslessly. Skips chunks that already exist (resumable).
// Usage: node tools/render-chunks.mjs <compId> <totalFrames> <outDir> <final.mp4> [chunkSize=150] [extra remotion flags...]
// Joined audio can click at chunk seams: render silent (--muted) and mux the full audio afterwards.
// Time budget (cloud sessions, where one command may run ~10 minutes in the foreground): RENDER_BUDGET_SEC=480 stops
// before starting a chunk once that many seconds have passed, prints "PARTIAL k/n" and exits with code 3 — run the
// same command again and it continues from the next chunk.
// Defaults: --gl=angle on Windows/macOS (GPU), --gl=swangle on Linux (CPU-only WebGL, e.g. a cloud VM). Pass your own
// --gl / --concurrency to override.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [comp, totalArg, outDir, finalOut, chunkArg, ...extra] = process.argv.slice(2);
const total = Number(totalArg), chunk = Number(chunkArg ?? 150);
const budget = Number(process.env.RENDER_BUDGET_SEC ?? 0);
const start = Date.now();
fs.mkdirSync(outDir, { recursive: true });
const files = [];
const n = Math.ceil(total / chunk);
for (let a = 0, i = 0; a < total; a += chunk, i++) {
  const b = Math.min(total - 1, a + chunk - 1);
  const f = path.join(outDir, `chunk_${String(i).padStart(2, "0")}.mp4`);
  files.push(f);
  if (fs.existsSync(f) && fs.statSync(f).size > 10000) { console.log("skip", f); continue; }
  if (budget > 0 && (Date.now() - start) / 1000 > budget) {
    console.log(`PARTIAL ${i}/${n} chunks done — run the same command again to continue`);
    process.exit(3);
  }
  const t0 = Date.now();
  // defaults, unless the caller passes the same flag (a repeated flag would reach remotion as an array)
  const gl = process.platform === "linux" ? "--gl=swangle" : "--gl=angle";
  const defs = [gl, "--concurrency=1", "--timeout=180000", "--crf=14", "--log=error"].filter((d) => !extra.some((e) => e.split("=")[0] === d.split("=")[0]));
  const tmp = f.replace(/\.mp4$/, ".part.mp4");
  const r = spawnSync(process.platform === "win32" ? "npx.cmd" : "npx", ["remotion", "render", "src/index.ts", comp, tmp, `--frames=${a}-${b}`, ...defs, ...extra], { stdio: "inherit", shell: true });
  if (r.status !== 0 || !fs.existsSync(tmp)) { console.error("chunk failed", a, b); process.exit(1); }
  fs.renameSync(tmp, f); // only a finished chunk gets the final name, so an interrupted one is redone
  console.log(`chunk ${i + 1}/${n} frames ${a}-${b} done in ${Math.round((Date.now() - t0) / 1000)}s`);
}
const list = path.join(outDir, "list.txt");
fs.writeFileSync(list, files.map((f) => `file '${path.resolve(f).replace(/\\/g, "/")}'`).join("\n"));
const join = ["-nostdin", "-v", "error", "-y", "-f", "concat", "-safe", "0", "-i", list, "-c", "copy", finalOut];
try {
  execFileSync("ffmpeg", join, { stdio: "inherit" });
} catch {
  // no system ffmpeg (e.g. a fresh cloud VM): Remotion ships its own
  execFileSync(process.platform === "win32" ? "npx.cmd" : "npx", ["remotion", "ffmpeg", ...join], { stdio: "inherit", shell: true });
}
console.log("joined ->", finalOut);
