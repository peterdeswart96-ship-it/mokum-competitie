const DEFAULT_DURATION_MINUTES = 240;
const DEFAULT_REMINDER_MINUTES = 1440;

function foldLine(line) {
  const bytes = Buffer.byteLength(line, 'utf8');
  if (bytes <= 75) return line;
  let result = '';
  let chunk = '';
  let chunkBytes = 0;
  for (const char of line) {
    const charBytes = Buffer.byteLength(char, 'utf8');
    if (chunkBytes + charBytes > 74) {
      result += (result ? '\r\n ' : '') + chunk;
      chunk = '';
      chunkBytes = 0;
    }
    chunk += char;
    chunkBytes += charBytes;
  }
  result += (result ? '\r\n ' : '') + chunk;
  return result;
}

function escapeText(text) {
  return String(text)
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

function toIcsDate(isoString) {
  return isoString.replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z');
}

function addMinutes(isoString, minutes) {
  const date = new Date(isoString);
  date.setUTCMinutes(date.getUTCMinutes() + minutes);
  return date.toISOString();
}

function matchToEvent(match, teamName, { reminderMinutes = DEFAULT_REMINDER_MINUTES } = {}) {
  const summary = match.isHome
    ? `${teamName} - ${match.opponent}`
    : `${match.opponent} - ${teamName}`;
  const location = [match.venueName, match.venueAddress].filter(Boolean).join(', ');
  const description = `${match.roundName}\nCuescore: ${match.matchUrl}`;
  const dtStart = toIcsDate(match.starttime);
  const dtEnd = toIcsDate(addMinutes(match.starttime, DEFAULT_DURATION_MINUTES));
  const dtStamp = toIcsDate(new Date().toISOString());

  const lines = [
    'BEGIN:VEVENT',
    `UID:mokum-competitie-${match.matchId}@pdscloud.nl`,
    `DTSTAMP:${dtStamp}`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:${escapeText(summary)}`,
    `LOCATION:${escapeText(location)}`,
    `DESCRIPTION:${escapeText(description)}`,
    `URL:${match.matchUrl}`,
  ];

  if (reminderMinutes > 0) {
    lines.push(
      'BEGIN:VALARM',
      'ACTION:DISPLAY',
      `DESCRIPTION:${escapeText(summary)}`,
      `TRIGGER:-PT${reminderMinutes}M`,
      'END:VALARM'
    );
  }

  lines.push('END:VEVENT');
  return lines;
}

function generateIcs(matches, teamName, { reminderMinutes = DEFAULT_REMINDER_MINUTES, calendarName } = {}) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//pdscloud.nl//mokum-competitie//NL',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
  ];

  if (calendarName) {
    lines.push(`X-WR-CALNAME:${escapeText(calendarName)}`);
  }

  for (const match of matches) {
    lines.push(...matchToEvent(match, teamName, { reminderMinutes }));
  }

  lines.push('END:VCALENDAR');

  return lines.map(foldLine).join('\r\n') + '\r\n';
}

module.exports = { generateIcs };
