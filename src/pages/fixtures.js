import Header from "../components/header";

function Fixtures() {
  const apiKey = process.env.REACT_APP_API_KEY;
  return <>
<Header/>
<api-sports-widget data-type="config"
  data-key={apiKey}
  data-sport="football"
  data-lang="en"
  data-theme="dark"
  data-show-logos="true"
  data-show-errors="true"
  data-target-game="modal"
  data-target-team="modal"
  data-target-player="modal"
  data-target-league="modal"
></api-sports-widget>
<api-sports-widget data-type="games" id="wg-api-football-games"></api-sports-widget>
  </>;
}
export default Fixtures;