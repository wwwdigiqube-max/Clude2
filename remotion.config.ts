// All configuration options: https://remotion.dev/docs/config
import { Config } from "@remotion/cli/config";
import { enableTailwind } from "@remotion/tailwind-v4";
import fs from "node:fs";

Config.setRspack(true);
Config.setVideoImageFormat("jpeg");
Config.setOverwriteOutput(true);
Config.overrideBundlerConfig(enableTailwind);

// The browser Remotion renders with. In a Claude Code cloud session, scripts/cloud-setup.sh puts Chrome Headless Shell
// in /opt/nfp (Remotion's own downloader can't reach its host there). On a computer: an installed Chrome, or
// Remotion's download. Override with env REMOTION_CHROME=<path>.
const CHROME = [
  process.env.REMOTION_CHROME,
  "/opt/nfp/chrome-headless-shell-linux64/chrome-headless-shell",
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Google/Chrome/Application/chrome.exe",
  `${process.env.LOCALAPPDATA}/Google/Chrome/Application/chrome.exe`,
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
].find((p) => p && fs.existsSync(p));
if (CHROME) Config.setBrowserExecutable(CHROME);

// Cloud VM: 4 CPUs, no GPU. WebGL (the 3D styles) runs on the CPU with SwiftShader; 2D styles use all 4 cores.
if (process.env.CLAUDE_CODE_REMOTE === "true") {
  Config.setChromiumOpenGlRenderer("swangle");
  Config.setConcurrency(4);
}
