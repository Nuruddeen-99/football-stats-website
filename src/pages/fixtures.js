import React from "react";
import Header from "../components/header";
import '../css/api-football.css';

function Fixtures() {
  const apiKey = process.env.REACT_APP_API_KEY;
  return <>
<Header/>
  <div id="wg-api-football-games"
     data-host="v3.football.api-sports.io"
     data-key={apiKey}
     data-date=""
     data-league=""
     data-season=""
     data-theme="false"
     data-refresh="15"
     data-show-toolbar="true"
     data-show-errors="false"
     data-show-logos="false"
     data-modal-game="true"
     data-modal-standings="true"
     data-modal-show-logos="true">
</div>

  </>;
}
export default Fixtures;