import ApiSportsWidget from "../components/ApiSportsWidget";
import "../css/api-football.css";

function Fixtures() {
  const apiKey = process.env.REACT_APP_API_KEY;

  return (
    <>
      <div className="page-header-row">
        <div className="league-identity">
          <div>
            <h1>Fixtures &amp; Results</h1>
            <p>Today&apos;s matches and recent results</p>
          </div>
        </div>
      </div>

      <api-sports-widget
        data-type="config"
        data-key={apiKey}
        data-sport="football"
        data-lang="en"
        data-theme="blue"
        data-show-logos="true"
        data-show-error="true"
        data-target-game="modal"
        data-target-team="modal"
        data-target-player="modal"
        data-target-league="modal"
      />

      <ApiSportsWidget
        label="Loading today's fixtures…"
        attributes={{
          "data-type": "games",
          id: "wg-api-football-games",
        }}
      />
    </>
  );
}

export default Fixtures;
