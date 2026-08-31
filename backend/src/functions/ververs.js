const { app } = require('@azure/functions');
const { syncAllTournaments } = require('../lib/sync');

app.http('ververs', {
  route: 'ververs',
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    const results = await syncAllTournaments(context);
    const allOk = results.every((r) => r.ok);

    return {
      status: allOk ? 200 : 502,
      headers: { 'Content-Type': 'application/json; charset=utf-8' },
      jsonBody: { results },
    };
  },
});
