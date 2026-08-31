const { app } = require('@azure/functions');
const { getTeamMatches } = require('../lib/cuescore');
const { getTournamentData } = require('../lib/tournamentData');
const teams = require('../config/teams.json');

app.http('wedstrijden', {
  route: 'wedstrijden/{teamSlug}',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const team = teams.find((t) => t.teamSlug === request.params.teamSlug);
    if (!team) {
      return { status: 404, body: `Onbekend team: ${request.params.teamSlug}` };
    }

    try {
      const tournament = await getTournamentData(team.cuescoreTournamentId, context);
      const matches = getTeamMatches(tournament, team.cuescoreTeamId);
      const aankomend = matches.filter((m) => m.matchStatus !== 'played' && m.matchStatus !== 'finished');

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        jsonBody: aankomend,
      };
    } catch (err) {
      context.error(err);
      return { status: 502, body: 'Kon cuescore-data niet ophalen.' };
    }
  },
});
