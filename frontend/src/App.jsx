import { useEffect, useState } from 'react'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api'

function App() {
  const [teams, setTeams] = useState([])
  const [teamSlug, setTeamSlug] = useState('')
  const [reminderOn, setReminderOn] = useState(true)
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

  const team = teams.find((t) => t.teamSlug === teamSlug)
  const reminderParam = reminderOn ? '' : '?reminder=off'
  const icsHttpsUrl = teamSlug ? `${API_URL}/ics/${teamSlug}${reminderParam}` : ''
  const icsWebcalUrl = icsHttpsUrl.replace(/^https?:\/\//, 'webcal://')

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex items-center justify-center p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        <h1 className="text-2xl font-bold mb-1">Mokum Competitie Agenda</h1>
        <p className="text-gray-500 mb-6">
          Krijg je wedstrijdschema automatisch in je agenda
        </p>

        {error && (
          <p className="text-red-600 mb-4">
            Kon de teams niet laden. Probeer het later opnieuw.
          </p>
        )}

        {!error && teams.length > 0 && (
          <>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Team
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg px-3 py-2 mb-6"
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
              className="block w-full text-center bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg px-4 py-3 transition-colors"
            >
              Voeg toe aan mijn agenda
            </a>
            <p className="text-xs text-gray-400 mt-2 text-center">
              Werkt met Apple Agenda en Google Agenda. Je agenda-app ververst
              het schema vanzelf bij wijzigingen.
            </p>

            <button
              type="button"
              onClick={() => setAdvancedOpen((v) => !v)}
              className="mt-6 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              {advancedOpen ? 'Verberg geavanceerde opties' : 'Geavanceerde opties'}
            </button>

            {advancedOpen && (
              <div className="mt-4 border-t border-gray-200 pt-4 space-y-3">
                <label className="flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={reminderOn}
                    onChange={(e) => setReminderOn(e.target.checked)}
                  />
                  Herinnering 1 uur van tevoren
                </label>

                <a
                  href={icsHttpsUrl}
                  download={`${teamSlug}.ics`}
                  className="block text-sm text-blue-600 hover:underline"
                >
                  Download los .ics-bestand
                </a>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}

export default App
