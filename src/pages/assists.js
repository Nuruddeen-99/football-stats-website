import PlayerLeaderboard from "../components/PlayerLeaderboard";

function Assists() {
  return (
    <PlayerLeaderboard
      endpoint="topassists"
      cachePrefix="top-assists"
      statLabel="Assists"
      getStat={(stats) => stats.goals?.assists ?? 0}
    />
  );
}

export default Assists;
