const CURRENT_YEAR = new Date().getFullYear();

// API-Football's free plan only exposes seasons 2022–2024. Defaulting to the
// newest season the free plan can serve keeps every page populated out of the
// box; paid-plan users can override it with REACT_APP_DEFAULT_SEASON or pick a
// newer season from the season dropdown.
const FREE_PLAN_LATEST_SEASON = 2024;
const FREE_PLAN_EARLIEST_SEASON = 2022;

const configuredSeason = process.env.REACT_APP_DEFAULT_SEASON;

export const CURRENT_SEASON = String(
  configuredSeason || Math.min(CURRENT_YEAR, FREE_PLAN_LATEST_SEASON)
);

// Only offer seasons the configured plan can actually serve. Asking the
// standings widget for 2021/2025/2026 on a free key makes the widget log
// "Error fetching standings", so hide those options instead.
const latestSeason = Number(CURRENT_SEASON);
const earliestSeason = configuredSeason
  ? latestSeason - 5
  : FREE_PLAN_EARLIEST_SEASON;

export const SEASONS = Array.from(
  { length: Math.max(1, latestSeason - earliestSeason + 1) },
  (_, index) => String(latestSeason - index)
);
