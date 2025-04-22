import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Header from '../components/header';
import '../css/playerstats.css';

const PlayerStats = () => {
    const apiKey = process.env.REACT_APP_API_KEY;
    const { playerId, newSeason } = useParams();
    const navigate = useNavigate();
    const [season, setSeason] = useState("2023");
    const [playerData, setPlayerData] = useState(null);
    const [playerInfo, setPlayerinfo] = useState(null);
    const [currentTeam, setCurrentTeam] = useState(null);
    const [trophies, setTrophies] = useState([]);
    const [flag, setFlag] = useState(null);
    const [loading, setLoading] = useState(true);
    const [loadingTrophies, setLoadingTrophies] = useState(true);
    const [transfers, setTransfers] = useState([]);
    const [loadingTransfers, setLoadingTransfers] = useState(true);
    const [errorTransfers, setErrorTransfers] = useState(null);
    const [error, setError] = useState(null);
    const [errorTrophies, setErrorTrophies] = useState(null);

    const selectedSeason = newSeason || season;

    useEffect(() => {

        const fetchPlayerProfile = async () => {
            try {
                setLoading(true);
                const cacheKey = `playerProfile_${playerId}`;
                const cachedData = sessionStorage.getItem(cacheKey);
    
                if (cachedData) {
                    const parsedData = JSON.parse(cachedData);
                    setPlayerinfo(parsedData);
                    // Fetch flag immediately
                    const countryCode = await getCountryCode(parsedData?.player?.nationality);
                    setFlag(getFlagUrl(countryCode));
                    setLoading(false);
                    return; // Avoid unnecessary API request
                }
                const response = await fetch(`https://v3.football.api-sports.io/players/profiles?player=${playerId}`, {
                    method: 'GET',
                    headers: {
                        'x-apisports-key': apiKey 
                    }
                });
    
                const data = await response.json();
    
                if (data.response.length > 0) {
                    const playerData = data.response[0];
                    setPlayerinfo(playerData);
                    const countryCode = await getCountryCode(playerData?.player?.nationality);
                    setFlag(getFlagUrl(countryCode));
                    sessionStorage.setItem(`playerProfile_${playerId}`, JSON.stringify(playerData)); // Store for later use
                }
                if (Object.keys(data.errors).length > 0) {
                    console.log("Errors found: ");
                    for (const [key, value] of Object.entries(data.errors)) {
                        console.log(`${key}: ${value}`);
                    }
                  }
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchPlayerProfile();//eslint-disable-next-line
    }, [playerId]);  

    // Fetch Player Stats
    useEffect(() => {
        setLoading(true);
        setError(null);
        const cacheKey = `playerStats_${playerId}_${selectedSeason}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
            setPlayerData(JSON.parse(cachedData));
            setLoading(false);
            return; // Avoid unnecessary API request
        }
        const fetchPlayerStats = async () => {
            try {
                const response = await fetch(`https://v3.football.api-sports.io/players?id=${playerId}&season=${selectedSeason}`, {
                    method: 'GET',
                    headers: {
                        'x-apisports-key': apiKey 
                    }
                });

                const data = await response.json();

                if (data.response.length > 0) {
                    setPlayerData(data.response[0]);
                    sessionStorage.setItem(cacheKey, JSON.stringify(data.response[0]));
                } else {
                    setPlayerData(null);
                    setError("No stats found for this player");
                }
                if (Object.keys(data.errors).length > 0) {
                    console.log("Errors found: ");
                    for (const [key, value] of Object.entries(data.errors)) {
                        console.log(`${key}: ${value}`);
                    }
                  }
            } catch (err) {
                setError("Failed to fetch player stats.");
            } finally {
                setLoading(false);
            }
        };

        fetchPlayerStats();//eslint-disable-next-line
    }, [playerId, selectedSeason]); 

    useEffect(() => {

const cacheKey = `playerTransfers_${playerId}`;
const cachedData = sessionStorage.getItem(cacheKey);
if (cachedData) {
    const parsedData = JSON.parse(cachedData);
    setTransfers(parsedData.transfers);
    setCurrentTeam(parsedData.currentTeam);  // Ensure the current team is being set correctly from cache
    setLoadingTransfers(false);
    return; // Avoid unnecessary API request
}
        const fetchTransfers = async () => {
            setLoadingTransfers(true);
            setErrorTransfers(null);
    
            try {
                const response = await fetch(`https://v3.football.api-sports.io/transfers?player=${playerId}`, {
                    method: 'GET',
                    headers: {
                        'x-apisports-key': apiKey 
                    }
                });
    
                const data = await response.json();
    
                if (data.response.length > 0 && data.response[0].transfers.length > 0) {
                    const allTransfers = data.response[0].transfers;
                    setTransfers(allTransfers);
                    
                    const latestTransfer = allTransfers[0]; // Get the most recent transfer
                
                    if (latestTransfer?.teams?.in) {
                        setCurrentTeam(latestTransfer.teams.in); // Directly setting the latest team object
                    }                        
                    sessionStorage.setItem(cacheKey, JSON.stringify({ transfers: allTransfers, currentTeam: latestTransfer.teams.in }));           
                } else {
                    setTransfers([]);
                    setErrorTransfers("No transfer history found.");
                }
                if (Object.keys(data.errors).length > 0) {
                    console.log("Errors found: ");
                    for (const [key, value] of Object.entries(data.errors)) {
                        console.log(`${key}: ${value}`);
                    }
                  }
            } catch (err) {
                setTransfers([]);
                setErrorTransfers("Failed to fetch transfer history.");
            } finally {
                setLoadingTransfers(false);
            }
        };
    
        fetchTransfers();//eslint-disable-next-line
    }, [playerId]); 

    // Fetch Trophies
    useEffect(() => {

        const cacheKey = `playerTrophies_${playerId}`;
    const cachedData = sessionStorage.getItem(cacheKey);

    if (cachedData) {
        setTrophies(JSON.parse(cachedData));
        setLoadingTrophies(false);
        return; // Avoid unnecessary API request
    }
        const fetchTrophies = async () => {
            setLoadingTrophies(true);
            setErrorTrophies(null);

            try {
                const response = await fetch(`https://v3.football.api-sports.io/trophies?player=${playerId}`, {
                    method: 'GET',
                    headers: {
                        'x-apisports-key': apiKey 
                    }
                });

                const data = await response.json();

                if (data.response.length > 0) {
                    const filteredTrophies = await Promise.all(
                        data.response
                            .filter(trophy => trophy.place === "Winner")
                            .map(async (trophy) => {
                                const country = trophy.country || "";
                                const countryCode = country ? await getCountryCode(country) : null;
                                const flagUrl = getFlagUrl(countryCode);
                                return { ...trophy, flagUrl, country };
                            })
                    );
                    setTrophies(filteredTrophies);
                    sessionStorage.setItem(cacheKey, JSON.stringify(filteredTrophies));
                } else {
                    setErrorTrophies("No trophies found for this player.");
                }
                if (Object.keys(data.errors).length > 0) {
                    console.log("Errors found: ");
                    for (const [key, value] of Object.entries(data.errors)) {
                        console.log(`${key}: ${value}`);
                    }
                  }
            } catch (err) {
                setErrorTrophies("Failed to fetch trophies.");
            } finally {
                setLoadingTrophies(false);
            }
        };

        fetchTrophies();//eslint-disable-next-line
    }, [playerId]); 

    const getCountryCode = async (countryName) => {
        if (countryName.toLowerCase() === "england"){
            return "gb-eng";
        } else if (countryName.toLowerCase() === "scotland"){
            return "gb-sct";
        } else if (countryName.toLowerCase() === "wales"){
            return "gb-wls";
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

    // Handle season change
    const handleSeasonChange = (event) => {
        const newSeason = event.target.value;
        setSeason(newSeason);
        navigate(`/player-stats/${playerId}/${newSeason}`, { replace: true });
    };

    return (
        <div>
            <Header />

            {loading ? (
                <div className="loader"></div>
            ) : error ? (
                <p style={{ color: "red", marginLeft: "30px", fontSize: "larger" }}>{error}</p>
            ) : (playerData?.statistics?.length > 0 && playerInfo && currentTeam && (
                    <div  style={{width: '78%', margin: '0 auto'}}>
                        <h2 className='header' style={{borderRadius: '0px 0px 20px 20px'}}>Player Info</h2>
                        <div style={{ textAlign: "center", width: "40%", alignSelf: "center", margin: "auto" }}>
                            <img className='plr-image' src={playerInfo?.player?.photo} alt={playerInfo?.player?.name || "Unknown"} />
                            <h2 className="player-name">{playerInfo?.player?.firstname || ""} {playerInfo?.player?.lastname || ""}</h2>
                        </div>

                        <div className="info-grid">
                            <span style={{ alignContent: 'center', gridColumn: "1 / -1", fontFamily: 'verdana', fontWeight: 'bold' }}>Details</span>
                            <div className="info-item"><span className="info-title">Height / Weight</span><span className="info-value">{playerData.player.height} / {playerData.player.weight}</span></div>
                            <div className="info-item"><span className="info-title">Position</span><span className="info-value">{playerInfo?.player?.position || "N/A"}</span></div>
                            <div className="info-item"><span className="info-title">Age / Birthday</span><span className="info-value">Age {playerData.player.age} / {playerData.player.birth.date}</span></div>
                            <div className="info-item">
                            <span className="info-title">Nationality</span>
                                <span className="info-value">
                                    {flag && (
                                        <img src={flag} alt="Country flag" className="wg_flag" />)}
                                    {playerData.player.nationality}
                                </span>
                            </div>
                            <div className="info-item"><span className="info-title">Current Team</span><span className="info-value">{currentTeam? (<><img className="wg_flag" alt="Club logo" src={currentTeam.logo} />{currentTeam.name}</>) : ("N/A")}</span></div>
                            <div className="info-item"><span className="info-title">Shirt No.</span><span className="info-value">{playerInfo.player.number || "N/A"}</span></div>  
                        </div>

                        <br />
                        <h2 className='header' style={{margin:'0px'}}>Seasonal Stats</h2>
                        <div className="sl" style={{ position: 'absolute', marginTop: "16px", right: '160px', zIndex: '1' }}>
                            <label htmlFor="season-select">Season:</label>
                            <select id="season-select" value={selectedSeason} onChange={handleSeasonChange}>
                                <option value="2023">2023</option>
                                <option value="2022">2022</option>
                                <option value="2021">2021</option>
                            </select>
                        </div>

                        <table className='wg_table' style={{ width: "100%" }}>
                            <thead>
                                <tr>
                                    <td className="wg_header wg_text_center" colSpan="2">
                                        {playerData?.statistics?.[0]?.team?.logo && (
                                        <img className="wg_flag" alt="Club logo" src={playerData.statistics[0].team.logo} />
                                        )}
                                        {playerData.statistics[0].team.name}
                                    </td>
                                </tr>
                            </thead>
                            <tbody>
                                <tr className="wg_header" height="40px">
                                    <td className="wg_text_center">
                                        {playerData?.statistics?.[0]?.league?.logo && (
                                            <img className="wg_flag" alt={"League"} src={playerData.statistics[0].league.logo} />
                                        )}
                                        {playerData.statistics[0].league.name}
                                    </td>
                                    <td className="wg_text_center">Total</td>
                                </tr>
                                <tr><td className="wg_text_left">Appearances</td><td className="wg_text_center">{playerData.statistics[0].games.appearences}</td></tr>
                                <tr><td className="wg_text_left">Minutes</td><td className="wg_text_center">{playerData.statistics[0].games.minutes}</td></tr>
                                <tr><td className="wg_text_left">Goals</td><td className="wg_text_center">{playerData.statistics[0].goals.total}</td></tr>
                                <tr><td className="wg_text_left">Assists</td><td className="wg_text_center">{playerData.statistics[0].goals.assists}</td></tr>
                                <tr><td className="wg_text_left">Passes (key)</td><td className="wg_text_center">{playerData.statistics[0].passes.total || 0} ({playerData.statistics[0].passes?.key || 0})</td></tr>
                                <tr><td className="wg_text_left">Dribbles (successful)</td><td className="wg_text_center">{playerData.statistics[0].dribbles.attempts || 0} ({playerData.statistics[0].dribbles.success || 0})</td></tr>
                                <tr><td className="wg_text_left">Fouls drawn</td><td className="wg_text_center">{playerData.statistics[0].fouls.drawn || 0}</td></tr>
                                <tr><td className="wg_text_left">Fouls committed</td><td className="wg_text_center">{playerData.statistics[0].fouls.committed || 0}</td></tr>
                                <tr><td className="wg_text_left">Yellow Cards</td><td className="wg_text_center">{playerData.statistics[0].cards.yellow || 0}</td></tr>
                                <tr><td className="wg_text_left">Red Cards</td><td className="wg_text_center">{playerData.statistics[0].cards.red || 0}</td></tr>
                            </tbody>
                        </table>

                        <br />
                        <h2 className='header' style={{margin:'0px'}}>Transfer History</h2>
                        <div className='transfer-grid'>
                            {loadingTransfers && <div className="loader"></div>}
                            {errorTransfers && console.log(errorTransfers)}
                            {!loadingTransfers && !errorTransfers && transfers.length > 0 ? (
                                transfers.map((transfer, index) => (
                                    <div key={index} className='info-item'>
                                        <span className='info-title'>{transfer.date}</span>
                                        <span className='info-value wg_text_right'>{transfer.type ? transfer.type : "Unknown"}</span>
                                        <div className='transfer-teams'>
                                            <div className='team'>
                                                <img src={transfer.teams.out.logo} alt={transfer.teams.out.name} className='team-logo' />
                                                <span>{transfer.teams.out.name}</span>
                                            </div>
                                            <span style={{fontWeight: 'bolder'}}>→</span>
                                            <div className='team'>
                                                <img src={transfer.teams.in.logo} alt={transfer.teams.in.name} className='team-logo' />
                                                <span>{transfer.teams.in.name}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                !loadingTransfers && <div className='info-item'><span className='info-value'>No transfer history available</span></div>
                            )}
                        </div>

                        <br />
                        <h2 className='header' style={{margin:'0px'}}>All Trophies Won</h2>
                    <div className='transfer-grid'>
                        {loadingTrophies && <div className="loader"></div>}
                        {errorTrophies && console.log(errorTrophies)}
                        
                        {!loadingTrophies && !errorTrophies && trophies.length > 0 ? (
                            Object.entries(
                                trophies.reduce((acc, { league, season, flagUrl, country }) => {
                                    if (!acc[league]) acc[league] = { seasons: [], flagUrl, country };
                                    acc[league].seasons.push(season);
                                    return acc;
                                }, {})
                            ).map(([league, { seasons, flagUrl, country }], index) => (
                                <div key={index} className='info-item'>
                                    <div  style={{ display: 'flex', alignItems:'center', gap: '10px' }}>
                                    {flagUrl && (
                                        <img src={flagUrl} alt={`${country} flag`} className="c-flag" />
                                    )}
                                    <span className='info-title'>{league} (x{seasons.length})</span></div>
                                    <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                                        {seasons.map((season, i) => (
                                            <li key={i} className='info-value'>{season}</li>
                                        ))}
                                    </ul>
                                </div>
                            ))
                        ) : (
                            !loadingTrophies && <div className='info-item'><span className='info-value'>No trophies won</span></div>
                        )}
                      </div>
                    </div>
                )
            )}
        </div>
    );
};

export default PlayerStats;
