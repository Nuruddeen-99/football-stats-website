import { useParams } from "react-router-dom";
import ApiSportsWidget from "../components/ApiSportsWidget";
import { CURRENT_SEASON } from "../data/seasons";

function Standings() {
  const apiKey = process.env.REACT_APP_API_KEY;
  const { id, season } = useParams();

  const currentSeason = season || CURRENT_SEASON;

  return (
    <>
      <api-sports-widget
        data-type="config"
        data-key={apiKey}
        data-sport="football"
        data-lang="en"
        data-theme="blue"
        data-show-logos="true"
        data-show-error="true"
        data-target-team="modal"
      />

      <ApiSportsWidget
        key={`${id}-${currentSeason}`}
        label="Loading standings…"
        attributes={{
          "data-type": "standings",
          id: "wg-api-football-standings",
          "data-league": id,
          "data-season": currentSeason,
          "data-target-team": "modal",
        }}
      />
    </>
  );
}

export default Standings;
