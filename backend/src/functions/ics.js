const { app } = require('@azure/functions');
const { fetchTournament, getTeamMatches } = require('../lib/cuescore');
const { generateIcs } = require('../lib/ics');
const teams = require('../config/teams.json');

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
      const tournament = await fetchTournament(team.cuescoreTournamentId);
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
