import { Outlet, useParams, useNavigate, NavLink  } from "react-router-dom";
import { useEffect } from "react";
import Header from "../components/header";
import "../css/standings.css";
import "../css/api-football.css";

function StandingsLayout() {
  const { id, newSeason } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    if (!newSeason) {
      navigate(`/standings/${id}/2024`, { replace: true });
    }
  }, [id, newSeason, navigate]);

  const currentSeason = newSeason;

  if (!currentSeason) return null;

  return (
    <div>
      <Header />

      <div className="sl" style={{ position: "absolute", top: "102px", right: "160px", zIndex: "1" }}>
        <label htmlFor="season-select">Season:</label>
        <select
          id="season-select"
          value={currentSeason}
          onChange={(e) =>
            navigate(`/standings/${id}/${e.target.value}`)
          }
        >
          <option value="2024">2024</option>
          <option value="2023">2023</option>
          <option value="2022">2022</option>
        </select>
      </div>

      <div className="container">
        <div className="vertical-gridbox">
          <div className="title">Category</div>

        <NavLink
            to=""
            end
            className={({ isActive }) =>
                isActive ? "grid-item act" : "grid-item"
            }
            >
            Standings
        </NavLink>

        <NavLink
            to="goals"
            className={({ isActive }) =>
                isActive ? "grid-item act" : "grid-item"
            }
            >
            Goals
        </NavLink>

        <NavLink
            to="assists"
            className={({ isActive }) =>
                isActive ? "grid-item act" : "grid-item"
            }
            >
            Assists
        </NavLink>

        <NavLink
            to="yellow-cards"
            className={({ isActive }) =>
                isActive ? "grid-item act" : "grid-item"
            }
            >
            Yellow Cards
        </NavLink>

        <NavLink
            to="red-cards"
            className={({ isActive }) =>
                isActive ? "grid-item act" : "grid-item"
            }
            >
            Red Cards
        </NavLink>
        </div>

        <div className="content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

export default StandingsLayout;