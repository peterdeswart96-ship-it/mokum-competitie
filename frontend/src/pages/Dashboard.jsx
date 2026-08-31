import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api'

const REMINDER_OPTIONS = [
  { value: '60', label: '1 uur van tevoren' },
  { value: '120', label: '2 uur van tevoren' },
  { value: '240', label: '4 uur van tevoren' },
  { value: '1440', label: '24 uur van tevoren' },
  { value: 'off', label: 'Geen herinnering' },
]

function Dashboard() {
  const [teams, setTeams] = useState([])
  const [teamSlug, setTeamSlug] = useState('')
  const [reminder, setReminder] = useState('60')
  const [advancedOpen, setAdvancedOpen] = useState(false)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/teams`)
      .then((res) => {
        if (!res.ok) throw new Error('request failed')
        return res.json()
      })
      .then((data) => {
        setTeams(data)
        if (data.length > 0) setTeamSlug(data[0].teamSlug)
      })
      .catch(() => setError(true))
  }, [])

  const reminderParam = `?reminder=${reminder}`
  const icsHttpsUrl = teamSlug ? `${API_URL}/ics/${teamSlug}${reminderParam}` : ''
  const icsWebcalUrl = icsHttpsUrl.replace(/^https?:\/\//, 'webcal://')

  return (
    <div className="min-h-screen bg-mokum-bg text-mokum-text">
      <Header title="Competitie Agenda" subtitle="Wedstrijdschema in je eigen agenda" />

      <main className="flex items-start justify-center p-6">
        <div className="w-full max-w-md bg-mokum-card rounded-2xl border border-mokum-border p-8 mt-6">
          <h1 className="font-heading text-xl text-white mb-1">Kies je team</h1>
          <p className="text-mokum-dim mb-6 text-sm">
            Krijg je wedstrijdschema automatisch in je agenda
          </p>

          {error && (
            <p className="text-mokum-redlight mb-4">
              Kon de teams niet laden. Probeer het later opnieuw.
            </p>
          )}

          {!error && teams.length > 0 && (
            <>
              <label className="block text-sm font-medium text-mokum-text mb-1">
                Team
              </label>
              <select
                className="w-full bg-mokum-bg border border-mokum-border rounded-lg px-3 py-2 mb-6 text-white"
                value={teamSlug}
                onChange={(e) => setTeamSlug(e.target.value)}
              >
                {teams.map((t) => (
                  <option key={t.teamSlug} value={t.teamSlug}>
                    {t.teamName} — {t.competitionName}
                  </option>
                ))}
              </select>

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
                </div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default Dashboard
