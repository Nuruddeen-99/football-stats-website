import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import "../css/teams.css";

const Teams = () => {
  const apiKey = process.env.REACT_APP_API_KEY;
  const [searchTerm, setSearchTerm] = useState("");
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const teamCache = new Map();
  const teamDetailsCache = new Map();


  const navigate = useNavigate();

  const fetchTeams = async () => {

    const cachedTeams = teamCache.get(searchTerm.toLowerCase().trim());
if (cachedTeams) {
    setTeams(cachedTeams);
    setLoading(false);
    return;
}
    if (!searchTerm.trim()) return; // Prevent empty search
  
    setLoading(true);
    setError("");
    setTeams([]); // Clear previous results
  
    try {
      const response = await fetch(
        `https://v3.football.api-sports.io/teams?name=${searchTerm}`,
        {
          method: "GET",
          headers: {
            "x-apisports-key": apiKey,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch data. Check API key and permissions.");
      }
  
      const data = await response.json();
  
      if (!data.response || data.response.length === 0) {
        setError("No teams found. Try another name.");
      } else {
        const teamsWithDetails = await Promise.all(
          data.response.map(async (teamObj) => {
            const teamId = teamObj.team?.id;
            const details = await fetchTeamDetails(teamId); // Fetch league & country details
            return {
              ...teamObj,
              league: details.league, // Store league
              country: details.country, // Store country details
            };
          })
        );
        teamCache.set(searchTerm.toLowerCase().trim(), teamsWithDetails);
        setTeams(teamsWithDetails);
        if (Object.keys(data.errors).length > 0) {
          console.log("Errors found: ");
          for (const [key, value] of Object.entries(data.errors)) {
              console.log(`${key}: ${value}`);
          }
        }
      }
    } catch (err) {
      console.error("Failed to fetch teams ",err);
      setError("Failed to fetch teams. Please try again.");
    }
  
    setLoading(false);
  };

  const fetchTeamDetails = async (teamId) => {
    const cachedDetails = teamDetailsCache.get(teamId);
if (cachedDetails) {
    return cachedDetails;
}
    try {
      const response = await fetch(
        `https://v3.football.api-sports.io/leagues?team=${teamId}`,
        {
          method: "GET",
          headers: {
            "x-apisports-key": apiKey,
          },
        }
      );
  
      if (!response.ok) {
        throw new Error("Failed to fetch team details.");
      }
  
      const data = await response.json();
      if (!data.response || data.response.length === 0) {
        return { league: { name: "Unknown", logo: null }, country: { name: "Unknown", flag: null } };
      }
  
      // 1️⃣ Filter only league competitions (exclude cups & non-domestic leagues)
      const leagueCompetitions = data.response.filter(
        (comp) => comp.league.type === "League" // API marks league competitions as "League"
      );
  
      // 2️⃣ Sort by ranking (to prioritize top-tier leagues)
      leagueCompetitions.sort((a, b) => a.league.id - b.league.id); // Adjust sorting logic if needed
  
      // 3️⃣ Pick the highest-ranked domestic league
      const domesticLeague = leagueCompetitions.find(
        (comp) => comp.country.name === data.response[0].country.name // Match team's country
      ) || leagueCompetitions[0]; // Fallback to the first available league
  
      teamDetailsCache.set(teamId, {
        league: {
            id: domesticLeague?.league?.id || "unknown",
            name: domesticLeague?.league?.name || "N/A",
            logo: domesticLeague?.league?.logo || null,
        },
        country: {
            name: domesticLeague?.country?.name || "Unknown",
            flag: domesticLeague?.country?.flag || null,
        }
    });
    if (Object.keys(data.errors).length > 0) {
      console.log("Errors found: ");
      for (const [key, value] of Object.entries(data.errors)) {
          console.log(`${key}: ${value}`);
      }
    }
      return {
        league: {
          id: domesticLeague?.league?.id || "unknown",
          name: domesticLeague?.league?.name || "N/A",
          logo: domesticLeague?.league?.logo || null,
        },
        country: {
          name: domesticLeague?.country?.name || "Unknown",
          flag: domesticLeague?.country?.flag || null,
        },
      };
    } catch (err) {
      console.error("Error fetching team details:", err);
      return { league: { name: "Unknown", logo: null }, country: { name: "Unknown", flag: null } };
    }
  };    
  
  const handleCardClick = (teamId, leagueId) => {
    const season = 2023; // Default season
    navigate(`/team-stats/${leagueId}/${season}/${teamId}`);
  };

  return (
    <div>
      <Header />
      <h2 className="ht">Search for a Football Club</h2><br/>
      <input
        type="text"
        placeholder="Enter club name..."
        className="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && fetchTeams()}
      />
      <br /><br/>
      <button className="sbtn" onClick={fetchTeams}>Search</button><br/><br/>
      {loading && <div className="loader"></div>}
      {error && <p style={{ color: "red", marginLeft: "20px", fontSize: "larger" }}>{error}</p>}
      
      {/* Display Teams */}
      <div className="teams-list-table">
        {teams
          .filter(
            (teamObj) =>
              teamObj.team?.name !== "Unknown" &&
              teamObj.league?.name !== "Unknown" &&
              teamObj.country?.name !== "Unknown"
          )
          .map((teamObj) => (
            <div
              key={teamObj.team?.id}
              className="team-row"
              onClick={() =>
                handleCardClick(teamObj.team?.id, teamObj.league?.id)
              }
              style={{ cursor: "pointer" }}
            >
              <img
                src={teamObj.team?.logo}
                alt={`${teamObj.team?.name} logo`}
                className="team-logo"
              />
              <span className="team-name">{teamObj.team?.name}</span>
              <span className="team-league">League: &nbsp;
                {teamObj.league.logo && (
                  <img
                    src={teamObj.league.logo}
                    alt={`${teamObj.league.name} logo`}
                    className="league-icon"
                  />
                )}{" "}
                {teamObj.league.name}
              </span>
              Country: &nbsp;
              <span className="team-country">
                {teamObj.country.flag && (
                  <img
                    src={teamObj.country.flag}
                    alt={`${teamObj.country.name} flag`}
                    className="country-flag"
                  />
                )}{" "}
                {teamObj.country.name}
              </span>
            </div>
          ))}
      </div>
   </div>
  );
};

export default Teams;
