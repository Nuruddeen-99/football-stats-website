import { useState, useEffect } from 'react';
import Header from '../components/header';
import '../css/api-football.css';
import '../css/standings.css';
import { useParams, useNavigate } from 'react-router-dom';

function Standings() {
  const apiKey = process.env.REACT_APP_API_KEY;
  const { id, newSeason } = useParams(); // Get the ID and newSeason from the URL
  const navigate = useNavigate();
  const [season, setSeason] = useState('2024'); // Set default season
  const currentSeason = newSeason || season;
 
  useEffect(() => {
  if (window?.apiSportsWidgets) {
    window.apiSportsWidgets.load();
  }
}, []);

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
  };

  return (
  <div>
    <Header />
    <div className="sl" style={{ position: 'absolute', top: '102px', right: '160px', zIndex: '1' }}>
      <label htmlFor="season-select">Season:</label>
      <select
        id="season-select"
        value={season}
        onChange={handleSeasonChange}  // Handle season change directly
      >
        <option value="2024">2024</option>
        <option value="2023">2023</option>
        <option value="2022">2022</option>
      </select>
    </div>
    <div className="container">
      <div className="vertical-gridbox">
          <div className="title">Category</div>
          <div className="grid-item act">
            Standings
          </div>
          <div className="grid-item" onClick={() => navigate(`/standings/${id}/${currentSeason}/goals`)}>
            Goals
          </div>
          <div className="grid-item" onClick={() => navigate(`/standings/${id}/${currentSeason}/assists`)}>
            Assists
          </div>
          <div className="grid-item" onClick={() => navigate(`/standings/${id}/${currentSeason}/yellow-cards`)}>
            Yellow Cards
          </div>
          <div className="grid-item" onClick={() => navigate(`/standings/${id}/${currentSeason}/red-cards`)}>
            Red Cards
          </div>
      </div>
      <div className="content">
    <api-sports-widget data-type="config"
      data-key={apiKey}
      data-sport="football"
      data-lang="en"
      data-theme="dark"
      data-show-logos="true"
      data-show-errors="true"
    ></api-sports-widget>                                        
      <api-sports-widget data-type="standings"
        key={`${id}-${currentSeason}`}
        data-league={id}
        data-season={currentSeason}
        data-target-team="modal"
      >
      </api-sports-widget>
      </div>
    </div>
  </div>
  );
}

export default Standings;
