import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import {
  ALL_COMPETITIONS,
  COMPETITION_GROUPS,
  getCompetitionLogo,
} from "../data/competitions";
import "../css/header.css";

const navLinkClass = ({ isActive }) => (isActive ? "nav-link active" : "nav-link");

function Header() {
  const [standingsOpen, setStandingsOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef(null);
  const location = useLocation();

  // Close every panel whenever the route changes.
  useEffect(() => {
    setStandingsOpen(false);
    setMenuOpen(false);
  }, [location.pathname]);

  // Close on outside click / Escape.
  useEffect(() => {
    if (!standingsOpen && !menuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (headerRef.current && !headerRef.current.contains(event.target)) {
        setStandingsOpen(false);
        setMenuOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setStandingsOpen(false);
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [standingsOpen, menuOpen]);

  // Warm the browser cache for league logos so the dropdown opens instantly.
  useEffect(() => {
    ALL_COMPETITIONS.forEach(({ logo }) => {
      const image = new Image();
      image.src = `/logos/${logo}`;
    });
  }, []);

  const standingsActive = location.pathname.startsWith("/standings");

  const closeMenus = () => {
    setStandingsOpen(false);
    setMenuOpen(false);
  };

  return (
    <header className="site-header" ref={headerRef}>
      <div className="site-header-inner">
        <Link to="/" className="brand" aria-label="Footy Stats home">
          <img src="/ballimg.png" alt="" width="38" height="38" />
          <span>Footy Stats</span>
        </Link>

        <button
          type="button"
          className="nav-toggle"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <i className={menuOpen ? "fa-solid fa-xmark" : "fa-solid fa-bars"} aria-hidden="true" />
        </button>

        <nav className={`site-nav ${menuOpen ? "open" : ""}`} aria-label="Main navigation">
          <ul className="nav-list">
            <li>
              <NavLink to="/" end className={navLinkClass} onClick={closeMenus}>
                News
              </NavLink>
            </li>
            <li>
              <NavLink to="/fixtures" className={navLinkClass} onClick={closeMenus}>
                Fixtures
              </NavLink>
            </li>
            <li className="dropdown">
              <button
                type="button"
                className={`nav-link nav-button ${standingsActive ? "active" : ""}`}
                aria-expanded={standingsOpen}
                aria-haspopup="true"
                onClick={() => setStandingsOpen((open) => !open)}
              >
                League Standings
                <i
                  className={`fa-solid fa-chevron-${standingsOpen ? "up" : "down"}`}
                  aria-hidden="true"
                />
              </button>

              {standingsOpen && (
                <div className="dropdown-panel">
                  {Object.entries(COMPETITION_GROUPS).map(([category, leagues]) => (
                    <div className="dropdown-column" key={category}>
                      <span className="dropdown-heading">{category}</span>
                      {leagues.map((league) => (
                        <Link
                          key={league.id}
                          to={`/standings/${league.id}`}
                          className="dropdown-item"
                          onClick={closeMenus}
                        >
                          <img
                            src={getCompetitionLogo(league)}
                            alt=""
                            className="dropdown-logo"
                            loading="lazy"
                          />
                          <span>{league.name}</span>
                        </Link>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </li>
            <li>
              <NavLink to="/teams" className={navLinkClass} onClick={closeMenus}>
                Teams
              </NavLink>
            </li>
            <li>
              <NavLink to="/players" className={navLinkClass} onClick={closeMenus}>
                Players
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  );
}

export default Header;
