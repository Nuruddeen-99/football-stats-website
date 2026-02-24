import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function Standings() {
  const apiKey = process.env.REACT_APP_API_KEY;
  const { id, season } = useParams();
  const navigate = useNavigate();
    
  useEffect(() => {
    if (!season) {
      navigate(`/standings/${id}/2024`, { replace: true });
    }
  }, [season, id, navigate]);

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
        data-type="standings"
        key={`${id}-${season}`}
        data-league={id}
        data-season={season}
        data-target-team="modal"
      />
    </>
  );
}

export default Standings;