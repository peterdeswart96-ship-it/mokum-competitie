const { app } = require('@azure/functions');
const teams = require('../config/teams.json');

app.http('teams', {
  route: 'teams',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async () => {
    const publicTeams = teams.map(
      ({ teamSlug, teamName, club, poolcentrum, regio, niveauCategorie, niveau, seizoen, competitionName }) => ({
        teamSlug,
        teamName,
        club,
        poolcentrum,
        regio,
        niveauCategorie,
        niveau,
        seizoen,
        competitionName,
      })
    );

    return {
      status: 200,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      jsonBody: publicTeams,
    };
  },
});
