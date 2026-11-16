import { useEffect, useMemo, useRef, useState } from "react";
import Loader from "./Loader";

function TrophyCard({ trophy }) {
  const titleRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = titleRef.current;
    if (!el) return undefined;

    const measure = () => setIsTruncated(el.scrollWidth > el.clientWidth + 1);

    measure();

    const raf = window.requestAnimationFrame(measure);
    window.addEventListener("resize", measure);

    let observer;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(measure);
      observer.observe(el);
    }

    // Custom fonts can change the rendered width after mount.
    if (document.fonts?.ready) {
      document.fonts.ready.then(measure).catch(() => {});
    }

    return () => {
      window.cancelAnimationFrame(raf);
      window.removeEventListener("resize", measure);
      observer?.disconnect();
    };
  }, [trophy.league]);

  return (
    <article className="trophy-card">
      <div className="trophy-card-head">
        {trophy.flagUrl && (
          <img src={trophy.flagUrl} alt="" loading="lazy" />
        )}
        <div
          className="trophy-card-title"
          {...(isTruncated ? { "data-tooltip": trophy.league } : {})}
        >
          <h3 ref={titleRef}>{trophy.league}</h3>
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
  );
}

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
        <TrophyCard trophy={trophy} key={trophy.league} />
      ))}
    </div>
  );
}

export default TrophyList;
