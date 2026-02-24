import { useParams } from "react-router-dom";

function Standings() {
  const apiKey = process.env.REACT_APP_API_KEY;
  const { id, newSeason } = useParams();

  return (
    <>
      <api-sports-widget
        data-type="config"
        data-key={apiKey}
        data-sport="football"
        data-lang="en"
        data-theme="dark"
        data-show-logos="true"
        data-show-errors="true"
      ></api-sports-widget>

      <api-sports-widget
        key={`${id}-${newSeason}`}
        data-type="standings"
        data-league={id}
        data-season={newSeason}
        data-target-team="modal"
      ></api-sports-widget>
    </>
  );
}

export default Standings;