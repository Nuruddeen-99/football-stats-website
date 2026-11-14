import { useMemo } from "react";
import Loader from "./Loader";

function TrophyList({ trophies = [], loading, error }) {
  const grouped = useMemo(() => {
    const map = new Map();

    trophies.forEach((trophy) => {
      const key = trophy.league || "Unknown competition";
      if (!map.has(key)) {
        map.set(key, {
          league: key,
          flagUrl: trophy.flagUrl,
          country: trophy.country,
          seasons: [],
        });
      }
      if (trophy.season) map.get(key).seasons.push(trophy.season);
    });

    return Array.from(map.values());
  }, [trophies]);

  if (loading) {
    return (
      <div className="section-body">
        <Loader label="Loading trophies…" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="section-body">
        <div className="alert" role="alert">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <span>{error}</span>
        </div>
      </div>
    );
  }

  if (!grouped.length) {
    return (
      <div className="section-body">
        <div
          className="empty-state"
          style={{ border: "none", background: "transparent" }}
        >
          <i
            className="fa-solid fa-trophy"
            aria-hidden="true"
            style={{ fontSize: "1.5rem", marginBottom: "0.5rem", display: "block" }}
          />
          No trophies won yet.
        </div>
      </div>
    );
  }

  return (
    <div className="trophy-grid">
      {grouped.map((trophy) => (
        <article className="trophy-card" key={trophy.league}>
          <div className="trophy-card-head">
            {trophy.flagUrl && (
              <img src={trophy.flagUrl} alt="" loading="lazy" />
            )}
            <div>
              <h3>{trophy.league}</h3>
              <p>
                {trophy.country || "International"} · {trophy.seasons.length}{" "}
                {trophy.seasons.length === 1 ? "title" : "titles"}
              </p>
            </div>
          </div>
          <div className="chips">
            {trophy.seasons.map((season, index) => (
              <span className="chip" key={`${season}-${index}`}>
                {season}
              </span>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}

export default TrophyList;
