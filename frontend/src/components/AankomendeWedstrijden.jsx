import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { formatWedstrijdDatum } from '../lib/datum'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api'

// Groepeert teams per niveau, in dezelfde volgorde als ze voorkomen — puur voor
// overzicht in de checkbox-lijst, geen vaste/hardcoded niveaus.
function groepeerPerNiveau(teams) {
  const groepen = new Map()
  for (const team of teams) {
    const key = team.niveau || 'Overig'
    if (!groepen.has(key)) groepen.set(key, [])
    groepen.get(key).push(team)
  }
  return [...groepen.entries()]
}

function AankomendeWedstrijden({ teams }) {
  const [geselecteerd, setGeselecteerd] = useState(() => new Set(teams.map((t) => t.teamSlug)))
  const [thuisUit, setThuisUit] = useState('alles') // 'alles' | 'thuis' | 'uit'
  const [wedstrijden, setWedstrijden] = useState([])
  const [laden, setLaden] = useState(false)

  // Als de teamlijst later binnenkomt/verandert (bv. na de eerste fetch), alsnog
  // alles aanvinken zodat nieuwe teams niet per ongeluk uitstaan.
  useEffect(() => {
    setGeselecteerd(new Set(teams.map((t) => t.teamSlug)))
  }, [teams])

  useEffect(() => {
    // Cancellation-guard: zonder deze kan een trage fetch van een vorige selectie
    // (bv. alle 19 teams) na "Alles uit" alsnog binnenkomen en de net geleegde lijst
    // overschrijven met verouderde data — race condition, gevonden tijdens testen.
    // (In dev mode zorgt React StrictMode's dubbele effect-invocatie voor extra
    // cancel/restart-cycli — normaal en onschadelijk dankzij deze guard, alleen
    // zichtbaar trager dan de productie-build.)
    let geannuleerd = false

    if (geselecteerd.size === 0) {
      setWedstrijden([])
      setLaden(false)
      return
    }
    setLaden(true)
    Promise.all(
      [...geselecteerd].map((teamSlug) => {
        const team = teams.find((t) => t.teamSlug === teamSlug)
        return fetch(`${API_URL}/wedstrijden/${teamSlug}`)
          .then((res) => (res.ok ? res.json() : []))
          .then((matches) => matches.map((m) => ({ ...m, teamSlug, teamName: team?.teamName })))
          .catch(() => [])
      })
    ).then((perTeam) => {
      if (geannuleerd) return
      const alle = perTeam.flat().sort((a, b) => new Date(a.starttime) - new Date(b.starttime))
      setWedstrijden(alle)
      setLaden(false)
    })

    return () => {
      geannuleerd = true
    }
  }, [geselecteerd, teams])

  const gefilterd = useMemo(() => {
    if (thuisUit === 'thuis') return wedstrijden.filter((m) => m.isHome)
    if (thuisUit === 'uit') return wedstrijden.filter((m) => !m.isHome)
    return wedstrijden
  }, [wedstrijden, thuisUit])

  function toggleTeam(teamSlug) {
    setGeselecteerd((prev) => {
      const next = new Set(prev)
      if (next.has(teamSlug)) next.delete(teamSlug)
      else next.add(teamSlug)
      return next
    })
  }

  const groepen = useMemo(() => groepeerPerNiveau(teams), [teams])

  return (
    <div className="w-full max-w-md bg-mokum-card rounded-2xl border border-mokum-border p-8 mt-4">
      <h2 className="font-heading text-base text-white mb-1">Aankomende wedstrijden</h2>
      <p className="text-mokum-dim text-xs mb-4">
        Vink teams aan om te filteren
      </p>

      <div className="flex justify-end gap-3 text-xs text-mokum-redlight mb-2">
        <button type="button" onClick={() => setGeselecteerd(new Set(teams.map((t) => t.teamSlug)))} className="hover:underline">
          Alles aan
        </button>
        <button type="button" onClick={() => setGeselecteerd(new Set())} className="hover:underline">
          Alles uit
        </button>
      </div>

      <div className="max-h-48 overflow-y-auto border border-mokum-border rounded-lg p-3 mb-4 space-y-3">
        {groepen.map(([niveau, teamsInGroep]) => (
          <div key={niveau}>
            <div className="text-[11px] uppercase tracking-wide text-mokum-dim mb-1">{niveau}</div>
            <div className="space-y-1">
              {teamsInGroep.map((team) => (
                <label key={team.teamSlug} className="flex items-center gap-2 text-sm text-mokum-text cursor-pointer">
                  <input
                    type="checkbox"
                    checked={geselecteerd.has(team.teamSlug)}
                    onChange={() => toggleTeam(team.teamSlug)}
                    className="accent-mokum-red"
                  />
                  {team.teamName}
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        {[
          { value: 'alles', label: 'Alle wedstrijden' },
          { value: 'thuis', label: 'Alleen thuis' },
          { value: 'uit', label: 'Alleen uit' },
        ].map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => setThuisUit(opt.value)}
            className={`text-xs rounded-full px-3 py-1.5 border transition-colors ${
              thuisUit === opt.value
                ? 'bg-mokum-red border-mokum-red text-white'
                : 'bg-mokum-bg border-mokum-border text-mokum-dim hover:text-white'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {laden && <p className="text-mokum-dim text-sm">Laden…</p>}

      {!laden && gefilterd.length === 0 && (
        <p className="text-mokum-dim text-sm">Geen wedstrijden voor deze selectie.</p>
      )}

      {!laden && gefilterd.length > 0 && (
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {gefilterd.map((m) => (
            <Link
              key={`${m.teamSlug}-${m.matchId}`}
              to={`/wedstrijd/${m.teamSlug}/${m.matchId}`}
              className="block bg-mokum-bg border border-mokum-border rounded-lg px-4 py-3 hover:border-mokum-red transition-colors"
            >
              <div className="text-white text-sm font-medium">
                {m.isHome ? `${m.teamName} - ${m.opponent}` : `${m.opponent} - ${m.teamName}`}
              </div>
              <div className="text-xs text-mokum-dim mt-0.5">
                {formatWedstrijdDatum(m.starttime)} · {m.isHome ? 'Thuis' : 'Uit'}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}

export default AankomendeWedstrijden
