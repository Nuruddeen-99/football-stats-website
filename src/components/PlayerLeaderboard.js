import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loader from "./Loader";
import { fetchFootballApi } from "../api/football";
import { readCache, writeCache } from "../utils/cache";

function PlayerLeaderboard({ endpoint, statLabel, getStat, cachePrefix }) {
  const { id, season } = useParams();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const cacheKey = `${cachePrefix}-${id}-${season}`;
    const cached = readCache(cacheKey);

    if (cached) {
      setRows(cached);
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
          `/players/${endpoint}?league=${id}&season=${season}`,
          { signal: controller.signal }
        );

        if (cancelled) return;

        const list = Array.isArray(data) ? data : [];
        setRows(list);
        writeCache(cacheKey, list);
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;
        setRows([]);
        setError(err.message || "Unable to load this leaderboard right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [endpoint, cachePrefix, id, season]);

  if (loading) return <Loader label="Loading leaderboard…" />;

  if (error) {
    return (
      <div className="alert" role="alert">
        <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
        <span>{error}</span>
      </div>
    );
  }

  if (!rows.length) {
    return (
      <div className="empty-state">
        <i className="fa-regular fa-futbol" aria-hidden="true" style={{ fontSize: "1.5rem", marginBottom: "0.5rem", display: "block" }} />
        No {statLabel.toLowerCase()} data is available for this season.
      </div>
    );
  }

  const league = rows[0]?.statistics?.[0]?.league;

  return (
    <div className="table-card">
      <div className="league-banner">
        {league?.logo && <img src={league.logo} alt="" loading="lazy" />}
        <div>
          <h2>{league?.name || "League"}</h2>
          <p>
            {statLabel} · Season {season}
          </p>
        </div>
      </div>

      <div className="table-scroll">
        <table className="stats-table">
          <thead>
            <tr>
              <th className="num rank">#</th>
              <th>Player</th>
              <th className="hide-sm">Team</th>
              <th className="num">{statLabel}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((entry, index) => {
              const player = entry.player;
              const stats = entry.statistics?.[0];
              if (!player || !stats) return null;

              return (
                <tr key={player.id || index}>
                  <td className={`num rank rank-${index + 1}`}>{index + 1}</td>
                  <td>
                    <Link
                      to={`/player-stats/${player.id}/${season}`}
                      className="table-link table-player-cell"
                      title={`View ${player.name} profile`}
                    >
                      <img
                        src={player.photo || "/logos/defaultimg.png"}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.src = "/logos/defaultimg.png";
                        }}
                      />
                      <span>{player.name}</span>
                    </Link>
                  </td>
                  <td className="hide-sm">
                    <Link
                      to={`/team-stats/${stats.league?.id}/${season}/${stats.team?.id}`}
                      className="table-link table-team-cell"
                      title={`View ${stats.team?.name} stats`}
                    >
                      <img
                        src={stats.team?.logo}
                        alt=""
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.visibility = "hidden";
                        }}
                      />
                      <span>{stats.team?.name}</span>
                    </Link>
                  </td>
                  <td className="num">{getStat(stats)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PlayerLeaderboard;
