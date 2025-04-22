import React, { useState, useEffect } from 'react';
import Header from '../components/header';
import '../css/api-football.css';
import '../css/standings.css';
import { useParams, useNavigate } from 'react-router-dom';

function Standings() {
  const apiKey = process.env.REACT_APP_API_KEY;
  const { id, newSeason } = useParams(); // Get the ID and newSeason from the URL
  const navigate = useNavigate();
  const [season, setSeason] = useState('2023'); // Set default season
  const cacheKey = `standingsWidget-${id}-${newSeason || season}`;
  // eslint-disable-next-line
  const [isCached, setIsCached] = useState(false);

  useEffect(() => {
    const widgetContainer = document.getElementById('wg-api-football-standings');
    const cachedHTML = sessionStorage.getItem(cacheKey);

    if (cachedHTML) {
      widgetContainer.innerHTML = cachedHTML;
      setIsCached(true);
      widgetContainer.classList.remove('wg_loader');
    } else {
      const script = document.createElement('script');
      script.src = 'https://widgets.api-sports.io/2.0.3/widgets.js';
      script.type = 'module';
      script.async = true;
      document.body.appendChild(script);

      const observer = new MutationObserver(() => {
        sessionStorage.setItem(cacheKey, widgetContainer.innerHTML);
      });

      observer.observe(widgetContainer, { childList: true, subtree: true });

      return () => {
        observer.disconnect();
        document.body.removeChild(script);
      };
    }
  }, [cacheKey]);

  // Update the season from URL or state whenever the season changes
  useEffect(() => {
    if (newSeason) {
      setSeason(newSeason);
    }
  }, [newSeason]);

  // Update season and navigate to new URL when the select option changes
  const handleSeasonChange = (e) => {
    const selectedSeason = e.target.value;
    setSeason(selectedSeason);
    navigate(`/standings/${id}/${selectedSeason}`, { replace: true });
    window.location.reload();
  };

  return (
  <div>
    <Header />
    <div className="sl" style={{ position: 'absolute', top: '95px', right: '160px', zIndex: '1' }}>
      <label htmlFor="season-select">Season:</label>
      <select
        id="season-select"
        value={season}
        onChange={handleSeasonChange}  // Handle season change directly
      >
        <option value="2023">2023</option>
        <option value="2022">2022</option>
        <option value="2021">2021</option>
      </select>
    </div>
<br/>
    <div className="container">
      <div className="vertical-gridbox">
          <div className="title">Category</div>
          <div className="grid-item active">
            Standings
          </div>
          <div className="grid-item" onClick={() => navigate(`/standings/${id}/${newSeason || season}/goals`)}>
            Top scorers
          </div>
          <div className="grid-item" onClick={() => navigate(`/standings/${id}/${newSeason || season}/assists`)}>
            Assists
          </div>
          <div className="grid-item" onClick={() => navigate(`/standings/${id}/${newSeason || season}/yellow-cards`)}>
            Yellow Cards
          </div>
          <div className="grid-item" onClick={() => navigate(`/standings/${id}/${newSeason || season}/red-cards`)}>
            Red Cards
          </div>
      </div>
    
      <div
        id="wg-api-football-standings"
        data-host="v3.football.api-sports.io"
        data-key={apiKey}
        data-league={id}
        data-season={newSeason || season}  // Use newSeason from URL if available
        data-theme="false"
        data-show-errors="false"
        data-show-logos="true"
        className="wg_loader"
      >
      </div>
    </div>
  </div>
  );
}

export default Standings;
