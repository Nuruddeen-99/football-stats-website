import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Fixtures from './pages/fixtures';
import Standings from "./pages/standings";
import Goals from "./pages/goals";
import Assists from "./pages/assists";
import YellowCards from "./pages/yellowcards";
import RedCards from "./pages/redcards";
import Teams from "./pages/teams";
import Teamstats from "./pages/teamstats";
import TeamInfo from "./pages/teaminfo";
import Players from "./pages/players";
import Playerstats from "./pages/playerstats";
import CoachStats from "./pages/coachstats";

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/fixtures" element={<Fixtures />} />
        <Route path="/standings/:id/:newSeason?" element={<Standings />} />
        <Route path="/standings/:id/:newSeason?/goals" element={<Goals />} />
        <Route path="/standings/:id/:newSeason?/assists" element={<Assists />} />
        <Route path="/standings/:id/:newSeason?/yellow-cards" element={<YellowCards />} />
        <Route path="/standings/:id/:newSeason?/red-cards" element={<RedCards />} />
        <Route path="/teams" element={<Teams />} />
        <Route path="/team-stats/:leagueid/:newSeason?/:teamId" element={<Teamstats />} />
        <Route path="/team-info/:teamId" element={<TeamInfo />} />
        <Route path="/players" element={<Players />} />
        <Route path="/player-stats/:playerId/:newSeason?" element={<Playerstats />} />
        <Route path="/coach-stats/:coachId" element={<CoachStats />} />
      </Routes>
    </Router>
  );
};

export default AppRoutes;