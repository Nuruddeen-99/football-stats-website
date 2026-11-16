import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import Loader from "../components/Loader";
import { fetchFootballApi } from "../api/football";
import { getFlagForCountry } from "../utils/flags";
import { readCache, writeCache } from "../utils/cache";
import { CURRENT_SEASON } from "../data/seasons";
import "../css/players.css";

const MAX_RESULTS = 20;

function matchesSearch(player, query) {
  const haystack = `${player?.firstname || ""} ${player?.lastname || ""} ${
    player?.name || ""
  }`.toLowerCase();

  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((part) => haystack.includes(part));
}

function Players() {
  const [searchTerm, setSearchTerm] = useState("");
  const [players, setPlayers] = useState([]);
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
      setPlayers([]);
      setError(null);
      setSearched(false);
      return;
    }

    const cacheKey = `players-search-${query.toLowerCase()}`;
    const cached = readCache(cacheKey);

    if (cached) {
      requestRef.current += 1;
      setPlayers(cached);
      setLoading(false);
      setError(null);
      setSearched(true);
      return;
    }

    const requestId = requestRef.current + 1;
    requestRef.current = requestId;

    setLoading(true);
    setError(null);
    setPlayers([]);
    setSearched(true);

    try {
      const results = await fetchFootballApi(
        `/players/profiles?search=${encodeURIComponent(query)}`
      );

      const matched = (results || [])
        .filter((entry) => entry.player?.id && matchesSearch(entry.player, query))
        .slice(0, MAX_RESULTS);

      const withFlags = await Promise.all(
        matched.map(async (entry) => ({
          ...entry,
          flagUrl: entry.player?.nationality
            ? await getFlagForCountry(entry.player.nationality)
            : null,
        }))
      );

      if (requestRef.current !== requestId) return;

      if (!withFlags.length) {
        setError(`No players found for “${query}”. Try the full name.`);
        return;
      }

      writeCache(cacheKey, withFlags);
      setPlayers(withFlags);
    } catch (err) {
      if (requestRef.current !== requestId) return;
      setError(err.message || "Failed to fetch players. Please try again.");
    } finally {
      if (requestRef.current === requestId) setLoading(false);
    }
  };

  return (
    <div>
      <section className="search-hero">
        <h1>Find a player</h1>
        <p>
          Search by name to see season statistics, transfer history and
          trophies. Full names give the best results.
        </p>
        <form className="search-form-row" onSubmit={handleSearch}>
          <label htmlFor="player-search" className="sr-only">
            Player name
          </label>
          <input
            id="player-search"
            type="search"
            className="input-search"
            placeholder="e.g. Mohamed Salah…"
            title="Enter a full name to narrow down the search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />
          <button type="submit" className="btn-primary">
            <i className="fa-solid fa-magnifying-glass" aria-hidden="true" />
            Search
          </button>
        </form>
      </section>

      {loading && <Loader label="Searching for players…" />}

      {!loading && error && (
        <div className="alert" role="alert">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <span>{error}</span>
        </div>
      )}

      {!loading && !error && players.length > 0 && (
        <>
          <div className="results-head">
            <h2>Results</h2>
            <span>
              {players.length} {players.length === 1 ? "player" : "players"}
            </span>
          </div>

          <div className="entity-list">
            {players.map((entry) => {
              const player = entry.player;

              return (
                <Link
                  key={player.id}
                  to={`/player-stats/${player.id}/${CURRENT_SEASON}`}
                  className="entity-card"
                >
                  <img
                    src={player.photo || "/logos/defaultimg.png"}
                    alt=""
                    className="entity-logo round"
                    loading="lazy"
                    onError={(event) => {
                      event.currentTarget.onerror = null;
                      event.currentTarget.src = "/logos/defaultimg.png";
                    }}
                  />
                  <div className="entity-main">
                    <span className="entity-name">
                      {player.firstname
                        ? `${player.firstname} ${player.lastname || ""}`.trim()
                        : player.name}
                    </span>
                    <div className="entity-meta">
                      {player.nationality && (
                        <span>
                          {entry.flagUrl && (
                            <img
                              src={entry.flagUrl}
                              alt=""
                              className="flag"
                              loading="lazy"
                            />
                          )}
                          {player.nationality}
                        </span>
                      )}
                      {player.age && <span>Age {player.age}</span>}
                    </div>
                  </div>
                  <i
                    className="fa-solid fa-chevron-right entity-chevron"
                    aria-hidden="true"
                  />
                </Link>
              );
            })}
          </div>
        </>
      )}

      {!loading && !error && !searched && (
        <div className="empty-state">
          <i
            className="fa-solid fa-user"
            aria-hidden="true"
            style={{ fontSize: "1.5rem", marginBottom: "0.5rem", display: "block" }}
          />
          Start typing a player name to see results.
        </div>
      )}
    </div>
  );
}

export default Players;
