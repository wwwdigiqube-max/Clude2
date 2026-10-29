// NFP-Alvana · deliver finished files to the user's phone (videos, contact sheets, stills).
//   1. a video over 45 MB gets a phone copy that fits (H.264 + AAC, +faststart so it plays while downloading);
//      every video is remuxed with faststart
//   2. files outside videos/ are copied to videos/<name>/ (out/ is never committed)
//   3. commit + push to main, so the files are on GitHub and in every later session
//      (if main can't be pushed directly: push the branch, open a PR and merge it through the GitHub API)
//   4. print links that open on a phone: the GitHub page (shows images, plays/downloads videos) and the raw download
//   5. with TELEGRAM_BOT_TOKEN + TELEGRAM_CHAT_ID in the environment, also send each file to Telegram (≤ 50 MB)
// Usage: node tools/deliver.mjs <file> [more files…] [--title "…"] [--no-push]
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import "./lib/net.mjs";

const args = process.argv.slice(2);
const ti = args.indexOf("--title");
const title = ti >= 0 ? args[ti + 1] : "";
const NO_PUSH = args.includes("--no-push");
const inputs = args.filter((a, i) => !a.startsWith("--") && (ti < 0 || i !== ti + 1));
if (!inputs.length) {
  console.error('usage: node tools/deliver.mjs <file> [more files…] [--title "…"] [--no-push]');
  process.exit(1);
}
const MAX = 45 * 2 ** 20;
const sh = (cmd, a, opt = {}) => spawnSync(cmd, a, { encoding: "utf8", ...opt });
const git = (...a) => sh("git", a);
const ffprobe = (f, entry) => sh("ffprobe", ["-v", "error", "-show_entries", entry, "-of", "csv=p=0", f]).stdout.trim();

/** write src as a phone-friendly video at dst: remuxed with faststart if it fits, else re-encoded to fit 45 MB */
function phoneVideo(src, dst) {
  const size = fs.statSync(src).size;
  const tmp = dst.replace(/\.mp4$/i, "") + ".tmp.mp4";
  if (size <= MAX) {
    execFileSync("ffmpeg", ["-nostdin", "-v", "error", "-y", "-i", src, "-c", "copy", "-movflags", "+faststart", tmp]);
  } else {
    const dur = Number(ffprobe(src, "format=duration")) || 60;
    const [w, h] = ffprobe(src, "stream=width,height").split("\n")[0].split(",").map(Number);
    let kbps = Math.floor((44 * 8 * 1024) / dur - 160);
    const scale = kbps < 1800 && Math.min(w, h) > 720 ? (w < h ? ["-vf", "scale=720:-2"] : ["-vf", "scale=-2:720"]) : [];
    kbps = Math.max(500, Math.min(kbps, 12000));
    console.log(`${path.basename(src)} is ${(size / 2 ** 20).toFixed(0)} MB → phone copy at ${kbps} kbps${scale.length ? ", 720p" : ""}`);
    execFileSync("ffmpeg", ["-nostdin", "-v", "error", "-y", "-i", src, ...scale, "-c:v", "libx264", "-preset", "medium", "-b:v", `${kbps}k`, "-maxrate", `${Math.round(kbps * 1.5)}k`, "-bufsize", `${kbps * 2}k`, "-pix_fmt", "yuv420p", "-c:a", "aac", "-b:a", "160k", "-movflags", "+faststart", tmp]);
  }
  fs.renameSync(tmp, dst);
}

// ── 1–2. prepare the files: everything delivered lives in videos/; a master too big for GitHub moves to out/masters/
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9؀-ۿ]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "video";
const files = [];
for (const f0 of inputs) {
  if (!fs.existsSync(f0)) { console.error("not found:", f0); process.exit(1); }
  const src = path.relative(process.cwd(), path.resolve(f0)).replace(/\\/g, "/");
  const inVideos = src.startsWith("videos/");
  const dst = inVideos ? src : `videos/${slug(path.basename(src, path.extname(src)))}/${path.basename(src)}`;
  fs.mkdirSync(path.dirname(dst), { recursive: true });
  if (/\.mp4$/i.test(src)) {
    if (inVideos && fs.statSync(src).size > MAX) {
      // keep the full-quality master out of git (out/ is ignored); the phone copy takes its place
      const master = `out/masters/${path.basename(src)}`;
      fs.mkdirSync(path.dirname(master), { recursive: true });
      fs.renameSync(src, master);
      phoneVideo(master, dst);
      console.log(`master kept (not in git, gone when the session ends): ${master}`);
    } else phoneVideo(src, dst);
  } else if (!inVideos) fs.copyFileSync(src, dst);
  if (fs.statSync(dst).size > 95 * 2 ** 20) { console.error(`${dst} is over 95 MB — GitHub refuses it`); process.exit(1); }
  files.push(dst);
}

// ── 3. commit + push to main
const remote = git("remote", "get-url", "origin").stdout.trim();
const m = /([^/:]+)\/([^/]+?)(?:\.git)?$/.exec(remote);
const repo = m ? `${m[1]}/${m[2]}` : null;
let ref = git("rev-parse", "--abbrev-ref", "HEAD").stdout.trim() || "main";
if (!NO_PUSH) {
  git("add", "--", ...files);
  if (git("diff", "--cached", "--quiet").status !== 0) git("commit", "-q", "-m", `video: ${title || path.basename(files[0])}`);
  git("fetch", "-q", "origin", "main");
  let pushed = false;
  if (ref === "main" || git("merge", "-q", "--no-edit", "origin/main").status === 0) {
    pushed = git("push", "-q", "origin", "HEAD:main").status === 0;
  } else git("merge", "--abort");
  if (pushed) ref = "main";
  else if (repo && git("push", "-q", "-u", "origin", "HEAD").status === 0) {
    // main is protected or moved: open a PR and merge it through the API
    const pr = sh("gh", ["api", `repos/${repo}/pulls`, "-f", `title=video: ${title || path.basename(files[0])}`, "-f", `head=${ref}`, "-f", "base=main", "--jq", ".number"]);
    const n = pr.stdout.trim();
    if (pr.status === 0 && n && sh("gh", ["api", "-X", "PUT", `repos/${repo}/pulls/${n}/merge`, "-f", "merge_method=merge"]).status === 0) ref = "main";
    else console.log(`pushed to branch ${ref} (could not merge into main — the files are on that branch)`);
  } else console.log("push failed — the files are committed in this session only");
}

// ── 4. links
const enc = (p) => p.split("/").map(encodeURIComponent).join("/");
console.log(`\nDELIVERED${title ? ` · ${title}` : ""}`);
for (const f of files) {
  const mb = (fs.statSync(f).size / 2 ** 20).toFixed(1);
  if (repo) console.log(`${f} (${mb} MB)\n  view: https://github.com/${repo}/blob/${ref}/${enc(f)}\n  download: https://github.com/${repo}/raw/${ref}/${enc(f)}`);
  else console.log(`${f} (${mb} MB)`);
}

// ── 5. Telegram
const TG = process.env.TELEGRAM_BOT_TOKEN, TGC = process.env.TELEGRAM_CHAT_ID;
if (TG && TGC) {
  for (const f of files) {
    const isVid = /\.mp4$/i.test(f), isImg = /\.(jpe?g|png)$/i.test(f);
    if (fs.statSync(f).size > 50 * 2 ** 20) { console.log(`telegram: ${f} is over 50 MB — skipped`); continue; }
    const form = new FormData();
    form.append("chat_id", TGC);
    if (title) form.append("caption", title);
    if (isVid) form.append("supports_streaming", "true");
    form.append(isVid ? "video" : isImg ? "photo" : "document", new Blob([fs.readFileSync(f)]), path.basename(f));
    try {
      const r = await fetch(`https://api.telegram.org/bot${TG}/${isVid ? "sendVideo" : isImg ? "sendPhoto" : "sendDocument"}`, { method: "POST", body: form, signal: AbortSignal.timeout(300000) });
      console.log(`telegram: ${path.basename(f)} ${r.ok ? "sent" : `failed (${r.status})`}`);
    } catch (e) {
      console.log(`telegram: ${path.basename(f)} failed (${e.cause?.code ?? e.name}) — is api.telegram.org allowed in the environment's network?`);
    }
  }
}
