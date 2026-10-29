// NFP-Alvana · first-run check: what is installed, what is missing, what each missing piece is for, how to get it.
// Prints a table and writes SETUP-STATUS.md next to package.json, so later sessions read that file instead of
// checking again (re-run after installing something, or when something breaks).
// Secrets are never printed: the ElevenLabs key is only tested.
// Usage (inside the project made from template/):  node tools/doctor.mjs  [--no-net]
//   Windows PowerShell: if "npm.ps1 cannot be loaded", use npm.cmd / npx.cmd.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const NO_NET = process.argv.includes("--no-net");
const WIN = process.platform === "win32", MAC = process.platform === "darwin";
const OSK = WIN ? "win" : MAC ? "mac" : "linux";
const ROOT = process.cwd();
const rows = [];
/** status: ok | warn (works, but…) | miss (needed for something; see "for") | info */
const add = (need, item, status, detail, fix = "", forWhat = "") => rows.push({ need, item, status, detail, fix, forWhat });
const run = (cmd, args = ["--version"]) => {
  // one command string through the shell (Windows needs it for .cmd files; no unescaped-args warning)
  const r = WIN ? spawnSync(`${cmd} ${args.join(" ")}`, { encoding: "utf8", timeout: 25000, shell: true, windowsHide: true }) : spawnSync(cmd, args, { encoding: "utf8", timeout: 25000 });
  if (r.error || r.status !== 0) return null;
  return ((r.stdout || "") + "\n" + (r.stderr || "")).trim().split(/\r?\n/).find((l) => l.trim()) ?? "";
};
const INSTALL = {
  node: { win: "winget install OpenJS.NodeJS.LTS", mac: "brew install node", linux: "nvm install 24  (https://github.com/nvm-sh/nvm) or your distro's nodejs" },
  ffmpeg: { win: "winget install Gyan.FFmpeg  (then open a new terminal)", mac: "brew install ffmpeg", linux: "sudo apt install ffmpeg" },
  chrome: { win: "winget install Google.Chrome", mac: "brew install --cask google-chrome", linux: "sudo apt install chromium  (or https://www.google.com/chrome)" },
  python: { win: "winget install Python.Python.3.11", mac: "brew install python@3.11", linux: "sudo apt install python3 python3-pip" },
  git: { win: "winget install Git.Git", mac: "xcode-select --install", linux: "sudo apt install git" },
};
const how = (k) => INSTALL[k][OSK];

// ── 1. required software ─────────────────────────────────────────────────────────────────────────────────────────
const [maj, min] = process.versions.node.split(".").map(Number);
if (maj >= 22) add("required", "Node.js", maj >= 24 ? "ok" : "warn", `v${process.versions.node}`, maj >= 24 ? "" : `${how("node")}  — Node 24+ is needed only for the ElevenLabs proxy setting (NODE_USE_ENV_PROXY)`);
else if (maj > 20 || (maj === 20 && min >= 6)) add("required", "Node.js", "warn", `v${process.versions.node} (old)`, how("node"), "22+ recommended; 24+ if you need a proxy for ElevenLabs");
else add("required", "Node.js", "miss", `v${process.versions.node} — too old (tools use --env-file and fetch)`, how("node"), "everything");

const npm = run(WIN ? "npm.cmd" : "npm", ["-v"]);
add("required", "npm", npm ? "ok" : "miss", npm ? `v${npm}` : "not found", npm ? "" : "comes with Node.js — reinstall Node", "installing the project");

const ff = run("ffmpeg", ["-version"]), fp = run("ffprobe", ["-version"]);
add("required", "ffmpeg + ffprobe", ff && fp ? "ok" : "miss", ff ? ff.replace(/ Copyright.*/, "") : "not found", ff && fp ? "" : how("ffmpeg"), "rendering helpers, audio mixing, contact sheets, all tools");

function findChrome() {
  const env = process.env.REMOTION_CHROME;
  if (env && fs.existsSync(env)) return env;
  const list = WIN
    ? [process.env.PROGRAMFILES, process.env["PROGRAMFILES(X86)"], process.env.LOCALAPPDATA].filter(Boolean).map((d) => path.join(d, "Google/Chrome/Application/chrome.exe"))
    : MAC
      ? ["/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", "/Applications/Chromium.app/Contents/MacOS/Chromium"]
      : ["/usr/bin/google-chrome", "/usr/bin/google-chrome-stable", "/usr/bin/chromium", "/usr/bin/chromium-browser", "/snap/bin/chromium"];
  return list.find((p) => fs.existsSync(p)) ?? null;
}
const chrome = findChrome();
const shell = fs.existsSync(path.join(ROOT, "node_modules/.remotion"));
add("required", "Chrome / Chromium", chrome ? "ok" : shell ? "ok" : "warn", chrome ? chrome : shell ? "Remotion's own headless Chrome is downloaded" : "not found",
  chrome || shell ? "" : `${how("chrome")}  — or let Remotion download its headless Chrome on the first render (blocked in some countries, e.g. Iran: then install Chrome)`, "rendering (Remotion draws every frame in Chrome)");

// ── 2. the project itself ───────────────────────────────────────────────────────────────────────────────────────
const pkgPath = path.join(ROOT, "package.json");
if (!fs.existsSync(pkgPath)) add("required", "project folder", "miss", `no package.json in ${ROOT}`, "copy the kit's template/ folder to where the videos will live, cd into it, run this again");
else {
  const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
  const want = pkg.dependencies?.remotion;
  const rp = path.join(ROOT, "node_modules/remotion/package.json");
  const have = fs.existsSync(rp) ? JSON.parse(fs.readFileSync(rp, "utf8")).version : null;
  if (!have) add("required", "npm packages", "miss", "node_modules not installed", WIN ? "npm.cmd install" : "npm install", "everything (Remotion, three.js …)");
  else add("required", "npm packages", have === want ? "ok" : "warn", `remotion ${have}${have === want ? "" : ` (package.json wants ${want})`}`, have === want ? "" : WIN ? "npm.cmd install" : "npm install");
  const fonts = ["Vazirmatn-SemiBold.ttf", "Vazirmatn-Bold.ttf", "Lalezar-Regular.ttf", "VazirCode.ttf", "ChakraPetch-Bold.ttf"];
  const missing = fonts.filter((f) => !fs.existsSync(path.join(ROOT, "public/fonts", f)));
  add("required", "fonts (public/fonts)", missing.length ? "miss" : "ok", missing.length ? `missing: ${missing.join(", ")}` : "Vazirmatn, Lalezar, Vazir Code, Chakra Petch …", missing.length ? "copy them again from the kit's template/public/fonts" : "", "Persian text and numbers");
  // style data that is generated, not shipped (too big for the zip)
  if (fs.existsSync(path.join(ROOT, "src/styles/cosmic-web"))) {
    const ok = fs.existsSync(path.join(ROOT, "public/styles/cosmic-web/web.bin")) && fs.existsSync(path.join(ROOT, "public/styles/cosmic-web/zel.bin"));
    add("optional", "Cosmic Web data", ok ? "ok" : "info", ok ? "web.bin + zel.bin built" : "not built yet (only that style needs it)", ok ? "" : "node tools/v18-web.mjs && node tools/v18-zel.mjs   (≈1–2 min, ~55 MB)", "style cosmic-web");
  }
}

// ── 3. accounts and keys (optional, only for narration / generated audio) ──────────────────────────────────────
const envPath = path.join(ROOT, ".env");
const env = fs.existsSync(envPath) ? Object.fromEntries(fs.readFileSync(envPath, "utf8").split(/\r?\n/).filter((l) => /^\s*[A-Z_]+\s*=/.test(l)).map((l) => [l.split("=")[0].trim(), l.slice(l.indexOf("=") + 1).trim()])) : {};
const key = env.ELEVENLABS_API_KEY || process.env.ELEVENLABS_API_KEY;
const ELEVEN_FOR = "narration (TTS) · checking takes (speech-to-text) · word timing of your own voice · sound effects and music from a prompt";
const ELEVEN_HOW = "1) sign up at https://elevenlabs.io  2) Profile → API Keys → Create (enable Text to Speech, Speech to Text, Sound Effects, Music)  3) put ELEVENLABS_API_KEY=sk_… in the project's .env yourself (never paste it in the chat)";
if (!key) add("optional", "ElevenLabs key", "info", fs.existsSync(envPath) ? ".env has no ELEVENLABS_API_KEY" : "no .env file", ELEVEN_HOW, ELEVEN_FOR);
else if (!/^sk_/.test(key)) add("optional", "ElevenLabs key", "warn", ".env key does not start with sk_ (that is probably the key ID, not the key)", ELEVEN_HOW, ELEVEN_FOR);
else if (NO_NET) add("optional", "ElevenLabs key", "info", "key present (not tested: --no-net)");
else {
  try {
    const r = await fetch("https://api.elevenlabs.io/v1/user/subscription", { headers: { "xi-api-key": key }, signal: AbortSignal.timeout(12000) });
    if (r.ok) {
      const s = await r.json();
      const free = s.tier === "free";
      add("optional", "ElevenLabs key", free ? "warn" : "ok", `works · plan: ${s.tier} · characters ${s.character_count}/${s.character_limit}`,
        free ? "free plan: TTS only with the default voices via API (no library voices such as Clyde/Hooman/Farideh), and no commercial use of generated audio — Starter/Creator for those" : "", ELEVEN_FOR);
    } else if (r.status === 401) add("optional", "ElevenLabs key", "miss", "key rejected (401) — wrong key or missing permissions", ELEVEN_HOW, ELEVEN_FOR);
    else if (r.status === 403) add("optional", "ElevenLabs key", "miss", "blocked (403) — region block or key permissions", "region block (e.g. Iran): run tools through a proxy — PowerShell: $env:HTTPS_PROXY='http://127.0.0.1:<port>'; $env:NODE_USE_ENV_PROXY='1'  (bash: export …; needs Node 24+). Or turn on a VPN.", ELEVEN_FOR);
    else add("optional", "ElevenLabs key", "warn", `answered ${r.status}`, "", ELEVEN_FOR);
  } catch (e) {
    add("optional", "ElevenLabs key", "warn", `no connection (${e.cause?.code ?? e.name}) — offline or blocked`, "check the internet / VPN; behind a proxy: HTTPS_PROXY + NODE_USE_ENV_PROXY=1 (Node 24+)", ELEVEN_FOR);
  }
}
add("optional", "image generator", "info", "the AI writes the prompts; images come from any generator you have",
  "ChatGPT (GPT Image) by hand — save files where the AI says · or an image-generation connector/MCP if this Claude has one (the AI checks its own tools)", "styles that use rendered pictures: hologram-hud, atomic-age, satellite-explainer, test-reel, halftone-pop");

// ── 4. optional software ───────────────────────────────────────────────────────────────────────────────────────
const py = run("python", ["--version"]) ?? run("python3", ["--version"]) ?? (WIN ? run("py", ["-3", "--version"]) : null);
add("optional", "Python 3 + demucs", py ? "info" : "info", py ? `${py} (demucs not checked)` : "not found", py ? "pip install demucs  (only if you need to separate a voice from music)" : `${how("python")} then pip install demucs`, "only for splitting voice / music out of an existing video");
const git = run("git", ["--version"]);
add("optional", "git", git ? "ok" : "info", git ?? "not found", git ? "" : how("git"), "installing skills from GitHub (git clone fallback)");

// ── 5. Claude skills (recommended, not required) ──────────────────────────────────────────────────────────────
const skillDir = path.join(os.homedir(), ".claude/skills");
const skills = fs.existsSync(skillDir) ? fs.readdirSync(skillDir) : [];
const hasRemotion = skills.some((s) => s.startsWith("remotion"));
add("optional", "skill: Remotion (official)", hasRemotion ? "ok" : "info", hasRemotion ? "installed" : "not installed", hasRemotion ? "" : "npx skills add remotion-dev/skills -g -y -s '*' -a claude-code   (Windows: npx.cmd)", "up-to-date Remotion API answers (/remotion-docs); fewer API mistakes");
add("optional", "skill: nfp-alvana (this kit)", skills.includes("nfp-alvana") ? "ok" : "info", skills.includes("nfp-alvana") ? "installed as a skill" : "used from a folder", skills.includes("nfp-alvana") ? "" : `copy the nfp-alvana folder to ${skillDir} so every project knows it`);

// ── 6. machine ─────────────────────────────────────────────────────────────────────────────────────────────────
try {
  const st = fs.statfsSync(ROOT);
  const gb = (st.bavail * st.bsize) / 1e9;
  add("required", "free disk", gb > 8 ? "ok" : "warn", `${gb.toFixed(1)} GB free here`, gb > 8 ? "" : "renders and audio takes need a few GB; clean old renders (out/) and temp bundles", "renders");
} catch {}
add("info", "machine", "info", `${os.platform()} ${os.arch()} · ${os.cpus().length} CPU threads · ${(os.totalmem() / 1e9).toFixed(0)} GB RAM`, "", "3D styles (light-swarm, cosmic-web) need a real GPU; render them with --gl=angle (Windows) --concurrency=1");
if (!NO_NET) {
  for (const [name, url, forWhat] of [["npm registry", "https://registry.npmjs.org/remotion", "npm install"], ["GitHub", "https://github.com", "skills, open-source tools"]]) {
    try {
      const r = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(8000) });
      add("info", `internet: ${name}`, r.ok || r.status < 500 ? "ok" : "warn", `HTTP ${r.status}`, "", forWhat);
    } catch (e) {
      add("info", `internet: ${name}`, "warn", `unreachable (${e.cause?.code ?? e.name})`, "VPN / proxy", forWhat);
    }
  }
}

// ── report ─────────────────────────────────────────────────────────────────────────────────────────────────────
const ICON = { ok: "✅", warn: "⚠️", miss: "❌", info: "ℹ️" };
const lines = rows.map((r) => `| ${ICON[r.status]} | ${r.need} | ${r.item} | ${r.detail}${r.forWhat ? ` · for: ${r.forWhat}` : ""} | ${r.fix || ""} |`);
const ready = !rows.some((r) => r.need === "required" && r.status === "miss");
const md = [
  "# Setup status (NFP-Alvana)",
  `Checked ${new Date().toISOString().slice(0, 16).replace("T", " ")} on ${os.platform()} by tools/doctor.mjs. Re-run after installing something.`,
  "",
  ready ? "**Ready to render.** Missing optional items only limit some features." : "**Not ready yet:** fix the ❌ required rows first.",
  "",
  "| | need | item | state | how to fix |",
  "|---|---|---|---|---|",
  ...lines,
  "",
].join("\n");
fs.writeFileSync(path.join(ROOT, "SETUP-STATUS.md"), md);
console.log(md);
process.exit(ready ? 0 : 1);
