export const COMPETITION_GROUPS = {
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
  International: [
    { name: "Champions League", logo: "ucl.png", id: 2 },
    { name: "Europa League", logo: "uel.png", id: 3 },
    { name: "Conference League", logo: "uecl.png", id: 848 },
  ],
};

export const ALL_COMPETITIONS = Object.values(COMPETITION_GROUPS).flat();

export function findCompetition(id) {
  return ALL_COMPETITIONS.find(
    (competition) => String(competition.id) === String(id)
  );
}

export function getCompetitionLogo(competition) {
  return competition?.logo ? `/logos/${competition.logo}` : null;
}
