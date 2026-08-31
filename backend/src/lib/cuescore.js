const API_BASE = 'https://api.cuescore.com';
const MATCH_URL_BASE = 'https://cuescore.com/match';

async function fetchTournament(tournamentId) {
  const res = await fetch(`${API_BASE}/tournament/?id=${tournamentId}`);
  if (!res.ok) {
    throw new Error(`Cuescore tournament ${tournamentId} request failed: ${res.status}`);
  }
  return res.json();
}

async function fetchTeamRoster(teamId) {
  const res = await fetch(`${API_BASE}/participant/?id=${teamId}`);
  if (!res.ok) {
    throw new Error(`Cuescore participant ${teamId} request failed: ${res.status}`);
  }
  return res.json();
}

function getTeamMatches(tournament, teamId) {
  return tournament.matches
    .filter((m) => m.playerA.teamId === teamId || m.playerB.teamId === teamId)
    .map((m) => {
      const isHome = m.playerA.teamId === teamId;
      const opponent = isHome ? m.playerB : m.playerA;
      const venue = m.playerA.venue;
      return {
        matchId: m.matchId,
        matchUrl: `${MATCH_URL_BASE}/${m.matchId}`,
        roundName: m.roundName,
        starttime: m.starttime,
        isHome,
        opponent: opponent.name,
        venueName: venue?.name ?? '',
        venueAddress: venue?.address ?? '',
        matchStatus: m.matchstatus,
      };
    })
    .sort((a, b) => new Date(a.starttime) - new Date(b.starttime));
}

function getMatchDetail(tournament, matchId) {
  const m = tournament.matches.find((match) => match.matchId === Number(matchId));
  if (!m) return null;

  // playerA is in cuescore's eigen data altijd de thuisspelende partij (het venue-veld
  // zit ook alleen op playerA) — zie backend/src/lib/cuescore.js getTeamMatches hierboven.
  const venue = m.playerA.venue;
  return {
    matchId: m.matchId,
    matchUrl: `${MATCH_URL_BASE}/${m.matchId}`,
    roundName: m.roundName,
    starttime: m.starttime,
    matchStatus: m.matchstatus,
    venueName: venue?.name ?? '',
    venueAddress: venue?.address ?? '',
    home: { teamId: m.playerA.teamId, name: m.playerA.name },
    away: { teamId: m.playerB.teamId, name: m.playerB.name },
  };
}

module.exports = { fetchTournament, fetchTeamRoster, getTeamMatches, getMatchDetail };
