// NFP-Alvana · health check for a Claude Code cloud session (also works on a computer). Prints what is ready and,
// for anything missing, the exact fix — for Claude to do itself, or for the user to do in the cloud environment
// settings (keys are never typed into the chat).
// Usage: node tools/cloud-doctor.mjs [--brief]
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import { ELEVEN_KEY, xi } from "./lib/eleven.mjs";

const BRIEF = process.argv.includes("--brief");
const rows = [];
const add = (ok, name, info, fix = "") => rows.push({ ok, name, info, fix });
const run = (cmd, args) => {
  const r = spawnSync(cmd, args, { encoding: "utf8", timeout: 20000 });
  return { ok: r.status === 0, out: `${r.stdout ?? ""}${r.stderr ?? ""}`.trim() };
};
const CLOUD = process.env.CLAUDE_CODE_REMOTE === "true";

// ── runtime and tools
add(Number(process.versions.node.split(".")[0]) >= 20, "Node", process.version, "Node 20+ is needed");
const ff = run("ffmpeg", ["-version"]);
add(ff.ok, "ffmpeg", ff.ok ? ff.out.split("\n")[0].slice(0, 60) : "missing", "bash scripts/cloud-setup.sh (installs ffmpeg with apt, or wraps Remotion's own)");
const rv = (() => { try { return JSON.parse(fs.readFileSync("node_modules/remotion/package.json", "utf8")).version; } catch { return null; } })();
add(!!rv, "node packages", rv ? `remotion ${rv}` : "missing", "npm install");
if (CLOUD) add(fs.existsSync("node_modules/undici"), "proxy support (undici)", fs.existsSync("node_modules/undici") ? "ok" : "missing", "npm install");

// ── browser for rendering
const CHS = ["/opt/nfp/chrome-headless-shell-linux64/chrome-headless-shell", process.env.REMOTION_CHROME].find((p) => p && fs.existsSync(p));
if (CHS) {
  const v = run(CHS, ["--version"]);
  const missing = /error while loading shared libraries: (\S+)/.exec(v.out)?.[1];
  add(v.ok, "Chrome Headless Shell", v.ok ? v.out.slice(0, 60) : missing ? `missing library ${missing}` : v.out.slice(0, 80), "the system libraries are missing: bash scripts/cloud-setup.sh (apt install), then check again");
} else if (fs.existsSync("node_modules/.remotion")) add(true, "Chrome Headless Shell", "Remotion's own download");
else add(!CLOUD, "Chrome Headless Shell", CLOUD ? "not installed" : "will use the installed Chrome", "bash scripts/cloud-setup.sh (downloads it from storage.googleapis.com)");

// ── machine
add(true, "machine", `${os.cpus().length} CPU · ${Math.round(os.totalmem() / 2 ** 30)} GB RAM${CLOUD ? " · cloud VM (no GPU: 3D styles render with --gl=swangle, slowly)" : ""}`);

// ── ElevenLabs (optional: narration, sound effects, music)
const HOW_SECRET = "the user adds it once (never in the chat): claude.ai/code → cloud icon above the message box → gear next to the environment → Network secrets → Add secret · Name: ElevenLabs · Allowed websites: api.elevenlabs.io · Custom headers: name xi-api-key, prefix empty, value = the key → Connect. Then start a new session. (Team plans: Environment variables ELEVENLABS_API_KEY=… plus Network access Custom with api.elevenlabs.io)";
try {
  const r = await fetch("https://api.elevenlabs.io/v1/user/subscription", { headers: xi(), signal: AbortSignal.timeout(15000) });
  if (r.ok) {
    const s = await r.json();
    add(true, "ElevenLabs", `works · plan ${s.tier} · characters ${s.character_count}/${s.character_limit}${s.tier === "free" ? " (free: default voices only, no commercial use)" : ""}${ELEVEN_KEY ? "" : " · key from the network secret"}`);
  } else if (r.status === 401) add(false, "ElevenLabs", ELEVEN_KEY ? "key rejected (401)" : "no key (401)", HOW_SECRET);
  else if (r.status === 403 && /host_not_allowed/.test(r.headers.get("x-deny-reason") ?? "")) add(false, "ElevenLabs", "blocked by the environment's network (host_not_allowed)", HOW_SECRET);
  else add(false, "ElevenLabs", `answered ${r.status}`, r.status === 403 ? "region block or key permissions; in the cloud: " + HOW_SECRET : "");
} catch (e) {
  add(false, "ElevenLabs", `not reachable (${e.cause?.code ?? e.name})`, HOW_SECRET);
}

// ── Telegram delivery (optional)
const TG = process.env.TELEGRAM_BOT_TOKEN, TGC = process.env.TELEGRAM_CHAT_ID;
if (TG && TGC) {
  try {
    const r = await fetch(`https://api.telegram.org/bot${TG}/getMe`, { signal: AbortSignal.timeout(15000) });
    add(r.ok, "Telegram", r.ok ? "bot works — deliver.mjs also sends videos there" : `answered ${r.status}`, r.status === 403 ? "add api.telegram.org to the environment: Network access → Custom → Allowed domains (keep «Also include default list»)" : "check TELEGRAM_BOT_TOKEN");
  } catch (e) {
    add(false, "Telegram", `not reachable (${e.cause?.code ?? e.name})`, "add api.telegram.org to the environment: Network access → Custom → Allowed domains (keep «Also include default list»)");
  }
} else if (!BRIEF) add(true, "Telegram", "not set up (optional): videos come as GitHub links");

// ── git: where finished videos go
const remote = run("git", ["remote", "get-url", "origin"]);
const m = /([^/:]+)\/([^/]+?)(?:\.git)?$/.exec(remote.out);
add(remote.ok, "GitHub repo", m ? `${m[1]}/${m[2]} · finished videos: node tools/deliver.mjs <file.mp4>` : "no remote", "the session must be started on a GitHub repository");

// ── print
const bad = rows.filter((r) => !r.ok);
for (const r of rows) console.log(`${r.ok ? "✓" : "✗"} ${r.name}: ${r.info}${!r.ok && r.fix ? `\n    → ${r.fix}` : ""}`);
console.log(bad.length ? `NFP setup: ${bad.length} item(s) need attention (above).` : "NFP setup: ready.");
process.exit(0);
