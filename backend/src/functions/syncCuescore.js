const { app } = require('@azure/functions');
const { syncAllTournaments } = require('../lib/sync');

app.timer('syncCuescore', {
  // Elk uur, op het hele uur.
  schedule: '0 0 * * * *',
  handler: async (myTimer, context) => {
    await syncAllTournaments(context);
  },
});
