import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '../components/header';
import '../css/playerstats.css';

function CoachStats() {
    const apiKey = process.env.REACT_APP_API_KEY;
    const { coachId } = useParams();
    const [coachData, setCoachData] = useState(null);
    const [flag, setFlag] = useState(null);
    const [trophies, setTrophies] = useState([]);
    const [loadingTrophies, setLoadingTrophies] = useState(true);
    const [errorTrophies, setErrorTrophies] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
    
        const fetchCoachData = async () => {
            try {
                const cachedData = sessionStorage.getItem(`coachData-${coachId}`);
                if (cachedData) {
                    setCoachData(JSON.parse(cachedData));
                    const countryCode = await getCountryCode(JSON.parse(cachedData)?.nationality);
                    setFlag(getFlagUrl(countryCode));
                    setLoading(false);
                    return;
                }
                const response = await fetch(
                    `https://v3.football.api-sports.io/coachs?id=${coachId}`,
                    {
                        method: "GET",
                        headers: {
                            "x-rapidapi-host": "v3.football.api-sports.io",
                            "x-apisports-key": apiKey,
                        },
                    }
                );
                if (!response.ok) throw new Error("Failed to fetch coach data.");
                const data = await response.json();
                if (data.response.length === 0) throw new Error("No coach found.");
                const coachData = data.response[0];
                setCoachData(coachData);
                const countryCode = await getCountryCode(coachData?.nationality);
                setFlag(getFlagUrl(countryCode));
                sessionStorage.setItem(`coachData-${coachId}`, JSON.stringify(coachData));
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
        fetchCoachData();//eslint-disable-next-line
    }, [coachId]); 

    useEffect(() => {
        const cacheKey = `coachTrophies_${coachId}`;
        const cachedData = sessionStorage.getItem(cacheKey);
        if (cachedData) {
            setTrophies(JSON.parse(cachedData));
            setLoadingTrophies(false);
            return;
        }
    
        const fetchTrophies = async () => {
            setLoadingTrophies(true);
            setErrorTrophies(null);
    
            try {
                const response = await fetch(`https://v3.football.api-sports.io/trophies?coach=${coachId}`, {
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
                    setErrorTrophies("No trophies found for this coach.");
                }
    
                if (Object.keys(data.errors).length > 0) {
                    console.log("Errors found: ");
                    for (const [key, value] of Object.entries(data.errors)) {
                        console.log(`${key}: ${value}`);
                    }
                  }
            } catch (err) {
                console.error("Failed to fetch trophies", err);
                setErrorTrophies("Failed to fetch trophies.");
            } finally {
                setLoadingTrophies(false);
            }
        };
    
        fetchTrophies(); //eslint-disable-next-line
    }, [coachId]);  

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

    return (
        <>
            <Header />
            {loading ? (
                <div className="loader"></div>
            ) : error ? (
                <p style={{ color: "red", marginLeft: "30px", fontSize: "larger" }}>{error}</p>
            ) : (
                <div style={{ width: '78%', margin: '0 auto' }}>
                    <h2 className='header' style={{ borderRadius: '0px 0px 20px 20px' }}>Coach Info</h2>
                    <div style={{ textAlign: "center", width: "40%", alignSelf: "center", margin: "auto" }}>
                        <img className='player-image' src={coachData.photo} alt={coachData.name} />
                        <h2 className="player-name">{coachData.firstname} {coachData.lastname}</h2>
                    </div>

                    <div className="info-grid">
                        <div className="info-item"><span className="info-title">Age / Birthday</span><span className="info-value">{coachData.age} / {coachData.birth.date}</span></div>
                        <div className="info-item"><span className="info-title">Birthplace</span><span className="info-value">{coachData.birth.place}, {coachData.birth.country}</span></div>
                        <div className="info-item">
                            <span className="info-title">Nationality</span>
                            <span className="info-value">
                             {flag && <img className="wg_flag" src={flag} alt='Country flag' />}   
                                {coachData.nationality}
                            </span>
                            </div>
                        <div className="info-item"><span className="info-title">Height / Weight</span><span className="info-value">{coachData.height || "Unknown"} / {coachData.weight || "Unknown"}</span></div>
                        <div className="info-item"><span className="info-title">Current Team</span>
                            <span className="info-value">
                                {coachData.team ? (
                                    <><img className="wg_flag" alt="Club logo" src={coachData.team.logo} /> {coachData.team.name}</>
                                ) : "N/A"}
                            </span>
                        </div>
                    </div>

                    <br />
                    <h2 className='header' style={{ margin: '0px' }}>Career History</h2>
                    <div className='transfer-grid'>
                        {coachData.career.length > 0 ? (
                            coachData.career.map((job, index) => (
                                <div key={index} className='info-item'>
                                    <span className='info-title'>{job.start} - {job.end || "Present"}</span>
                                    <div className='transfer-teams'>
                                        <img src={job.team.logo} alt={job.team.name} className='team-logo' />
                                        <span>{job.team.name}</span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className='info-item'><span className='info-value'>No career history available</span></div>
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
                                   <div  style={{ display: 'flex', verticalAlign:'middle', gap: '10px' }}>
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
            )}
        </>
    );
}

export default CoachStats;