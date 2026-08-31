const { fetchTournament } = require('./cuescore');
const { setCachedTournament } = require('./cache');
const teams = require('../config/teams.json');

function uniqueTournamentIds() {
  return [...new Set(teams.map((t) => t.cuescoreTournamentId))];
}

async function syncAllTournaments(logger = console) {
  const results = [];
  for (const tournamentId of uniqueTournamentIds()) {
    try {
      const data = await fetchTournament(tournamentId);
      const updatedAt = await setCachedTournament(tournamentId, data);
      logger.log?.(`Cuescore-sync: tournament ${tournamentId} ververst (${updatedAt})`);
      results.push({ tournamentId, ok: true, updatedAt });
    } catch (err) {
      logger.error?.(`Cuescore-sync: tournament ${tournamentId} mislukt: ${err.message}`);
      results.push({ tournamentId, ok: false, error: err.message });
    }
  }
  return results;
}

module.exports = { syncAllTournaments, uniqueTournamentIds };
