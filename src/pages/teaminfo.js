import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/header";
import "../css/teaminfo.css";

function TeamInfo() {
  const apiKey = process.env.REACT_APP_API_KEY;
  const { teamId } = useParams();
  const [teamData, setTeamData] = useState(null);
  const [teamCoach, setTeamCoach] = useState(null);
  const [players, setPlayers] = useState([]);
  const [flag, setFlag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
  
    const fetchTeamInfo = async () => {
        try {
          const cachedTeamData = sessionStorage.getItem(`teamData-${teamId}`);
          if (cachedTeamData) {
              setTeamData(JSON.parse(cachedTeamData));
              const countryCode = await getCountryCode(JSON.parse(cachedTeamData)?.team?.country);
              setFlag(getFlagUrl(countryCode));
              setLoading(false);
              return;
          }
            const response = await fetch(`https://v3.football.api-sports.io/teams?id=${teamId}`, {
                method: "GET",
                headers: { 'x-apisports-key': apiKey }
            });
            const data = await response.json();
            if (data.response.length > 0) {
                const teamData = data.response[0];
                setTeamData(teamData);
                const countryCode = await getCountryCode(teamData?.team?.country);
                setFlag(getFlagUrl(countryCode));
                sessionStorage.setItem(`teamData-${teamId}`, JSON.stringify(teamData));
            }
            if (Object.keys(data.errors).length > 0) {
              console.log("Errors found: ");
              for (const [key, value] of Object.entries(data.errors)) {
                  console.log(`${key}: ${value}`);
              }
            }
        } catch (err) {
            console.error(err);
            setError("Failed to fetch team info");
        } finally {
            setLoading(false);
        }
    };
    fetchTeamInfo();//eslint-disable-next-line
}, [teamId]); 

useEffect(() => {
  const cachedCoachData = sessionStorage.getItem(`teamCoach-${teamId}`);
  if (cachedCoachData) {
      setTeamCoach(JSON.parse(cachedCoachData));
      setLoading(false);
      return;
  }

  const fetchTeamCoach = async () => {
      try {
          const response = await fetch(`https://v3.football.api-sports.io/coachs?team=${teamId}`, {
              method: "GET",
              headers: { 'x-apisports-key': apiKey }
          });
          const data = await response.json();
          if (data.response.length > 0) {
              setTeamCoach(data.response[0]);
              sessionStorage.setItem(`teamCoach-${teamId}`, JSON.stringify(data.response[0]));
          }
          if (Object.keys(data.errors).length > 0) {
            console.log("Errors found: ");
            for (const [key, value] of Object.entries(data.errors)) {
                console.log(`${key}: ${value}`);
            }
          }
      } catch (err) {
          console.error(err);
          setError("Failed to fetch coach info");
      } finally {
          setLoading(false);
      }
  };
  fetchTeamCoach();//eslint-disable-next-line
}, [teamId]); 

useEffect(() => {
  const cachedPlayersData = sessionStorage.getItem(`players-${teamId}`);
  if (cachedPlayersData) {
      setPlayers(JSON.parse(cachedPlayersData));
      setLoading(false);
      return;
  }

  const fetchPlayers = async () => {
      try {
          const response = await fetch(`https://v3.football.api-sports.io/players/squads?team=${teamId}`, {
              method: "GET",
              headers: { 'x-apisports-key': apiKey }
          });
          const data = await response.json();
          if (data.response.length > 0) {
              const reversedPlayers = data.response[0].players.reverse() || [];
              setPlayers(reversedPlayers);
              sessionStorage.setItem(`players-${teamId}`, JSON.stringify(reversedPlayers));
          }
          if (Object.keys(data.errors).length > 0) {
            console.log("Errors found: ");
            for (const [key, value] of Object.entries(data.errors)) {
                console.log(`${key}: ${value}`);
            }
          }
      } catch (err) {
        console.error(err);
          setError("Failed to fetch players");
      } finally {
          setLoading(false);
      }
  };
  fetchPlayers();//eslint-disable-next-line
}, [teamId]); 

const getCountryCode = async (countryName) => {
  if (countryName.toLowerCase() === "england"){
      return "gb-eng";
  } else if (countryName.toLowerCase() === "europe"){
      return "eur";
  } else if (countryName.toLowerCase() === "world"){
      return "world";
  } else if(countryName.toLowerCase() === "south-america"){
      return "sam";
  } else if (countryName.toLowerCase() === "africa"){
      return "afr";
  } else if (countryName.toLowerCase() === "nc-america"){
      return "ncam";
  } else if (countryName.toLowerCase() === "asia"){
      return "asia";
  }
  try {
      const response = await fetch(`https://restcountries.com/v3.1/name/${countryName}?fields=cca2`);
      const data = await response.json();
      return data[0]?.cca2.toLowerCase(); // Convert to lowercase for API-FOOTBALL
  } catch (error) {
      console.error(`Error fetching country code for ${countryName}:`, error);
      return null;
  }
};

const getFlagUrl = (countryCode) => {
  if (countryCode === "eur"){
      return `/logos/uefa.png`;
  } else if (countryCode === "world"){
      return `/logos/world.png`;
  } else if (countryCode === "sam"){
      return `/logos/conmebol.png`;
  } else if (countryCode === "afr"){
      return `/logos/caf.png`;
  } else if (countryCode === "ncam"){
      return `/logos/concacaf.png`;
  } else if (countryCode === "asia"){
      return `/logos/afc.png`;
  } else {
      return `https://media.api-sports.io/flags/${countryCode}.svg`
  }
};

function playerClick(id) {
    navigate(`/player-stats/${id}`);
  }
function coachClick(id) {
    navigate(`/coach-stats/${id}`);
  }

  return (
    <div>
      <Header />
      {loading ? (
                <div className="loader"></div>
            ) : error ? (
                <p style={{ color: "red", marginLeft: "30px", fontSize: "larger" }}>{error}</p>
            ) : (
      <div className="team-p">
        {teamData && (
          <>
            <div className="wg_header wg_text_center" style={{ borderRadius: "0px 0px 15px 15px" }}>
              <img className="wg_flag" alt={teamData.team.name} src={teamData.team.logo} />
              {teamData.team.name}
            </div>
            <center><img style={{ width: '40%' }} alt="Stadium" src={teamData.venue.image} /></center>
            <div className="info-grid">
              <span style={{ gridColumn: "1 / -1", fontWeight: 'bold' }}>Info</span>
              <div className="info-item"><span className="info-title">Founded in</span><span className="info-value">{teamData.team.founded}</span></div>
              <div className="info-item">
                <span className="info-title">Country</span>
                <span className="info-value">
                  {flag && <img src={flag} alt="Country flag" className="wg_flag"/>}
                  {teamData.team.country}
                  </span>
              </div>
              <div className="info-item"><span className="info-title">City</span><span className="info-value">{teamData.venue.city}</span></div>
              <div className="info-item"><span className="info-title">Stadium</span><span className="info-value">{teamData.venue.name}</span></div>
              <div className="info-item"><span className="info-title">Address</span><span className="info-value">{teamData.venue.address}</span></div>
              <div className="info-item"><span className="info-title">Capacity</span><span className="info-value">{teamData.venue.capacity}</span></div>
            </div>
          </>
        )}
        <br />
        <table>
          <tbody>
          <tr className="position-row">
            <td className="p-title">Coach</td>
          </tr>
          {teamCoach && (
            <tr>
              <td className="p-info" onClick={() => coachClick(teamCoach.id)}>
                <img src={teamCoach.photo} alt="Coach" className="p-img" />
                <div className="p-details">
                  <span className="p-name">{teamCoach.name}</span>
                  <span className="p-meta">Age {teamCoach.age} &nbsp; {teamCoach.nationality}</span>
                </div>
              </td>
            </tr>
          )}
          </tbody>
        </table>
        <br />
        <table>
        <thead>
          <tr className="wg_header">
            <th colSpan="4" className="wg_text_center">Players</th>
          </tr>
        </thead>
        <tbody>
          {["Attacker", "Midfielder", "Defender", "Goalkeeper"].map(position => (
            players.some(player => player.position === position) && (
              <React.Fragment key={position}>
                <tr className="position-row">
                  <td colSpan="4" className="p-title">{position + "s"}</td>
                </tr>
                {players
                  .filter(player => player.position === position)
                  .map(player => (
                    <tr key={player.id} style={{ backgroundColor: '#00141e' }}>
                      <td className="p-info" onClick={() => playerClick(player.id)}>
                        <img src={player.photo} alt={player.name} className="p-img" loading="lazy"/>
                        <div className="p-details">
                          <span className="p-name">{player.name}</span>
                          <span className="p-meta">No.{player.number || '-'} &nbsp;&nbsp; Age {player.age} &nbsp;</span>
                        </div>
                      </td>
                    </tr>
                  ))}
              </React.Fragment>
            )
          ))}
        </tbody>
      </table>
        <br />
      </div>
      )}
    </div>
  );
}

export default TeamInfo;