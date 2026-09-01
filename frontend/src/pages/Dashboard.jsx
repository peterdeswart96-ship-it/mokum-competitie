import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import Inklapbaar from '../components/Inklapbaar'
import AankomendeWedstrijden from '../components/AankomendeWedstrijden'
import { formatWedstrijdDatum } from '../lib/datum'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api'

const REMINDER_OPTIONS = [
  { value: '60', label: '1 uur van tevoren' },
  { value: '120', label: '2 uur van tevoren' },
  { value: '240', label: '4 uur van tevoren' },
  { value: '1440', label: '24 uur van tevoren' },
  { value: 'off', label: 'Geen herinnering' },
]

// Generieke keuze-wizard: elke stap filtert de teamlijst op de eerdere antwoorden en
// toont de resterende unieke waarden. Nu is er per stap vaak maar één optie (alleen
// Mokum, alleen Noord-Holland), maar de wizard groeit vanzelf mee zodra er teams van
// andere poolcentra/regio's/niveaus bijkomen — geen hardcoded opties nodig.
// Niveau vóór regio: Klasses zijn regionaal ingedeeld (bv. Noord-Holland), maar
// Eredivisie/Divisies zijn landelijk of over een grotere regio (bv. "Noord-West")
// verdeeld. Regio eerst vragen zou "Noord-Holland" auto-invullen en Eredivisie/Divisie
// dan verbergen (ze horen niet bij die regio) — vandaar deze volgorde.
const STAPPEN = [
  { key: 'poolcentrum', vraag: 'Bij welk poolcentrum speel je?' },
  { key: 'niveauCategorie', vraag: 'Op welk niveau?' },
  { key: 'regio', vraag: 'In welke regio?' },
  { key: 'teamSlug', vraag: 'Welk team?' },
]

function teamsMatchingAnswers(teams, answers) {
  return teams.filter((t) =>
    Object.entries(answers).every(([key, value]) => !value || t[key] === value)
  )
}

function opties(stapKey, teams, answers) {
  const gefilterd = teamsMatchingAnswers(teams, answers)
  if (stapKey === 'teamSlug') {
    return gefilterd.map((t) => ({ value: t.teamSlug, label: t.teamName, sub: t.niveau }))
  }
  const uniek = [...new Set(gefilterd.map((t) => t[stapKey]).filter(Boolean))]
  return uniek.map((v) => ({ value: v, label: v }))
}

// Vult elke onbeantwoorde stap automatisch in zolang er (gegeven de eerdere
// antwoorden) maar één mogelijke waarde is — zowel bij het eerste laden als na elke
// handmatige keuze, zodat je nooit hoeft te klikken op een stap zonder echte keuze.
function autoFillCascade(teams, beginAnswers) {
  let answers = { ...beginAnswers }
  for (const stap of STAPPEN) {
    if (answers[stap.key]) continue
    const mogelijk = opties(stap.key, teams, answers)
    if (mogelijk.length === 1) {
      answers = { ...answers, [stap.key]: mogelijk[0].value }
    } else {
      break
    }
  }
  return answers
}

function Wizard({ teams, answers, setAnswers }) {
  const huidigeStapIndex = STAPPEN.findIndex((s) => !answers[s.key])
  const beantwoord = STAPPEN.slice(0, huidigeStapIndex)

  function kies(stapKey, value) {
    const na = STAPPEN.findIndex((s) => s.key === stapKey)
    const nieuw = { ...answers, [stapKey]: value }
    // eerdere keuze wijzigen? verder gelegen antwoorden vervallen dan
    for (const s of STAPPEN.slice(na + 1)) nieuw[s.key] = ''
    setAnswers(autoFillCascade(teams, nieuw))
  }

  const huidigeStap = STAPPEN[huidigeStapIndex]
  const huidigeOpties = huidigeStap ? opties(huidigeStap.key, teams, answers) : []

  return (
    <div>
      {beantwoord.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {beantwoord.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => kies(s.key, '')}
              className="text-xs bg-mokum-bg border border-mokum-border rounded-full px-3 py-1 text-mokum-dim hover:text-white hover:border-mokum-red"
              title="Wijzig deze keuze"
            >
              {answers[s.key]} ✕
            </button>
          ))}
        </div>
      )}

      {huidigeStap && (
        <>
          <h2 className="text-sm font-medium text-mokum-text mb-2">{huidigeStap.vraag}</h2>
          <div className="space-y-2">
            {huidigeOpties.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => kies(huidigeStap.key, opt.value)}
                className="block w-full text-left bg-mokum-bg border border-mokum-border rounded-lg px-4 py-3 hover:border-mokum-red transition-colors"
              >
                <div className="text-white font-medium">{opt.label}</div>
                {opt.sub && <div className="text-xs text-mokum-dim mt-0.5">{opt.sub}</div>}
              </button>
            ))}
            {huidigeOpties.length === 0 && (
              <p className="text-mokum-dim text-sm">Geen teams gevonden voor deze combinatie.</p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

function Dashboard() {
  const [teams, setTeams] = useState([])
  const [answers, setAnswers] = useState({ poolcentrum: '', regio: '', niveauCategorie: '', teamSlug: '' })
  const [reminder, setReminder] = useState('1440')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [error, setError] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [refreshMsg, setRefreshMsg] = useState('')
  const [wedstrijden, setWedstrijden] = useState([])

  useEffect(() => {
    fetch(`${API_URL}/teams`)
      .then((res) => {
        if (!res.ok) throw new Error('request failed')
        return res.json()
      })
      .then((data) => {
        setTeams(data)
        setAnswers(autoFillCascade(data, { poolcentrum: '', regio: '', niveauCategorie: '', teamSlug: '' }))
      })
      .catch(() => setError(true))
  }, [])

  const teamSlug = answers.teamSlug
  const team = useMemo(() => teams.find((t) => t.teamSlug === teamSlug), [teams, teamSlug])

  useEffect(() => {
    if (!teamSlug) {
      setWedstrijden([])
      return
    }
    fetch(`${API_URL}/wedstrijden/${teamSlug}`)
      .then((res) => (res.ok ? res.json() : []))
      .then(setWedstrijden)
      .catch(() => setWedstrijden([]))
  }, [teamSlug])

  const reminderParam = `?reminder=${reminder}`
  const icsHttpsUrl = teamSlug ? `${API_URL}/ics/${teamSlug}${reminderParam}` : ''
  const icsWebcalUrl = icsHttpsUrl.replace(/^https?:\/\//, 'webcal://')

  function ververs() {
    setRefreshing(true)
    setRefreshMsg('')
    fetch(`${API_URL}/ververs`, { method: 'POST' })
      .then((res) => {
        if (!res.ok) throw new Error('request failed')
        return res.json()
      })
      .then(() => setRefreshMsg('Schema ververst.'))
      .catch(() => setRefreshMsg('Verversen mislukt, probeer het later opnieuw.'))
      .finally(() => setRefreshing(false))
  }

  return (
    <div className="min-h-screen bg-mokum-bg text-mokum-text">
      <Header title="Competitie Agenda" subtitle="Wedstrijdschema in je eigen agenda" />

      <main className="flex flex-col items-center p-6">
        <Inklapbaar titel="Mokum team wedstrijden aan je agenda toevoegen" subtitel="Krijg je wedstrijdschema automatisch in je agenda">

          {error && (
            <p className="text-mokum-redlight mb-4">
              Kon de teams niet laden. Probeer het later opnieuw.
            </p>
          )}

          {!error && teams.length > 0 && !team && (
            <Wizard teams={teams} answers={answers} setAnswers={setAnswers} />
          )}

          {!error && team && (
            <>
              <button
                type="button"
                onClick={() => setAnswers({ ...answers, teamSlug: '' })}
                className="text-xs text-mokum-dim hover:text-white mb-4"
              >
                ← Ander team kiezen
              </button>

              <div className="bg-mokum-bg border border-mokum-border rounded-lg px-4 py-3 mb-6">
                <div className="text-white font-bold">{team.teamName}</div>
                <div className="text-xs text-mokum-dim mt-0.5">{team.competitionName}</div>
              </div>

              <a
                href={icsWebcalUrl}
                className="block w-full text-center bg-mokum-red hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-3 transition-colors"
              >
                Voeg toe aan mijn agenda
              </a>
              <p className="text-xs text-mokum-dim mt-2 text-center">
                Werkt met Apple Agenda en Google Agenda. Je agenda-app ververst het
                schema vanzelf bij wijzigingen.{' '}
                <Link to="/handleiding" className="text-mokum-redlight hover:underline">
                  Hoe werkt dit precies?
                </Link>
              </p>

              <button
                type="button"
                onClick={() => setAdvancedOpen((v) => !v)}
                className="mt-6 text-sm text-mokum-dim hover:text-white underline"
              >
                {advancedOpen ? 'Verberg geavanceerde opties' : 'Geavanceerde opties'}
              </button>

              {advancedOpen && (
                <div className="mt-4 border-t border-mokum-border pt-4 space-y-3">
                  <label className="block text-sm text-mokum-text">
                    Herinnering
                    <select
                      className="mt-1 w-full bg-mokum-bg border border-mokum-border rounded-lg px-3 py-2 text-white"
                      value={reminder}
                      onChange={(e) => setReminder(e.target.value)}
                    >
                      {REMINDER_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <a
                    href={icsHttpsUrl}
                    download={`${teamSlug}.ics`}
                    className="block text-sm text-mokum-redlight hover:underline"
                  >
                    Download los .ics-bestand
                  </a>

                  <div>
                    <button
                      type="button"
                      onClick={ververs}
                      disabled={refreshing}
                      className="text-sm text-mokum-redlight hover:underline disabled:opacity-50"
                    >
                      {refreshing ? 'Bezig met verversen…' : 'Ververs schema nu'}
                    </button>
                    {refreshMsg && <p className="text-xs text-mokum-dim mt-1">{refreshMsg}</p>}
                    <p className="text-xs text-mokum-dim mt-1">
                      Het schema ververst zelf ook elk uur op de achtergrond.
                    </p>
                  </div>
                </div>
              )}
            </>
          )}
        </Inklapbaar>

        {teams.length > 0 && <AankomendeWedstrijden teams={teams} />}

        {team && wedstrijden.length > 0 && (
          <div className="w-full max-w-md bg-mokum-card rounded-2xl border border-mokum-border p-8 mt-4">
            <h2 className="font-heading text-base text-white mb-1">Voor aanvoerders</h2>
            <p className="text-mokum-dim text-xs mb-4">
              Wedstrijddetails met opstelling, om te delen in de team-app
            </p>
            <div className="space-y-2">
              {wedstrijden.slice(0, 3).map((m) => (
                <Link
                  key={m.matchId}
                  to={`/wedstrijd/${teamSlug}/${m.matchId}`}
                  className="block bg-mokum-bg border border-mokum-border rounded-lg px-4 py-3 hover:border-mokum-red transition-colors"
                >
                  <div className="text-white text-sm font-medium">
                    {m.isHome ? `${team.teamName} - ${m.opponent}` : `${m.opponent} - ${team.teamName}`}
                  </div>
                  <div className="text-xs text-mokum-dim mt-0.5">{formatWedstrijdDatum(m.starttime)}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        <Link to="/intern" className="text-xs text-mokum-dim hover:text-white mt-6">
          Intern 🔒
        </Link>
      </main>
    </div>
  )
}

export default Dashboard
