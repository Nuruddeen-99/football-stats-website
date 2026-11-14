import { Fragment, useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import Loader from "../components/Loader";
import SeasonSelect from "../components/SeasonSelect";
import TrophyList from "../components/TrophyList";
import { fetchFootballApi } from "../api/football";
import { getFlagForCountry } from "../utils/flags";
import { readCache, writeCache } from "../utils/cache";
import { CURRENT_SEASON } from "../data/seasons";
import "../css/playerstats.css";

const dash = (value) =>
  value === null || value === undefined || value === "" ? "–" : value;

function formatTransferDate(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString || "Unknown date";

  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function PlayerStats() {
  const { playerId, newSeason } = useParams();
  const navigate = useNavigate();

  const selectedSeason = newSeason || CURRENT_SEASON;

  const [profile, setProfile] = useState(null);
  const [flag, setFlag] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profileError, setProfileError] = useState(null);

  const [playerData, setPlayerData] = useState(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState(null);

  const [transfers, setTransfers] = useState([]);
  const [currentTeam, setCurrentTeam] = useState(null);
  const [loadingTransfers, setLoadingTransfers] = useState(true);
  const [transfersError, setTransfersError] = useState(null);

  const [trophies, setTrophies] = useState([]);
  const [loadingTrophies, setLoadingTrophies] = useState(true);
  const [trophiesError, setTrophiesError] = useState(null);

  // Player profile (identity, nationality, shirt number…)
  useEffect(() => {
    const cacheKey = `player-profile-${playerId}`;
    const cached = readCache(cacheKey);

    if (cached) {
      setProfile(cached);
      setProfileError(null);
      setLoadingProfile(false);
      getFlagForCountry(cached?.player?.nationality).then(setFlag);
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;

    setLoadingProfile(true);
    setProfileError(null);

    (async () => {
      try {
        const response = await fetchFootballApi(
          `/players/profiles?player=${playerId}`,
          { signal: controller.signal }
        );

        if (cancelled) return;

        const data = response?.[0] || null;
        setProfile(data);

        if (data) {
          writeCache(cacheKey, data);
          const countryFlag = await getFlagForCountry(data?.player?.nationality);
          if (!cancelled) setFlag(countryFlag);
        }
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;
        setProfileError(err.message || "Failed to load this player's profile.");
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [playerId]);

  // Season statistics
  useEffect(() => {
    const cacheKey = `player-stats-${playerId}-${selectedSeason}`;
    const cached = readCache(cacheKey);

    if (cached) {
      setPlayerData(cached);
      setStatsError(null);
      setLoadingStats(false);
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;

    setLoadingStats(true);
    setStatsError(null);
    setPlayerData(null);

    (async () => {
      try {
        const response = await fetchFootballApi(
          `/players?id=${playerId}&season=${selectedSeason}`,
          { signal: controller.signal }
        );

        if (cancelled) return;

        const data = response?.[0] || null;
        setPlayerData(data);
        if (data) writeCache(cacheKey, data);
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;
        setStatsError(err.message || "Failed to load season statistics.");
      } finally {
        if (!cancelled) setLoadingStats(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [playerId, selectedSeason]);

  // Transfer history (also used to derive the current club)
  useEffect(() => {
    const cacheKey = `player-transfers-${playerId}`;
    const cached = readCache(cacheKey);

    if (cached) {
      setTransfers(cached.transfers || []);
      setCurrentTeam(cached.currentTeam || null);
      setTransfersError(null);
      setLoadingTransfers(false);
      return undefined;
    }

    const controller = new AbortController();
    let cancelled = false;

    setLoadingTransfers(true);
    setTransfersError(null);

    (async () => {
      try {
        const response = await fetchFootballApi(`/transfers?player=${playerId}`, {
          signal: controller.signal,
        });

        if (cancelled) return;

        const allTransfers = Array.isArray(response?.[0]?.transfers)
          ? response[0].transfers
          : [];

        const sorted = [...allTransfers].sort(
          (a, b) => new Date(b.date) - new Date(a.date)
        );

        const latestTeam = sorted[0]?.teams?.in || null;

        setTransfers(sorted);
        setCurrentTeam(latestTeam);
        writeCache(cacheKey, { transfers: sorted, currentTeam: latestTeam });
      } catch (err) {
        if (cancelled || err.name === "AbortError") return;
        setTransfers([]);
        setTransfersError(err.message || "Failed to load transfer history.");
      } finally {
        if (!cancelled) setLoadingTransfers(false);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [playerId]);

  // Trophies
  useEffect(() => {
    const cacheKey = `player-trophies-${playerId}`;
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
        const response = await fetchFootballApi(`/trophies?player=${playerId}`, {
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
  }, [playerId]);

  const handleSeasonChange = (event) => {
    const nextSeason = event.target.value;
    navigate(`/player-stats/${playerId}/${nextSeason}`, { replace: true });
  };

  if (loadingProfile) return <Loader label="Loading player profile…" />;

  if (profileError) {
    return (
      <div>
        <div className="alert" role="alert">
          <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
          <span>{profileError}</span>
        </div>
        <div className="flex-center" style={{ marginTop: "1rem" }}>
          <Link to="/players" className="btn-secondary">
            <i className="fa-solid fa-arrow-left" aria-hidden="true" />
            Back to player search
          </Link>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="empty-state">
        This player could not be found.{" "}
        <Link to="/players" style={{ color: "var(--accent-green)" }}>
          Search again
        </Link>
      </div>
    );
  }

  const player = profile.player || {};
  const stats = playerData?.statistics?.[0] || null;
  const displayTeam = currentTeam || stats?.team || null;
  const displayName =
    [player.firstname, player.lastname].filter(Boolean).join(" ") || player.name;

  const statSections = stats
    ? [
        {
          title: "Appearances",
          rows: [
            ["Appearances", stats.games?.appearences],
            ["Minutes played", stats.games?.minutes],
            ["Position", stats.games?.position],
            ["Rating", stats.games?.rating],
          ],
        },
        {
          title: "Attacking",
          rows: [
            ["Goals", stats.goals?.total],
            ["Assists", stats.goals?.assists],
            ["Shots", stats.shots?.total],
            ["Shots on target", stats.shots?.on],
            ["Dribble attempts", stats.dribbles?.attempts],
            ["Successful dribbles", stats.dribbles?.success],
          ],
        },
        {
          title: "Passing",
          rows: [
            ["Total passes", stats.passes?.total],
            ["Key passes", stats.passes?.key],
            ["Pass accuracy", stats.passes?.accuracy ? `${stats.passes.accuracy}%` : null],
          ],
        },
        {
          title: "Defending",
          rows: [
            ["Tackles", stats.tackles?.total],
            ["Blocks", stats.tackles?.blocks],
            ["Interceptions", stats.tackles?.interceptions],
            ["Duels won", stats.duels?.won],
            ["Fouls drawn", stats.fouls?.drawn],
            ["Fouls committed", stats.fouls?.committed],
          ],
        },
        {
          title: "Discipline",
          rows: [
            ["Yellow cards", stats.cards?.yellow],
            ["Red cards", stats.cards?.red],
            ["Penalties scored", stats.penalty?.scored],
            ["Penalties missed", stats.penalty?.missed],
          ],
        },
      ]
    : [];

  return (
    <div>
      <div className="page-header-row">
        <div className="player-identity">
          <img
            src={player.photo || "/logos/defaultimg.png"}
            alt=""
            className="player-avatar"
            loading="lazy"
            onError={(event) => {
              event.currentTarget.onerror = null;
              event.currentTarget.src = "/logos/defaultimg.png";
            }}
          />
          <div className="identity-names">
            <h1>{displayName}</h1>
            <p>
              {player.position || stats?.games?.position || "Player"}
              {player.nationality ? ` · ${player.nationality}` : ""}
            </p>
          </div>
        </div>

        <div className="team-actions">
          <SeasonSelect value={selectedSeason} onChange={handleSeasonChange} />
        </div>
      </div>

      <div className="info-grid">
        <div className="info-card">
          <span className="info-title">Nationality</span>
          <span className="info-value">
            {flag && <img src={flag} alt="" loading="lazy" />}
            {dash(player.nationality)}
          </span>
        </div>
        <div className="info-card">
          <span className="info-title">Age / Birthday</span>
          <span className="info-value">
            {dash(player.age)}
            {player.birth?.date ? ` · ${formatTransferDate(player.birth.date)}` : ""}
          </span>
        </div>
        <div className="info-card">
          <span className="info-title">Height / Weight</span>
          <span className="info-value">
            {dash(player.height)} / {dash(player.weight)}
          </span>
        </div>
        <div className="info-card">
          <span className="info-title">Shirt number</span>
          <span className="info-value">{dash(player.number)}</span>
        </div>
        <div className="info-card">
          <span className="info-title">Current team</span>
          <span className="info-value">
            {displayTeam ? (
              <>
                {displayTeam.logo && (
                  <img src={displayTeam.logo} alt="" className="crest" loading="lazy" />
                )}
                {displayTeam.name}
              </>
            ) : (
              "–"
            )}
          </span>
        </div>
      </div>

      <h2 className="section-title" style={{ marginTop: "1.5rem" }}>
        Season {selectedSeason} statistics
      </h2>

      {loadingStats ? (
        <div className="section-body">
          <Loader label="Loading season statistics…" />
        </div>
      ) : statsError ? (
        <div className="section-body">
          <div className="alert" role="alert">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            <span>{statsError}</span>
          </div>
        </div>
      ) : !stats ? (
        <div className="section-body">
          <div className="empty-state" style={{ border: "none", background: "transparent" }}>
            No statistics are available for the {selectedSeason} season.
          </div>
        </div>
      ) : (
        <div className="table-card" style={{ borderRadius: "0 0 12px 12px" }}>
          <div className="league-banner">
            {stats.team?.logo && <img src={stats.team.logo} alt="" loading="lazy" />}
            <div>
              <h2>{stats.team?.name || "Club"}</h2>
              <p>
                {stats.league?.name || "League"} · {selectedSeason}
              </p>
            </div>
          </div>

          <div className="table-scroll">
            <table className="stats-table">
              <thead>
                <tr>
                  <th>Statistic</th>
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {statSections.map((section) => (
                  <Fragment key={section.title}>
                    <tr className="table-section-row">
                      <td colSpan="2">{section.title}</td>
                    </tr>
                    {section.rows.map(([label, value]) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td className="num">{dash(value)}</td>
                      </tr>
                    ))}
                  </Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <h2 className="section-title" style={{ marginTop: "1.5rem" }}>
        Transfer history
      </h2>
      {loadingTransfers ? (
        <div className="section-body">
          <Loader label="Loading transfers…" />
        </div>
      ) : transfersError ? (
        <div className="section-body">
          <div className="alert" role="alert">
            <i className="fa-solid fa-triangle-exclamation" aria-hidden="true" />
            <span>{transfersError}</span>
          </div>
        </div>
      ) : transfers.length === 0 ? (
        <div className="section-body">
          <div className="empty-state" style={{ border: "none", background: "transparent" }}>
            No transfer history available.
          </div>
        </div>
      ) : (
        <div className="transfer-list">
          {transfers.map((transfer, index) => (
            <article className="transfer-card" key={`${transfer.date}-${index}`}>
              <div className="transfer-card-head">
                <span>{formatTransferDate(transfer.date)}</span>
                <span className="chip">{transfer.type || "Transfer"}</span>
              </div>
              <div className="transfer-teams">
                <div className="transfer-team">
                  <img
                    src={transfer.teams?.out?.logo || "/logos/defaultimg.png"}
                    alt=""
                    loading="lazy"
                  />
                  <span>{transfer.teams?.out?.name || "Unknown club"}</span>
                </div>
                <i className="fa-solid fa-arrow-right-long transfer-arrow" aria-hidden="true" />
                <div className="transfer-team">
                  <img
                    src={transfer.teams?.in?.logo || "/logos/defaultimg.png"}
                    alt=""
                    loading="lazy"
                  />
                  <span>{transfer.teams?.in?.name || "Unknown club"}</span>
                </div>
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

export default PlayerStats;
