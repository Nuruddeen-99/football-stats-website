import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import TrophyList from "../components/TrophyList";
import { fetchFootballApi } from "../api/football";
import { getFlagForCountry } from "../utils/flags";
import { readCache, writeCache } from "../utils/cache";
import "../css/playerstats.css";

const dash = (value) =>
  value === null || value === undefined || value === "" ? "–" : value;

function formatDate(dateString) {
  if (!dateString) return "Unknown";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function CoachStats() {
  const { coachId } = useParams();

  const [coach, setCoach] = useState(null);
  const [flag, setFlag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [trophies, setTrophies] = useState([]);
  const [loadingTrophies, setLoadingTrophies] = useState(true);
  const [trophiesError, setTrophiesError] = useState(null);

  useEffect(() => {
    const cacheKey = `coach-info-${coachId}`;
    const cached = readCache(cacheKey);

    if (cached) {
      setCoach(cached);
      setError(null);
      setLoading(false);
      getFlagForCountry(cached?.nationality).then(setFlag);
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const response = await fetchFootballApi(`/coachs?id=${coachId}`, {
          signal: controller.signal,
        });

        if (cancelled) return;

        const data = response?.[0] || null;

        if (!data) {
          setError("This coach could not be found.");
          return;
        }

        setCoach(data);
        writeCache(cacheKey, data);

        const countryFlag = await getFlagForCountry(data?.nationality);
        if (!cancelled) setFlag(countryFlag);
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;
        setError(err.message || "Failed to load coach information.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [coachId]);

  useEffect(() => {
    const cacheKey = `coach-trophies-${coachId}`;
    const cached = readCache(cacheKey);

    if (cached) {
      setTrophies(cached);
      setTrophiesError(null);
      setLoadingTrophies(false);
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;

    setLoadingTrophies(true);
    setTrophiesError(null);

    (async () => {
      try {
        const response = await fetchFootballApi(`/trophies?coach=${coachId}`, {
          signal: controller.signal,
        });

        const winners = (response || []).filter(
          (trophy) =>
            trophy.place === "Winner" && String(trophy.season ?? "").trim()
        );

        const withFlags = await Promise.all(
          winners.map(async (trophy) => ({
            ...trophy,
            flagUrl: trophy.country
              ? await getFlagForCountry(trophy.country)
              : null,
          }))
        );

        if (cancelled) return;

        setTrophies(withFlags);
        writeCache(cacheKey, withFlags);
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;
        setTrophies([]);
        setTrophiesError(err.message || "Failed to load trophies.");
      } finally {
        if (!cancelled) setLoadingTrophies(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [coachId]);

  if (loading) return <Loader label="Loading coach profile…" />;

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

  if (!coach) return null;

  const name =
    [coach.firstname, coach.lastname].filter(Boolean).join(" ") || coach.name;
  const career = [...(coach.career || [])].sort(
    (a, b) => new Date(b.start) - new Date(a.start)
  );

  return (
    <div className="coach-page">
      <div className="page-header-row">
        <div className="player-identity">
          <img
            src={coach.photo || "/logos/defaultimg.png"}
            alt=""
            className="player-avatar"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/logos/defaultimg.png";
            }}
          />
          <div className="identity-names">
            <h1>{name}</h1>
            <p>Coach{coach.nationality ? ` · ${coach.nationality}` : ""}</p>
          </div>
        </div>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <span className="info-title">Age / Birthday</span>
          <span className="info-value">
            {dash(coach.age)}
            {coach.birth?.date ? ` · ${formatDate(coach.birth.date)}` : ""}
          </span>
        </div>
        <div className="info-card">
          <span className="info-title">Birthplace</span>
          <span className="info-value">
            {[coach.birth?.place, coach.birth?.country].filter(Boolean).join(", ") || "–"}
          </span>
        </div>
        <div className="info-card">
          <span className="info-title">Nationality</span>
          <span className="info-value">
            {flag && <img src={flag} alt="" loading="lazy" />}
            {dash(coach.nationality)}
          </span>
        </div>
        <div className="info-card">
          <span className="info-title">Height / Weight</span>
          <span className="info-value">
            {dash(coach.height)} / {dash(coach.weight)}
          </span>
        </div>
        <div className="info-card">
          <span className="info-title">Current team</span>
          <span className="info-value">
            {coach.team ? (
              <Link
                to={`/team-info/${coach.team.id}`}
                className="table-link table-team-cell"
              >
                <img src={coach.team.logo} alt="" className="crest" loading="lazy" />
                <span>{coach.team.name}</span>
              </Link>
            ) : (
              "–"
            )}
          </span>
        </div>
      </div>

      <h2 className="section-title" style={{ marginTop: "1.5rem" }}>
        Career history
      </h2>
      {career.length === 0 ? (
        <div className="section-body">
          <div className="empty-state" style={{ border: "none", background: "transparent" }}>
            No career history available.
          </div>
        </div>
      ) : (
        <div className="transfer-list">
          {career.map((job, index) => (
            <article className="transfer-card" key={`${job.team?.id || index}-${job.start}`}>
              <div className="transfer-card-head">
                <span>
                  {formatDate(job.start)} – {job.end ? formatDate(job.end) : "Present"}
                </span>
              </div>
              <div className="transfer-team">
                {job.team?.logo ? (
                  <img src={job.team.logo} alt="" loading="lazy" />
                ) : (
                  <i className="fa-solid fa-shield-halved" aria-hidden="true" />
                )}
                <span>{job.team?.name || "Unknown club"}</span>
              </div>
            </article>
          ))}
        </div>
      )}

      <h2 className="section-title" style={{ marginTop: "1.5rem" }}>
        Trophies won
      </h2>
      <TrophyList
        trophies={trophies}
        loading={loadingTrophies}
        error={trophiesError}
      />
    </div>
  );
}

export default CoachStats;
