const { app } = require('@azure/functions');
const { fetchTournament, getTeamMatches } = require('../lib/cuescore');
const { generateIcs } = require('../lib/ics');
const { getCachedTournament, setCachedTournament } = require('../lib/cache');
const teams = require('../config/teams.json');

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

app.http('ics', {
  route: 'ics/{teamSlug}',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const team = teams.find((t) => t.teamSlug === request.params.teamSlug);
    if (!team) {
      return { status: 404, body: `Onbekend team: ${request.params.teamSlug}` };
    }

    const ALLOWED_REMINDER_MINUTES = [0, 60, 120, 240, 1440];
    const reminderParam = request.query.get('reminder');
    const reminderMinutes = reminderParam === 'off'
      ? 0
      : ALLOWED_REMINDER_MINUTES.includes(Number(reminderParam)) ? Number(reminderParam) : 60;

    try {
      const tournament = await getTournamentData(team.cuescoreTournamentId, context);
      const matches = getTeamMatches(tournament, team.cuescoreTeamId);
      const ics = generateIcs(matches, team.teamName, {
        reminderMinutes,
        calendarName: `${team.teamName} - ${team.competitionName}`,
      });

      return {
        status: 200,
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': `inline; filename="${team.teamSlug}.ics"`,
          'Cache-Control': 'public, max-age=3600',
        },
        body: ics,
      };
    } catch (err) {
      context.error(err);
      return { status: 502, body: 'Kon cuescore-data niet ophalen.' };
    }
  },
});
