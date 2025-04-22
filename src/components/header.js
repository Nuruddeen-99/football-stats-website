import { useState, useEffect } from "react";
import "../css/header.css";

function Header() {
  const [showDropdown, setShowDropdown] = useState(false);

  const competitions = {
    Europe: [
      { name: "Premier League", logo: "epl.png", id: 39 },
      { name: "EFL Championship", logo: "efl.png", id: 40 },
      { name: "La Liga", logo: "laliga.png", id: 140 },
      { name: "Bundesliga", logo: "bundesliga.png", id: 78 },
      { name: "Serie A", logo: "seriea.png", id: 135 },
      { name: "Ligue 1", logo: "ligue1.png", id: 61 },
      { name: "Primeira Liga", logo: "primeira_liga.png", id: 94 },
      { name: "Eredivisie", logo: "erediv.png", id: 88 },
      { name: "Brasileirão", logo: "brasileirao.png", id: 71 },
    ],
    "Other Leagues": [
      { name: "MLS", logo: "mls.png", id: 253 },
      { name: "Saudi Pro League", logo: "spl.png", id: 307 },
    ],
    "International": [
      { name: "Champions League", logo: "ucl.png", id: 2 },
      { name: "Europa League", logo: "uel.png", id: 3 },
      { name: "Conference League", logo: "uecl.png", id: 848 },
    ], 
  };

  useEffect(() => {
    const logos = Object.values(competitions)
      .flat()
      .map((league) => `/logos/${league.logo}`);

    logos.forEach((src) => {
      const img = new Image();
      img.src = src;
    }); 
  }, []);// eslint-disable-line

  return (
    <nav id="h">
      {/* Logo */}
      <div style={{ display: "flex", alignItems: "center", marginLeft: "10px" }}>
        <a href="/" style={{ textDecoration: "none", color: "white", fontSize: "20px", fontWeight: "bold" }}>
          <span>FOOTY STATS</span>
        </a>
        <img src="/ballimg.png" alt="ball icon" width="40" height="40" style={{ borderRadius: "100%", marginLeft: "10px" }} />
      </div>

      {/* Navigation Links */}
      <ul>
        <li><a href="/" className="">News</a></li>
        <li><a href="/fixtures" className="">Fixtures</a></li>
        <li className="dropdown">
        <button
            className="buttn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            League Standings
            <i className={`arrow ${showDropdown ? 'up' : 'down'}`}></i>
          </button>
          {/* Dropdown Menu */}
          {showDropdown && (
            <div className="dropdown-menu">
              {Object.entries(competitions).map(([category, leagues]) => (
                <div key={category} className="dropdown-category">
                  <strong>{category}</strong>
                  {leagues.map((league) => (
                    <a key={league.id} href={`/standings/${league.id}`} data-id={league.id} className="dropdown-item">
                      <img src={`/logos/${league.logo}`} alt={league.name} className="league-logo" />
                      {league.name}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          )}
        </li>
        <li><a href="/teams" className="">Teams</a></li>
        <li><a href="/players" className="">Players</a></li>
      </ul>
    </nav>
  );
}

export default Header;
