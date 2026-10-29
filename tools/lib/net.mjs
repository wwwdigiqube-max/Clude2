// Make Node's fetch go through HTTPS_PROXY / NO_PROXY when a proxy is set. Claude Code cloud sessions route every
// outbound request through a local proxy (HTTPS_PROXY=http://127.0.0.1:<port>), and Node's built-in fetch ignores it
// unless NODE_USE_ENV_PROXY=1 on a Node version that supports it. This uses undici's EnvHttpProxyAgent when the
// package is installed (the cloud template installs it) and does nothing otherwise — so a computer with
// NODE_USE_ENV_PROXY=1 (or no proxy at all) keeps working exactly as before.
const proxy = process.env.HTTPS_PROXY || process.env.https_proxy || process.env.HTTP_PROXY || process.env.http_proxy;
if (proxy && !process.env.NODE_USE_ENV_PROXY) {
  try {
    const { setGlobalDispatcher, EnvHttpProxyAgent } = await import("undici");
    setGlobalDispatcher(new EnvHttpProxyAgent());
  } catch {
    // undici not installed: leave fetch as it is
  }
}
