// ElevenLabs access for the kit's tools. The key comes from ELEVENLABS_API_KEY (the project's .env on a computer), or —
// in a Claude Code cloud session — from a network secret on the cloud environment: the cloud proxy adds the
// `xi-api-key` header to requests for api.elevenlabs.io itself, so the key never enters the session and is never sent
// from here. Importing this also makes fetch use the proxy (./net.mjs).
import "./net.mjs";

export const ELEVEN_KEY = process.env.ELEVENLABS_API_KEY || "";
/** headers for an ElevenLabs request: the key only when this process has it (otherwise the cloud proxy adds it) */
export const xi = (extra = {}) => (ELEVEN_KEY ? { "xi-api-key": ELEVEN_KEY, ...extra } : { ...extra });
/** true when a request can be authenticated: a key here, or a cloud session (network secret on the environment) */
export const elevenReady = () => !!ELEVEN_KEY || process.env.CLAUDE_CODE_REMOTE === "true";
