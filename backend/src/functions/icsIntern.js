const { app } = require('@azure/functions');
const { getTeamMatches } = require('../lib/cuescore');
const { generateIcs } = require('../lib/ics');
const { getTournamentData } = require('../lib/tournamentData');
const teams = require('../config/teams.json');

// Wachtwoord is bewust NIET gevoelig — puur een drempel op verzoek van Peter zodat
// dit niet per ongeluk door willekeurige bezoekers gevonden wordt, geen echte
// beveiliging (afgesproken 2026-08-31, voor Nick en Mark).
const INTERN_WACHTWOORD = 'mkm!';
const ALLOWED_REMINDER_MINUTES = [0, 60, 120, 240, 1440];

app.http('icsIntern', {
  route: 'ics/intern/thuiswedstrijden',
  methods: ['GET'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    if (request.query.get('wachtwoord') !== INTERN_WACHTWOORD) {
      return { status: 401, body: 'Onjuist wachtwoord.' };
    }

    const reminderParam = request.query.get('reminder');
    let reminderMinutes = 120;
    if (reminderParam === 'off') {
      reminderMinutes = 0;
    } else if (reminderParam !== null && ALLOWED_REMINDER_MINUTES.includes(Number(reminderParam))) {
      reminderMinutes = Number(reminderParam);
    }

    try {
      // Toernooien zijn gedeeld over meerdere teams (bv. alle Eerste Klasse-teams
      // zitten in hetzelfde toernooi) — per toernooi maar één keer ophalen/cachen.
      const tournamentCache = new Map();
      const alleThuiswedstrijden = [];

      for (const team of teams) {
        let tournament = tournamentCache.get(team.cuescoreTournamentId);
        if (!tournament) {
          tournament = await getTournamentData(team.cuescoreTournamentId, context);
          tournamentCache.set(team.cuescoreTournamentId, tournament);
        }
        const thuiswedstrijden = getTeamMatches(tournament, team.cuescoreTeamId)
          .filter((m) => m.isHome)
          .map((m) => ({ ...m, teamName: team.teamName }));
        alleThuiswedstrijden.push(...thuiswedstrijden);
      }

      alleThuiswedstrijden.sort((a, b) => new Date(a.starttime) - new Date(b.starttime));

      const ics = generateIcs(alleThuiswedstrijden, 'Mokum Pool & Darts', {
        reminderMinutes,
        calendarName: 'Mokum — alle thuiswedstrijden',
      });

      return {
        status: 200,
        headers: {
          'Content-Type': 'text/calendar; charset=utf-8',
          'Content-Disposition': 'inline; filename="mokum-alle-thuiswedstrijden.ics"',
          'Cache-Control': 'private, max-age=3600',
        },
        body: ics,
      };
    } catch (err) {
      context.error(err);
      return { status: 502, body: 'Kon cuescore-data niet ophalen.' };
    }
  },
});
