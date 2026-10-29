#!/bin/bash
# NFP-Alvana · paste this whole text into your cloud environment's "Setup script" box (claude.ai/code → the cloud
# icon above the message box → the gear next to your environment → Setup script). It installs the system tools for
# video rendering once; the result is cached, so later sessions start fast. Safe to re-run; it never stops a session.
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq >/dev/null 2>&1
apt-get install -y -qq --no-install-recommends ffmpeg unzip libnss3 libdbus-1-3 libatk1.0-0 libasound2t64 \
  libxrandr2 libxkbcommon0 libxfixes3 libxcomposite1 libxdamage1 libgbm1 libcups2 libcairo2 libpango-1.0-0 \
  libatk-bridge2.0-0 fonts-noto-color-emoji fonts-noto-core fonts-dejavu-core >/dev/null 2>&1 || true
# Chrome Headless Shell for Remotion (Google's CDN; the version Remotion 4.0.528 is tested with)
V=149.0.7790.0
if [ ! -x /opt/nfp/chrome-headless-shell-linux64/chrome-headless-shell ]; then
  mkdir -p /opt/nfp && curl -fsSL -o /tmp/chs.zip "https://storage.googleapis.com/chrome-for-testing-public/$V/linux64/chrome-headless-shell-linux64.zip" \
    && unzip -q -o /tmp/chs.zip -d /opt/nfp && echo "$V" > /opt/nfp/chrome-version || true
  rm -f /tmp/chs.zip
fi
# Remotion's official skill for Claude (correct Remotion code): optional
npx -y skills add remotion-dev/skills --skill remotion-best-practices -g -a claude-code -y --copy >/dev/null 2>&1 || true
exit 0
