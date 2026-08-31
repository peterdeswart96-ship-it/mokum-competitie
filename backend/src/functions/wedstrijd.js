const { app } = require('@azure/functions');
const { fetchTeamRoster, getMatchDetail } = require('../lib/cuescore');
const { getTournamentData } = require('../lib/tournamentData');
const teams = require('../config/teams.json');

// Roster is het volledige teamroster (captain + leden) uit cuescore, niet per se de
// exacte opstelling van déze wedstrijd — cuescore houdt dat niet apart bij (zie GH
// issue #2). Geeft null terug bij een fout i.p.v. de hele request te laten falen: de
// captain kan de rest van de wedstrijdinfo dan nog steeds gebruiken.
async function veiligeRoster(teamId, context) {
  try {
    const data = await fetchTeamRoster(teamId);
    return {
      captain: data.captain ? { name: data.captain.name } : null,
      members: (data.members ?? []).map((m) => ({ name: m.name })),
    };
  } catch (err) {
    context.error(`Roster ophalen mislukt voor team ${teamId}: ${err.message}`);
    return null;
  }
}

app.http('wedstrijd', {
  route: 'wedstrijd/{teamSlug}/{matchId}',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const team = teams.find((t) => t.teamSlug === request.params.teamSlug);
    if (!team) {
      return { status: 404, body: `Onbekend team: ${request.params.teamSlug}` };
    }

    try {
      const tournament = await getTournamentData(team.cuescoreTournamentId, context);
      const match = getMatchDetail(tournament, request.params.matchId);
      if (!match) {
        return { status: 404, body: `Onbekende wedstrijd: ${request.params.matchId}` };
      }

      const [homeRoster, awayRoster] = await Promise.all([
        veiligeRoster(match.home.teamId, context),
        veiligeRoster(match.away.teamId, context),
      ]);

      return {
        status: 200,
        headers: { 'Content-Type': 'application/json; charset=utf-8' },
        jsonBody: {
          ...match,
          competitionName: team.competitionName,
          home: { ...match.home, roster: homeRoster },
          away: { ...match.away, roster: awayRoster },
        },
      };
    } catch (err) {
      context.error(err);
      return { status: 502, body: 'Kon cuescore-data niet ophalen.' };
    }
  },
});
