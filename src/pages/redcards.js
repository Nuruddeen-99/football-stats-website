import { useEffect, useState } from 'react';
import Header from '../components/header';
import "../css/standings.css";
import "../css/api-football.css";
import { useParams, useNavigate } from 'react-router-dom';

function RedCards() {
  const apiKey = process.env.REACT_APP_API_KEY;
  const { id, newSeason } = useParams(); // Get league ID and season from URL
  const [season, setSeason] = useState('2023'); // Set default season
  const [topReds, setTopReds] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const cacheKey = `topReds-${id}-${newSeason || season}`;
    const cachedData = sessionStorage.getItem(cacheKey);
  
    if (cachedData) {
      setTopReds(JSON.parse(cachedData));
      setLoading(false);
      return; 
    }
  
    const fetchTopReds = async () => {
      try {
        const response = await fetch(`https://v3.football.api-sports.io/players/topredcards?league=${id}&season=${newSeason || season}`, {
          method: 'GET',
          headers: {
            'x-apisports-key': apiKey,
          },
        });
        const data = await response.json();
  
        if (Object.keys(data.errors).length > 0) {
          console.log("Errors found:");
          for (const [key, value] of Object.entries(data.errors)) {
            console.log(`${key}: ${value}`);
          }
        }
  
        setTopReds(data.response);
        sessionStorage.setItem(cacheKey, JSON.stringify(data.response));
      } catch (error) {
        setError(error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchTopReds(); //eslint-disable-next-line
  }, [id, newSeason, season]);  

  useEffect(() => {
    if (newSeason) {
      setSeason(newSeason);
    } 
  }, [newSeason]); 

  // Update season and navigate to new URL when the select option changes
  const handleSeasonChange = (e) => {
    const selectedSeason = e.target.value;
    setSeason(selectedSeason);
    navigate(`/standings/${id}/${selectedSeason}/red-cards`, { replace: true });
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
          onChange={handleSeasonChange}
        >
          <option value="2023">2023</option>
          <option value="2022">2022</option>
          <option value="2021">2021</option>
        </select>
      </div>
      <br />
    <div className="container">
      <div className="vertical-gridbox">
          <div className="title">Category</div>
          <div className="grid-item" onClick={() => navigate(`/standings/${id}/${newSeason || season}`)}>
            Standings
          </div>
          <div className="grid-item" onClick={() => navigate(`/standings/${id}/${newSeason || season}/goals`)}>
            Goals
          </div>
          <div className="grid-item"  onClick={() => navigate(`/standings/${id}/${newSeason || season}/assists`)}>
            Assists
          </div>
          <div className="grid-item" onClick={() => navigate(`/standings/${id}/${newSeason || season}/yellow-cards`)}>
            Yellow Cards
          </div>
          <div className="grid-item active">
            Red Cards
          </div>
    </div>
      <div className='gcontent'>
      {loading ? (
                <div className="wg_loader"></div>
            ) : error ? (
                <p style={{ color: "red", marginLeft: "30px", fontSize: "larger" }}>{error}</p>
            ) : (topReds && topReds.length > 0 ) ? (
              <div><br/>
                <div>
                  <img src={topReds[0]?.statistics[0]?.league?.logo} alt="League" className='limg'/>
                  <span className='hd'>{topReds[0]?.statistics[0]?.league?.name}</span>
                </div>
              <table className='wg_table' style={{ width: "100%", marginTop: "20px" }}>
              <thead>
                <tr className='wg_header'>
                  <th className='wg_text_center' width="5%">#</th>
                  <th className='wg_text_center' width="50%">Player</th>
                  <th className='wg_text_left' width="25%">Team</th>
                  <th className='wg_text_center' width="20%">Red cards</th>
                </tr>
              </thead>
              <tbody>
                {topReds.map((playerObj, index) => {
                    const player = playerObj.player;
                    const stats = playerObj.statistics[0];
                    return (
                      <tr key={player.id} style={{ }}>
                        <td className='wg_text_center'>{index + 1}</td>
                        <td style={{cursor: 'pointer'}} onClick={() => navigate(`/player-stats/${player.id}/${newSeason || season}`)}>
                          <div style={{display: 'flex', alignItems: 'center', marginLeft: '25px'}}>
                            <img src={player.photo} alt={player.name} width="40" style={{ borderRadius: '50%' }} />
                            <span style={{ marginLeft: '15px' }}>{player.name}</span>
                          </div>
                        </td>
                        <td className='wg_text_left' style={{ cursor: 'pointer' }} onClick={() => navigate(`/team-stats/${stats.league.id}/${newSeason || season}/${stats.team.id}`)}>
                          <div style={{display: 'flex', alignItems: 'center'}}>
                            <img src={stats.team.logo} alt={stats.team.name} width="30" style={{ borderRadius: '50%' }} />
                            <span style={{ verticalAlign: 'middle', marginLeft: '15px' }}>{stats.team.name}</span>
                          </div>
                        </td>
                        <td className='wg_text_center'>{stats.cards.red}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
            </div>
          ) : (
            <p className='wg_text_center' style={{ color: 'red', alignItems: 'center' }}>
              An error occurred, please try again
            </p>
          )}
      </div>
     </div>
    </div>
    );
  }

export default RedCards;