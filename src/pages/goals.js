import PlayerLeaderboard from "../components/PlayerLeaderboard";

function Goals() {
  return (
    <PlayerLeaderboard
      endpoint="topscorers"
      cachePrefix="top-scorers"
      statLabel="Goals"
      getStat={(stats) => {
        const goals = stats.goals?.total ?? 0;
        const penalties = stats.penalty?.scored ?? 0;
        return penalties > 0 ? `${goals} (${penalties})` : goals;
      }}
    />
  );
}

export default Goals;
