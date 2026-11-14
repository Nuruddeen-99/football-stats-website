import { useEffect } from "react";
import { Outlet, useParams, useNavigate, NavLink, useLocation } from "react-router-dom";
import SeasonSelect from "../components/SeasonSelect";
import { CURRENT_SEASON, SEASONS } from "../data/seasons";
import { findCompetition, getCompetitionLogo } from "../data/competitions";
import "../css/standings.css";
import "../css/api-football.css";

const tabs = [
  { label: "Standings", path: "", end: true },
  { label: "Goals", path: "goals" },
  { label: "Assists", path: "assists" },
  { label: "Yellow Cards", path: "yellow-cards" },
  { label: "Red Cards", path: "red-cards" },
];

const TAB_PATHS = tabs.filter((tab) => tab.path).map((tab) => tab.path);
const isSeasonSegment = (segment) => /^\d{4}$/.test(segment || "");

function StandingsLayout() {
  const { id, season } = useParams();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const league = findCompetition(id);
  const currentSeason = season || CURRENT_SEASON;

  // The season segment is optional in the route, so both /standings/39 and
  // /standings/39/goals are valid URLs. Normalise them to include a season
  // while keeping the tab the visitor asked for.
  const pathParts = pathname.split("/").filter(Boolean);
  const seasonSegment = pathParts[2];
  const tabInUrl = isSeasonSegment(seasonSegment)
    ? pathParts[3] || ""
    : TAB_PATHS.find((path) => path === seasonSegment) || "";

  useEffect(() => {
    // Redirect missing or unsupported seasons (e.g. a stale URL asking for a
    // season the current plan cannot access) to the latest supported season.
    if (isSeasonSegment(season) && SEASONS.includes(season)) return;

    const suffix = tabInUrl ? `/${tabInUrl}` : "";
    navigate(`/standings/${id}/${CURRENT_SEASON}${suffix}`, { replace: true });
  }, [season, id, tabInUrl, navigate]);

  // Changing season keeps the active tab.
  const activeTab = tabInUrl;

  const handleSeasonChange = (event) => {
    const nextSeason = event.target.value;
    const suffix = activeTab ? `/${activeTab}` : "";
    navigate(`/standings/${id}/${nextSeason}${suffix}`);
  };

  return (
    <div>
      <div className="page-header-row">
        <div className="league-identity">
          {league && (
            <img
              src={getCompetitionLogo(league)}
              alt=""
              className="league-identity-logo"
            />
          )}
          <div>
            <h1>{league?.name || "League standings"}</h1>
            <p>Season {currentSeason}</p>
          </div>
        </div>

        <SeasonSelect value={currentSeason} onChange={handleSeasonChange} />
      </div>

      <div className="standings-grid">
        <aside className="standings-sidebar" aria-label="League sections">
          <span className="sidebar-heading">League</span>
          {tabs.map((tab) => (
            <NavLink
              key={tab.path || "standings"}
              to={
                tab.path
                  ? `/standings/${id}/${currentSeason}/${tab.path}`
                  : `/standings/${id}/${currentSeason}`
              }
              end={tab.end}
              className={({ isActive }) =>
                isActive ? "sidebar-link active" : "sidebar-link"
              }
            >
              {tab.label}
            </NavLink>
          ))}
        </aside>

        <section className="standings-content" aria-live="polite">
          <Outlet />
        </section>
      </div>
    </div>
  );
}

export default StandingsLayout;
