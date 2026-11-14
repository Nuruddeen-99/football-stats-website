import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { fetchFootballApi } from "../api/football";
import { CURRENT_SEASON } from "../data/seasons";
import "../css/teams.css";

const MAX_RESULTS = 8;
const teamCache = new Map();
const teamDetailsCache = new Map();

const UNKNOWN_DETAILS = {
  league: { id: null, name: "Unknown league", logo: null },
  country: { name: null, flag: null },
};

async function fetchTeamDetails(teamId) {
  if (!teamId) return UNKNOWN_DETAILS;
  if (teamDetailsCache.has(teamId)) return teamDetailsCache.get(teamId);

  try {
    const competitions = await fetchFootballApi(`/leagues?team=${teamId}`);
    const leagues = (competitions || []).filter(
      (competition) => competition.league?.type === "League"
    );

    const homeCountry = competitions?.[0]?.country?.name;
    const domestic =
      leagues.find((competition) => competition.country?.name === homeCountry) ||
      leagues[0];

    const details = domestic
      ? {
          league: {
            id: domestic.league?.id ?? null,
            name: domestic.league?.name || "Unknown league",
            logo: domestic.league?.logo || null,
          },
          country: {
            name: domestic.country?.name || null,
            flag: domestic.country?.flag || null,
          },
        }
      : UNKNOWN_DETAILS;

    teamDetailsCache.set(teamId, details);
    return details;
  } catch {
    // A missing league entry should not break the whole search.
    return UNKNOWN_DETAILS;
  }
}

function Teams() {
  const [searchTerm, setSearchTerm] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const requestRef = useRef(0);

  const handleSearch = async (event) => {
    event.preventDefault();

    const query = searchTerm.trim();
    if (!query) {
      requestRef.current += 1;
      setLoading(false);
      setTeams([]);
      setError(null);
      setSearched(false);
      return;
    }

    const cacheKey = query.toLowerCase();

    if (teamCache.has(cacheKey)) {
      requestRef.current += 1;
      setTeams(teamCache.get(cacheKey));
      setLoading(false);
      setError(null);
      setSearched(true);
      return;
    }

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setLoading(true);
    setError(null);
    setTeams([]);
    setSearched(true);

    try {
      const results = await fetchFootballApi(
        `/teams?name=${encodeURIComponent(query)}`
      );

      const enriched = await Promise.all(
        (results || []).slice(0, MAX_RESULTS).map(async (entry) => {
          const details = await fetchTeamDetails(entry.team?.id);
          return { ...entry, ...details };
        })
      );

      if (requestRef.current !== requestId) return;

      const validTeams = enriched.filter(
        (entry) => entry.team?.id && entry.league?.id
      );

      if (!validTeams.length) {
        setError(`No teams found for “${query}”. Try another name.`);
        return;
      }

      teamCache.set(cacheKey, validTeams);
      setTeams(validTeams);
    } catch (err) {
      if (requestRef.current !== requestId) return;
      setError(err.message || "Failed to fetch teams. Please try again.");
    } finally {
      if (requestRef.current === requestId) setLoading(false);
    }
  };

  return (
    <div>
      <section className="search-hero">
        <h1>Find a football club</h1>
        <p>Search by club name to view squad, form and season statistics.</p>
        <form className="search-form-row" onSubmit={handleSearch}>
          <label htmlFor="team-search" className="sr-only">
            Club name
          </label>
          <input
            id="team-search"
            type="search"
            className="input-search"
            placeholder="e.g. Arsenal, Real Madrid…"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button type="submit" className="btn-primary">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            Search
          </button>
        </form>
      </section>

      {loading && <Loader label="Searching for clubs…" />}

      {!loading && error && (
        <div className="alert" role="alert">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && teams.length > 0 && (
        <>
          <div className="results-head">
            <h2>Results</h2>
            <span>
              {teams.length} {teams.length === 1 ? "club" : "clubs"}
            </span>
          </div>

          <div className="entity-list">
            {teams.map((entry) => (
              <Link
                key={entry.team.id}
                to={`/team-stats/${entry.league.id}/${CURRENT_SEASON}/${entry.team.id}`}
                className="entity-card"
              >
                <img
                  src={entry.team.logo || "/logos/defaultimg.png"}
                  alt=""
                  className="entity-logo"
                  loading="lazy"
                />
                <div className="entity-main">
                  <span className="entity-name">{entry.team.name}</span>
                  <div className="entity-meta">
                    {entry.country.name && (
                      <span>
                        {entry.country.flag && (
                          <img
                            src={entry.country.flag}
                            alt=""
                            className="flag"
                            loading="lazy"
                          />
                        )}
                        {entry.country.name}
                      </span>
                    )}
                    {entry.league.name && (
                      <span>
                        {entry.league.logo && (
                          <img src={entry.league.logo} alt="" loading="lazy" />
                        )}
                        {entry.league.name}
                      </span>
                    )}
                  </div>
                </div>
                <i
                  className="fa-solid fa-chevron-right entity-chevron"
                  aria-hidden="true"
                />
              </Link>
            ))}
          </div>
        </>
      )}

      {!loading && !error && !searched && (
        <div className="empty-state">
          <i
            className="fa-solid fa-shield-halved"
            aria-hidden="true"
            style={{ fontSize: "1.5rem", marginBottom: "0.5rem", display: "block" }}
          />
          Start typing a club name to see results.
        </div>
      )}
    </div>
  );
}

export default Teams;
