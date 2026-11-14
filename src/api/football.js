const API_BASE = "https://v3.football.api-sports.io";
const API_KEY = process.env.REACT_APP_API_KEY;

function extractErrorMessage(errors) {
  if (!errors) return "";
  if (Array.isArray(errors)) return errors.filter(Boolean).join(", ");
  if (typeof errors === "object") {
    return Object.values(errors).filter(Boolean).join(", ");
  }
  return String(errors);
}

/**
 * Fetch a resource from API-Football and return its `response` payload.
 * Throws a readable Error for HTTP failures and API-level error objects.
 */
export async function fetchFootballApi(path, options = {}) {
  if (!API_KEY) {
    throw new Error(
      "Missing API key. Add REACT_APP_API_KEY to your .env file and restart the app."
    );
  }

  const response = await fetch(`${API_BASE}${path}`, {
    method: "GET",
    headers: { "x-apisports-key": API_KEY },
    signal: options.signal,
  });

  if (!response.ok) {
    throw new Error(`API request failed (HTTP ${response.status}).`);
  }

  const data = await response.json();
  const message = extractErrorMessage(data?.errors);

  if (message) throw new Error(message);

  return data?.response ?? [];
}
