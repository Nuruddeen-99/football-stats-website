const CACHE_PREFIX = "footy-stats:";
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

export function readCache(key) {
  try {
    const raw = sessionStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;

    const entry = JSON.parse(raw);
    if (!entry || typeof entry !== "object" || !("data" in entry)) return null;

    if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
      sessionStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }

    return entry.data;
  } catch {
    return null;
  }
}

export function writeCache(key, data) {
  try {
    sessionStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ timestamp: Date.now(), data })
    );
  } catch {
    // Storage can be full or unavailable (private mode). Caching is optional.
  }
}
