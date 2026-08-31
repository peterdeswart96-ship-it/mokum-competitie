const { fetchTournament } = require('./cuescore');
const { getCachedTournament, setCachedTournament } = require('./cache');

// Cache-first: de timer-trigger (syncCuescore.js) ververst dit elk uur, dus normaal
// gesproken hangt een bezoek nooit af van de live beschikbaarheid van cuescore's
// bèta-API. Bij een cache-miss (bv. vlak na de eerste deploy) valt dit terug op een
// live fetch, en schrijft het resultaat meteen weg zodat de volgende request al uit
// cache komt.
async function getTournamentData(tournamentId, context) {
  const cached = await getCachedTournament(tournamentId).catch((err) => {
    context.error(`Cache-lookup mislukt voor tournament ${tournamentId}: ${err.message}`);
    return null;
  });
  if (cached) return cached.data;

  const data = await fetchTournament(tournamentId);
  setCachedTournament(tournamentId, data).catch((err) => {
    context.error(`Cache-write mislukt voor tournament ${tournamentId}: ${err.message}`);
  });
  return data;
}

module.exports = { getTournamentData };
