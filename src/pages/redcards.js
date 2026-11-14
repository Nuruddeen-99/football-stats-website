import PlayerLeaderboard from "../components/PlayerLeaderboard";

function RedCards() {
  return (
    <PlayerLeaderboard
      endpoint="topredcards"
      cachePrefix="top-red-cards"
      statLabel="Red cards"
      getStat={(stats) => stats.cards?.red ?? 0}
    />
  );
}

export default RedCards;
