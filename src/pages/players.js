import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/players.css';
import Header from '../components/header';

const Players = () => {
  const apiKey = process.env.REACT_APP_API_KEY;
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getCountryCode = async (countryName) => {
    if (countryName.toLowerCase() === "england") return "gb-eng";
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
    return countryCode ? `https://media.api-sports.io/flags/${countryCode}.svg` : null;
};

  const fetchPlayers = async () => {
    const cachedPlayers = sessionStorage.getItem(`players_${searchTerm.toLowerCase().trim()}`);
    if (cachedPlayers) {
        setPlayers(JSON.parse(cachedPlayers));
        setLoading(false);
        return;
    }

    setLoading(true);
    setError("");
    setPlayers([]);

    try {
        const response = await fetch(
            `https://v3.football.api-sports.io/players/profiles?search=${searchTerm}`,
            {
                method: "GET",
                headers: {
                    "x-rapidapi-host": "v3.football.api-sports.io",
                    "x-apisports-key": apiKey,
                },
            }
        );

        if (!response.ok) throw new Error("Failed to fetch data.");

        const data = await response.json();
        if (!data.response || data.response.length === 0) {
            setError("No players found. Try another name.");
        } else {
            const normalizedSearch = searchTerm.toLowerCase().trim();
            const searchParts = normalizedSearch.split(/\s+/); // Split search term into words

            const playerWithDetails = await Promise.all(
                data.response.map(async (Obj) => {
                    const fullName = `${Obj.player?.firstname || ""} ${Obj.player?.lastname || ""}`.toLowerCase();
                    const nameParts = fullName.split(/\s+/); // Split player's name into words

                    // Check if all parts of the search term exist in the player's name (order doesn't matter)
                    const matches = searchParts.every(part => 
                        nameParts.some(name => name.includes(part))
                    );

                    if (!matches) {
                        return null; // Ignore players who don't match
                    }
                    const nationality = Obj.player?.nationality || "";
                    const countryCode = nationality ? await getCountryCode(nationality) : null;
                    const flagUrl = getFlagUrl(countryCode);

                    return {
                        ...Obj,
                        nationality,
                        flagUrl,
                    };
                })
            );
            // Ensure filtering before slicing
            const filteredPlayers = playerWithDetails.filter((player) => player !== null);
            sessionStorage.setItem(`players_${searchTerm.toLowerCase().trim()}`, JSON.stringify(filteredPlayers));
            setPlayers(filteredPlayers);

            if (Object.keys(data.errors).length > 0) {
              console.log("Errors found: ");
              for (const [key, value] of Object.entries(data.errors)) {
                  console.log(`${key}: ${value}`);
              }
            }
        }
    } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch players. Please try again.");
        setPlayers([]);
    }
    setLoading(false);
};

  const handleClick = (playerId) => {
    navigate(`/player-stats/${playerId}`);
  }; 

  return (
    <div>
      <Header />
      <h2 className="ht">Search for a Player</h2><br/>
      <input
        id='search'
        type="text"
        placeholder="Enter player name..."
        title="Enter full name to narrow down search"
        className="search"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && fetchPlayers()}
      />
      <br /><br/>
      <button className="sbtn" onClick={fetchPlayers}>Search</button>
      <br /><br />

      {loading && <div className="loader"></div>}
      {error && <p style={{ color: "red", marginLeft: "20px", fontSize: "larger" }}>{error}</p>}
      <br />

      {/* Display Players */}
      <div className="players-list-table">
  {players?.length > 0 ? (
    players.map((Obj) => (
      <div
        key={Obj.player?.id}
        className="player-row"
        onClick={() => handleClick(Obj.player?.id)}
        style={{ cursor: "pointer" }}
      >
        <img
          src={Obj.player?.photo || "/logos/defaultimg.png"}
          alt={Obj.player?.name}
          className="player-image"
        />
        <span className="playr-name">
          {Obj.player?.firstname} {Obj.player?.lastname}
        </span>
        <span className="player-position">{Obj.player?.position}</span>
        <span className="player-nationality">
          {Obj.flagUrl && (
            <img
              src={Obj.flagUrl}
              alt={`${Obj.nationality} flag`}
              className="country-flag"
            />
          )}{" "}
          {Obj.nationality}
        </span>
        <span className="player-age">Age: {Obj.player?.age}</span>
      </div>
    ))
  ) : (
    <p></p>
  )}
</div>
    </div>
  );
};

export default Players;
