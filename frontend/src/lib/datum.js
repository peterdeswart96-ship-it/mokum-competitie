const FORMATTER = new Intl.DateTimeFormat('nl-NL', {
  timeZone: 'Europe/Amsterdam',
  weekday: 'long',
  day: 'numeric',
  month: 'long',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export function formatWedstrijdDatum(isoString) {
  const parts = FORMATTER.formatToParts(new Date(isoString))
  const get = (type) => parts.find((p) => p.type === type)?.value
  const dag = get('weekday')
  const dagNr = get('day')
  const maand = get('month')
  const jaar = get('year')
  const uur = get('hour')
  const minuut = get('minute')
  const dagCap = dag.charAt(0).toUpperCase() + dag.slice(1)
  return `${dagCap} ${dagNr} ${maand} ${jaar}, ${uur}:${minuut} uur`
}
