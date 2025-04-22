import React, { useEffect, useState } from "react";
import Header from "../components/header";
import "../css/teamstats.css";
import '../css/api-football.css';
import { useParams, useNavigate } from 'react-router-dom';

function Teamstats() {
    const apiKey = process.env.REACT_APP_API_KEY;
    const { leagueid, newSeason, teamId } = useParams();  // Extract URL parameters
    const navigate = useNavigate();
    
    const [season, setSeason] = useState("2023");  // Default season
    const [stats, setStats] = useState(null);  // Store API response
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
   
    const selectedSeason = newSeason || season;

    useEffect(() => {
        const fetchStats = async () => {
            const cacheKey = `${teamId}-${leagueid}-${selectedSeason}`;
            const cachedStats = sessionStorage.getItem(cacheKey);
    
            if (cachedStats) {
                setStats(JSON.parse(cachedStats));
                setLoading(false);
                return; 
            }
    
            setLoading(true);
            setError(null);
    
            try {
                const response = await fetch(
                    `https://v3.football.api-sports.io/teams/statistics?league=${leagueid}&season=${selectedSeason}&team=${teamId}`, 
                    {
                        method: "GET",
                        headers: {
                            "x-apisports-key": apiKey
                        }
                    }
                );
    
                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }
    
                const data = await response.json();
                sessionStorage.setItem(cacheKey, JSON.stringify(data.response)); // Store in sessionStorage
                setStats(data.response);
                if (Object.keys(data.errors).length > 0) {
                    console.log("Errors found: ");
                    for (const [key, value] of Object.entries(data.errors)) {
                        console.log(`${key}: ${value}`);
                    }
                  }
            } catch (err) {
                console.error("Failed too fetch stats ",err);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchStats();
        // eslint-disable-next-line
    }, [newSeason, leagueid, teamId]);        

    // Handle season change
    const handleSeasonChange = (event) => {
        const selectedSeason = event.target.value;
        setSeason(selectedSeason);
        navigate(`/team-stats/${leagueid}/${selectedSeason}/${teamId}`, { replace: true });
    };    

    return (
        <div>
            <Header />
            <div className="sl" style={{ position: 'absolute', top: '80px', right: '160px', zIndex: '1' }}>
                <label htmlFor="season-select">Season:</label>
                <select id="season-select" value={season} onChange={handleSeasonChange}>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                </select>
            </div>
            <div  style={{ position: 'absolute', top: '84px', left: '180px', zIndex: '1' }}>
                <span className="vti" onClick={() => navigate(`/team-info/${teamId}`)}>View Team Info</span>
            </div>

            {loading && <div className="loader"></div>}
            {error && <p style={{ color: "red", marginLeft: "20px", fontSize: "larger" }}>{error}</p>}

            {stats?.fixtures && (
                <div style={{width: "78%", margin: "0 auto"}}>
                    <table style={{ width: "100%" }}>
                    <thead>
                        <tr>
                        <td className="wg_header wg_text_center" colSpan="4">
                            <img className="wg_flag" alt={`${stats.team?.name} logo`} src={stats.team?.logo}/> 
                            {stats.team?.name}
                        </td>
                        </tr>
                        <tr>
                        <td className="wg_text_center" colSpan="4" height="70px">
                            League Season Form:<pre></pre>
                            {(stats.form ?? "").split("").map((char, index) => (
                            <span 
                                key={index} 
                                className={`wg_form ${char === "W" ? "wg_form_win" : char === "D" ? "wg_form_draw" : "wg_form_lose"}`}
                            >
                                {char}
                            </span>
                            ))}
                        </td>
                        </tr>
                    </thead>
                    
                    <tbody>
                        <tr className="wg_header" height="40px">
                        <th className="wg_text_center">
                            <img className="wg_flag mg" alt={stats.league?.country} src={stats.league?.logo}/> 
                            {stats.league?.name}
                        </th>
                        <th className="wg_text_center">HOME</th>
                        <th className="wg_text_center">AWAY</th>
                        <th className="wg_text_center">ALL</th>
                        </tr>
                        
                        <tr>
                        <td className="wg_text_left">Games Played</td>
                        <td className="wg_text_center">{stats.fixtures.played.home}</td>
                        <td className="wg_text_center">{stats.fixtures.played.away}</td>
                        <td className="wg_text_center">{stats.fixtures.played.total}</td>
                        </tr>
                        
                        <tr>
                        <td className="wg_text_left">Wins</td>
                        <td className="wg_text_center">{stats.fixtures.wins.home}</td>
                        <td className="wg_text_center">{stats.fixtures.wins.away}</td>
                        <td className="wg_text_center">{stats.fixtures.wins.total}</td>
                        </tr>
                        <tr>
                            <td className="wg_text_left">Draws</td>
                            <td className="wg_text_center">{stats.fixtures.draws.home}</td>
                            <td className="wg_text_center">{stats.fixtures.draws.away}</td>
                            <td className="wg_text_center">{stats.fixtures.draws.total}</td>
                        </tr>
                        <tr>
                            <td className="wg_text_left">Losses</td>
                            <td className="wg_text_center">{stats.fixtures.loses.home}</td>
                            <td className="wg_text_center">{stats.fixtures.loses.away}</td>
                            <td className="wg_text_center">{stats.fixtures.loses.total}</td>
                        </tr>
                        <tr>
                            <td className="wg_text_left wg_bolder wg_header" colSpan="4">GOALS</td>
                        </tr>
                        <tr>
                            <td className="wg_text_left">Goals For</td>
                            <td className="wg_text_center">{stats.goals.for.total.home}</td>
                            <td className="wg_text_center">{stats.goals.for.total.away}</td>
                            <td className="wg_text_center">{stats.goals.for.total.total}</td>
                        </tr>
                        <tr>
                            <td className="wg_text_left">Goals For Average</td>
                            <td className="wg_text_center">{stats.goals.for.average.home}</td>
                            <td className="wg_text_center">{stats.goals.for.average.away}</td>
                            <td className="wg_text_center">{stats.goals.for.average.total}</td>
                        </tr>
                        <tr>
                            <td className="wg_text_left">Goals Against</td>
                            <td className="wg_text_center">{stats.goals.against.total.home}</td>
                            <td className="wg_text_center">{stats.goals.against.total.away}</td>
                            <td className="wg_text_center">{stats.goals.against.total.total}</td>
                        </tr>
                        <tr>
                            <td className="wg_text_left">Goals Against Average</td>
                            <td className="wg_text_center">{stats.goals.against.average.home}</td>
                            <td className="wg_text_center">{stats.goals.against.average.away}</td>
                            <td className="wg_text_center">{stats.goals.against.average.total}</td>
                        </tr>
                        <tr>
                            <td className="wg_text_left" colSpan="3">Penalties Scored</td>
                            <td className="wg_text_center">{stats.penalty.scored.total}</td>
                        </tr>
                        <tr>
                            <td className="wg_text_left" colSpan="3">Penalties Missed</td>
                            <td className="wg_text_center">{stats.penalty.missed.total}</td>
                        </tr>
                        <tr>
                            <td className="wg_text_left">Failed to Score</td>
                            <td className="wg_text_center">{stats.failed_to_score.home}</td>
                            <td className="wg_text_center">{stats.failed_to_score.away}</td>
                            <td className="wg_text_center">{stats.failed_to_score.total}</td>
                        </tr>
                        <tr>
                            <td className="wg_text_left">Clean Sheets</td>
                            <td className="wg_text_center">{stats.clean_sheet.home}</td>
                            <td className="wg_text_center">{stats.clean_sheet.away}</td>
                            <td className="wg_text_center">{stats.clean_sheet.total}</td>
                        </tr>
                        <tr>
                            <td className="wg_text_left wg_bolder wg_header" colSpan="4">CARDS</td>
                        </tr>
                        <tr>
                            <td className="wg_text_left" colSpan="3">Yellow Cards</td>
                            <td className="wg_text_center">
                            {Object.values(stats.cards.yellow)
                            .map(period => period.total)
                            .filter(total => total !== null)
                            .reduce((sum, num) => sum + num, 0)
                            }
                            </td>
                        </tr>
                        <tr>
                            <td className="wg_text_left" colSpan="3">Red Cards</td>
                            <td className="wg_text_center">
                            {Object.values(stats.cards.red)
                            .map(period => period.total)
                            .filter(total => total !== null)
                            .reduce((sum, num) => sum + num, 0)
                            }
                            </td>
                        </tr>
                    </tbody>
                    </table>

                </div>
            )}
        </div>
    );
}

export default Teamstats;
