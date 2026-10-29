#!/bin/bash
# NFP-Alvana · cloud session setup. Runs at the start of every Claude Code cloud session (SessionStart hook in
# .claude/settings.json) and does nothing on a normal computer. Idempotent: it only installs what is missing.
#   1. system tools: ffmpeg, the libraries Chrome needs, fonts (usually already there from the environment's setup
#      script — scripts/environment-setup.sh — which is cached between sessions)
#   2. node packages (npm install)
#   3. Chrome Headless Shell for Remotion, from Google's CDN (allowed on the Trusted network)
#   4. an empty .env so `node --env-file=.env …` works (keys come from the environment, never from files)
#   5. a short health report (tools/cloud-doctor.mjs --brief), which Claude reads at the start of the session
# Run it by hand any time: bash scripts/cloud-setup.sh
[ "$CLAUDE_CODE_REMOTE" = "true" ] || [ "$NFP_FORCE_SETUP" = "1" ] || exit 0
cd "${CLAUDE_PROJECT_DIR:-$(dirname "$0")/..}" || exit 0
log() { echo "[nfp-setup] $*"; }
export DEBIAN_FRONTEND=noninteractive
SUDO=""; [ "$(id -u)" = "0" ] || SUDO="sudo"

# ── 1. system tools
PKGS="ffmpeg unzip libnss3 libdbus-1-3 libatk1.0-0 libasound2t64 libxrandr2 libxkbcommon0 libxfixes3 libxcomposite1 libxdamage1 libgbm1 libcups2 libcairo2 libpango-1.0-0 libatk-bridge2.0-0 fonts-noto-color-emoji fonts-noto-core fonts-dejavu-core"
if ! command -v ffmpeg >/dev/null 2>&1 || ! dpkg -s libnss3 libgbm1 >/dev/null 2>&1; then
  log "installing system tools (ffmpeg, Chrome libraries, fonts)… about 1–2 minutes"
  ($SUDO apt-get update -qq && $SUDO apt-get install -y -qq --no-install-recommends $PKGS) >/tmp/nfp-apt.log 2>&1 \
    || log "apt install failed — see /tmp/nfp-apt.log (is the environment's network access None?)"
fi
# no system ffmpeg after all: use the one Remotion ships (installed with the node packages below)
need_ffmpeg_shim=0; command -v ffmpeg >/dev/null 2>&1 || need_ffmpeg_shim=1

# ── 2. node packages
if [ ! -d node_modules/remotion ] || [ ! -d node_modules/undici ]; then
  log "installing node packages… about 1–2 minutes"
  npm install --no-audit --no-fund --loglevel=error >/tmp/nfp-npm.log 2>&1 || log "npm install failed — see /tmp/nfp-npm.log"
fi
if [ "$need_ffmpeg_shim" = "1" ]; then
  C=$(ls -d node_modules/@remotion/compositor-linux-x64-gnu 2>/dev/null)
  if [ -n "$C" ] && [ -x "$C/ffmpeg" ]; then
    D=$(cd "$C" && pwd)
    for b in ffmpeg ffprobe; do
      printf '#!/bin/sh\nLD_LIBRARY_PATH="%s:$LD_LIBRARY_PATH" exec "%s/%s" "$@"\n' "$D" "$D" "$b" | $SUDO tee /usr/local/bin/$b >/dev/null
      $SUDO chmod +x /usr/local/bin/$b
    done
    log "using Remotion's bundled ffmpeg/ffprobe"
  fi
fi

# ── 3. Chrome Headless Shell (the version this Remotion release is tested with)
V=$(grep -o "TESTED_VERSION = '[0-9.]*'" node_modules/@remotion/renderer/dist/browser/get-chrome-download-url.js 2>/dev/null | grep -o "[0-9][0-9.]*")
V=${V:-149.0.7790.0}
CHS=/opt/nfp/chrome-headless-shell-linux64/chrome-headless-shell
if [ ! -x "$CHS" ] || [ "$(cat /opt/nfp/chrome-version 2>/dev/null)" != "$V" ]; then
  log "downloading Chrome Headless Shell $V…"
  $SUDO mkdir -p /opt/nfp
  if curl -fsSL --retry 2 -o /tmp/chs.zip "https://storage.googleapis.com/chrome-for-testing-public/$V/linux64/chrome-headless-shell-linux64.zip"; then
    $SUDO rm -rf /opt/nfp/chrome-headless-shell-linux64
    ($SUDO unzip -q -o /tmp/chs.zip -d /opt/nfp || python3 -m zipfile -e /tmp/chs.zip /opt/nfp) && $SUDO chmod -R a+rx /opt/nfp/chrome-headless-shell-linux64 && echo "$V" | $SUDO tee /opt/nfp/chrome-version >/dev/null
    rm -f /tmp/chs.zip
  else
    log "Chrome download failed — trying Remotion's own downloader"
    npx remotion browser ensure >/tmp/nfp-chrome.log 2>&1 || log "no browser yet — see /tmp/nfp-chrome.log"
  fi
fi

# ── 4. .env placeholder (never put a key in it here: keys live in the cloud environment)
[ -f .env ] || : > .env

# ── 5. report
node tools/cloud-doctor.mjs --brief 2>/dev/null || log "cloud-doctor could not run (node packages missing?)"
exit 0
