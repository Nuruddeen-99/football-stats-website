import { Fragment, useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Loader from "../components/Loader";
import { fetchFootballApi } from "../api/football";
import { getFlagForCountry } from "../utils/flags";
import { readCache, writeCache } from "../utils/cache";
import "../css/teaminfo.css";

const POSITION_ORDER = ["Goalkeeper", "Defender", "Midfielder", "Attacker"];

const dash = (value) =>
  value === null || value === undefined || value === "" ? "–" : value;

function TeamInfo() {
  const { teamId } = useParams();
  const [team, setTeam] = useState(null);
  const [coach, setCoach] = useState(null);
  const [players, setPlayers] = useState([]);
  const [flag, setFlag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const controller = new AbortController();
    let cancelled = false;

    setLoading(true);
    setError(null);

    (async () => {
      try {
        const teamKey = `team-info-${teamId}`;
        const coachKey = `team-coach-${teamId}`;
        const squadKey = `team-squad-${teamId}`;

        const cachedTeam = readCache(teamKey);
        const cachedCoach = readCache(coachKey);
        const cachedSquad = readCache(squadKey);

        const settled = await Promise.allSettled([
          cachedTeam
            ? Promise.resolve(cachedTeam)
            : fetchFootballApi(`/teams?id=${teamId}`, {
                signal: controller.signal,
              }).then((response) => response?.[0] || null),
          cachedCoach
            ? Promise.resolve(cachedCoach)
            : fetchFootballApi(`/coachs?team=${teamId}`, {
                signal: controller.signal,
              }).then((response) => response?.[0] || null),
          cachedSquad
            ? Promise.resolve(cachedSquad)
            : fetchFootballApi(`/players/squads?team=${teamId}`, {
                signal: controller.signal,
              }).then((response) => response?.[0]?.players || []),
        ]);

        if (cancelled) return;

        const valueOf = (result, fallback) =>
          result.status === "fulfilled" ? result.value : fallback;

        const teamData = valueOf(settled[0], null);
        const coachData = valueOf(settled[1], null);
        const squadData = valueOf(settled[2], []);

        if (!teamData) {
          const reason = settled[0].reason;
          setError(
            reason?.name === "AbortError"
              ? null
              : reason?.message || "This team could not be found."
          );
          return;
        }

        if (!cachedTeam) writeCache(teamKey, teamData);
        if (!cachedCoach && coachData) writeCache(coachKey, coachData);
        if (!cachedSquad) writeCache(squadKey, squadData);

        setTeam(teamData);
        setCoach(coachData);
        setPlayers(Array.isArray(squadData) ? squadData : []);

        const countryFlag = await getFlagForCountry(teamData?.team?.country);
        if (!cancelled) setFlag(countryFlag);
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;
        setError(err.message || "Failed to fetch team information.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [teamId]);

  if (loading) return <Loader label="Loading team information…" />;

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

  if (!team) return null;

  const squadSections = POSITION_ORDER.map((position) => ({
    position,
    players: players.filter((player) => player.position === position),
  })).filter((section) => section.players.length > 0);

  return (
    <div className="team-page">
      <div className="page-header-row">
        <div className="league-identity">
          <img src={team.team.logo} alt="" className="league-identity-logo" />
          <div>
            <h1>{team.team.name}</h1>
            <p>
              {team.team.country || "Club"} · Founded {dash(team.team.founded)}
            </p>
          </div>
        </div>
      </div>

      <div className="info-grid" style={{ marginBottom: "1.5rem" }}>
        <div className="info-card">
          <span className="info-title">Country</span>
          <span className="info-value">
            {flag && <img src={flag} alt="" loading="lazy" />}
            {dash(team.team.country)}
          </span>
        </div>
        <div className="info-card">
          <span className="info-title">Founded</span>
          <span className="info-value">{dash(team.team.founded)}</span>
        </div>
        <div className="info-card">
          <span className="info-title">City</span>
          <span className="info-value">{dash(team.venue?.city)}</span>
        </div>
        <div className="info-card">
          <span className="info-title">Stadium</span>
          <span className="info-value">{dash(team.venue?.name)}</span>
        </div>
        <div className="info-card">
          <span className="info-title">Capacity</span>
          <span className="info-value">
            {team.venue?.capacity ? team.venue.capacity.toLocaleString("en-GB") : "–"}
          </span>
        </div>
        <div className="info-card">
          <span className="info-title">Address</span>
          <span className="info-value">{dash(team.venue?.address)}</span>
        </div>
      </div>

      {team.venue?.image && (
        <figure className="stadium-card">
          <img
            src={team.venue.image}
            alt={`${team.venue.name || "Stadium"} exterior`}
            loading="lazy"
          />
        </figure>
      )}

      <h2 className="section-title" style={{ marginTop: "1.5rem" }}>
        Coach
      </h2>
      {coach ? (
        <div className="table-card" style={{ borderRadius: "0 0 12px 12px" }}>
          <Link to={`/coach-stats/${coach.id}`} className="person-row">
            <img
              src={coach.photo || "/logos/defaultimg.png"}
              alt=""
              className="person-image"
              loading="lazy"
            />
            <div className="person-details">
              <span className="person-name">{coach.name}</span>
              <span className="person-meta">
                {coach.age ? `Age ${coach.age}` : "Age unknown"} ·{" "}
                {coach.nationality || "Nationality unknown"}
              </span>
            </div>
            <i className="fa-solid fa-chevron-right entity-chevron" aria-hidden="true" />
          </Link>
        </div>
      ) : (
        <div className="empty-state" style={{ borderRadius: "0 0 12px 12px" }}>
          No coach information available.
        </div>
      )}

      <h2 className="section-title" style={{ marginTop: "1.5rem" }}>
        Squad {players.length > 0 && <span className="section-count">{players.length}</span>}
      </h2>
      {squadSections.length > 0 ? (
        <div className="table-card" style={{ borderRadius: "0 0 12px 12px" }}>
          <div className="table-scroll">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Player</th>
                  <th className="num hide-sm">Number</th>
                  <th className="num">Age</th>
                </tr>
              </thead>
              <tbody>
                {squadSections.map((section) => (
                  <Fragment key={section.position}>
                    <tr className="table-section-row">
                      <td colSpan="3">{section.position}s</td>
                    </tr>
                    {section.players.map((player) => (
                      <tr key={player.id}>
                        <td>
                          <Link
                            to={`/player-stats/${player.id}`}
                            className="table-link table-player-cell"
                          >
                            <img
                              src={player.photo || "/logos/defaultimg.png"}
                              alt=""
                              loading="lazy"
                            />
                            <span>{player.name}</span>
                          </Link>
                        </td>
                        <td className="num hide-sm">{dash(player.number)}</td>
                        <td className="num">{dash(player.age)}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="empty-state" style={{ borderRadius: "0 0 12px 12px" }}>
          No squad information available.
        </div>
      )}
    </div>
  );
}

export default TeamInfo;
