import PlayerLeaderboard from "../components/PlayerLeaderboard";

function YellowCards() {
  return (
    <PlayerLeaderboard
      endpoint="topyellowcards"
      cachePrefix="top-yellow-cards"
      statLabel="Yellow cards"
      getStat={(stats) => stats.cards?.yellow ?? 0}
    />
  );
}

export default YellowCards;
