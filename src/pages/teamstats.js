import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import SeasonSelect from "../components/SeasonSelect";
import { fetchFootballApi } from "../api/football";
import { readCache, writeCache } from "../utils/cache";
import { CURRENT_SEASON } from "../data/seasons";
import "../css/teamstats.css";

const dash = (value) => (value === null || value === undefined ? "–" : value);

function sumCardTotals(cards) {
  if (!cards) return 0;
  return Object.values(cards).reduce(
    (total, period) => total + (period?.total || 0),
    0
  );
}

function FormBadges({ form }) {
  if (!form) {
    return <span style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>No recent form</span>;
  }

  // The API returns the full season's form (up to 38 matches). Showing all of
  // them overflows the banner, so keep the five most recent results.
  const recentForm = form.slice(-5);

  return (
    <div className="form-badges" aria-label={`Recent form: ${recentForm.split("").join(" ")}`}>
      {recentForm.split("").map((result, index) => (
        <span
          key={`${result}-${index}`}
          className={`form-badge ${
            result === "W" ? "badge-win" : result === "D" ? "badge-draw" : "badge-loss"
          }`}
        >
          {result}
        </span>
      ))}
    </div>
  );
}

function Teamstats() {
  const { leagueid, newSeason, teamId } = useParams();
  const navigate = useNavigate();

  const selectedSeason = newSeason || CURRENT_SEASON;

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cacheKey = `team-stats-${teamId}-${leagueid}-${selectedSeason}`;
    const cached = readCache(cacheKey);

    if (cached) {
      setStats(cached);
      setError(null);
      setLoading(false);
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const data = await fetchFootballApi(
          `/teams/statistics?league=${leagueid}&season=${selectedSeason}&team=${teamId}`,
          { signal: controller.signal }
        );

        if (cancelled) return;

        setStats(data || null);
        if (data) writeCache(cacheKey, data);
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;
        setStats(null);
        setError(err.message || "Failed to fetch team statistics.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [leagueid, teamId, selectedSeason]);

  const handleSeasonChange = (event) => {
    const nextSeason = event.target.value;
    navigate(`/team-stats/${leagueid}/${nextSeason}/${teamId}`, { replace: true });
  };

  if (loading) return <Loader label="Loading team statistics…" />;

  if (error) {
    return (
      <div>
        <div className="alert" role="alert">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <span>{error}</span>
        </div>
        <div className="flex-center" style={{ marginTop: "1rem" }}>
          <Link to="/teams" className="btn-secondary">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            Back to team search
          </Link>
        </div>
      </div>
    );
  }

  if (!stats?.fixtures) {
    return (
      <div className="empty-state">
        No statistics are available for this team in season {selectedSeason}.
      </div>
    );
  }

  const { team, league, fixtures, goals, penalty, failed_to_score, clean_sheet, cards, form } =
    stats;

  return (
    <div className="team-page">
      <div className="page-header-row">
        <div className="league-identity">
          {team?.logo && <img src={team.logo} alt="" className="league-identity-logo" />}
          <div>
            <h1>{team?.name || "Team"}</h1>
            <p>
              {league?.name || "League"} · Season {selectedSeason}
            </p>
          </div>
        </div>

        <div className="team-actions">
          <SeasonSelect value={selectedSeason} onChange={handleSeasonChange} />
          <Link to={`/team-info/${teamId}`} className="btn-secondary">
            <i className="fa-solid fa-circle-info" aria-hidden="true" />
            Team info
          </Link>
        </div>
      </div>

      <div className="table-card">
        <div className="league-banner">
          {league?.logo && <img src={league.logo} alt="" loading="lazy" />}
          <div style={{ flex: 1, minWidth: 0 }}>
            <h2>{league?.name || "League"}</h2>
            <p>
              {league?.country || "Season"} · {selectedSeason}
            </p>
          </div>
          <FormBadges form={form} />
        </div>

        <div className="table-scroll">
          <table className="stats-table">
            <thead>
              <tr>
                <th>Statistic</th>
                <th className="num">Home</th>
                <th className="num">Away</th>
                <th className="num">All</th>
              </tr>
            </thead>

            <tbody>
              <tr className="table-section-row">
                <td colSpan="4">Results</td>
              </tr>
              {[
                ["Games played", fixtures.played],
                ["Wins", fixtures.wins],
                ["Draws", fixtures.draws],
                ["Losses", fixtures.loses],
              ].map(([label, values]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td className="num">{dash(values?.home)}</td>
                  <td className="num">{dash(values?.away)}</td>
                  <td className="num">{dash(values?.total)}</td>
                </tr>
              ))}

              <tr className="table-section-row">
                <td colSpan="4">Goals</td>
              </tr>
              {[
                ["Goals for", goals?.for?.total],
                ["Goals for average", goals?.for?.average],
                ["Goals against", goals?.against?.total],
                ["Goals against average", goals?.against?.average],
              ].map(([label, values]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td className="num">{dash(values?.home)}</td>
                  <td className="num">{dash(values?.away)}</td>
                  <td className="num">{dash(values?.total)}</td>
                </tr>
              ))}
              <tr>
                <td>Failed to score</td>
                <td className="num">{dash(failed_to_score?.home)}</td>
                <td className="num">{dash(failed_to_score?.away)}</td>
                <td className="num">{dash(failed_to_score?.total)}</td>
              </tr>
              <tr>
                <td>Clean sheets</td>
                <td className="num">{dash(clean_sheet?.home)}</td>
                <td className="num">{dash(clean_sheet?.away)}</td>
                <td className="num">{dash(clean_sheet?.total)}</td>
              </tr>

              <tr className="table-section-row">
                <td colSpan="4">Penalties &amp; discipline</td>
              </tr>
              <tr>
                <td>Penalties scored</td>
                <td className="num" colSpan="3">
                  {dash(penalty?.scored?.total)}
                </td>
              </tr>
              <tr>
                <td>Penalties missed</td>
                <td className="num" colSpan="3">
                  {dash(penalty?.missed?.total)}
                </td>
              </tr>
              <tr>
                <td>Yellow cards</td>
                <td className="num" colSpan="3">
                  {sumCardTotals(cards?.yellow)}
                </td>
              </tr>
              <tr>
                <td>Red cards</td>
                <td className="num" colSpan="3">
                  {sumCardTotals(cards?.red)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default Teamstats;
