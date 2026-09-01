import { useState } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api'

// Bewust geen echte beveiliging — zie backend/src/functions/icsIntern.js. Puur een
// drempel zodat dit niet per ongeluk door willekeurige bezoekers gevonden wordt.
const WACHTWOORD = 'mkm!'
const OPSLAG_KEY = 'mokum-intern-ontgrendeld'

const REMINDER_OPTIONS = [
  { value: '60', label: '1 uur van tevoren' },
  { value: '120', label: '2 uur van tevoren' },
  { value: '240', label: '4 uur van tevoren' },
  { value: '1440', label: '24 uur van tevoren' },
  { value: 'off', label: 'Geen herinnering' },
]

function ophalenOntgrendeld() {
  try {
    return localStorage.getItem(OPSLAG_KEY) === 'true'
  } catch {
    return false
  }
}

function Intern() {
  const [ontgrendeld, setOntgrendeld] = useState(ophalenOntgrendeld)
  const [invoer, setInvoer] = useState('')
  const [fout, setFout] = useState(false)
  const [reminder, setReminder] = useState('120')

  function ontgrendel(e) {
    e.preventDefault()
    if (invoer === WACHTWOORD) {
      setOntgrendeld(true)
      setFout(false)
      try {
        localStorage.setItem(OPSLAG_KEY, 'true')
      } catch {
        // localStorage niet beschikbaar? Dan moet elke keer opnieuw ontgrendeld worden — geen probleem.
      }
    } else {
      setFout(true)
    }
  }

  const icsHttpsUrl = `${API_URL}/ics/intern/thuiswedstrijden?wachtwoord=${encodeURIComponent(WACHTWOORD)}&reminder=${reminder}`
  const icsWebcalUrl = icsHttpsUrl.replace(/^https?:\/\//, 'webcal://')

  return (
    <div className="min-h-screen bg-mokum-bg text-mokum-text">
      <Header title="Intern 🔒" subtitle="Alle thuiswedstrijden, alle teams" />

      <main className="flex flex-col items-center p-6">
        <Link to="/" className="text-sm text-mokum-redlight hover:underline self-start max-w-md w-full">
          ← Terug naar de agenda
        </Link>

        <div className="w-full max-w-md bg-mokum-card rounded-2xl border border-mokum-border p-8 mt-4">
          {!ontgrendeld && (
            <form onSubmit={ontgrendel}>
              <h1 className="font-heading text-xl text-white mb-1">Intern 🔒</h1>
              <p className="text-mokum-dim mb-6 text-sm">
                Voor Mark en Nick — alle thuiswedstrijden van alle Mokum-teams
                (Klasse, Divisie en Eredivisie) in één agenda.
              </p>
              <label className="block text-sm font-medium text-mokum-text mb-1">
                Wachtwoord
              </label>
              <input
                type="password"
                value={invoer}
                onChange={(e) => { setInvoer(e.target.value); setFout(false) }}
                className="w-full bg-mokum-bg border border-mokum-border rounded-lg px-3 py-2 mb-2 text-white"
                autoFocus
              />
              {fout && <p className="text-mokum-redlight text-sm mb-2">Onjuist wachtwoord.</p>}
              <button
                type="submit"
                className="w-full bg-mokum-red hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-2.5 transition-colors mt-2"
              >
                Ontgrendel
              </button>
            </form>
          )}

          {ontgrendeld && (
            <>
              <h1 className="font-heading text-xl text-white mb-1">Alle thuiswedstrijden</h1>
              <p className="text-mokum-dim mb-6 text-sm">
                Eén agenda met alle thuiswedstrijden van elk Mokum-team, over alle
                niveaus (Klasse, Divisie, Eredivisie).
              </p>

              <label className="block text-sm text-mokum-text mb-4">
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
                href={icsWebcalUrl}
                className="block w-full text-center bg-mokum-red hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-3 transition-colors"
              >
                Voeg toe aan mijn agenda
              </a>
              <p className="text-xs text-mokum-dim mt-2 text-center">
                Werkt met Apple Agenda. Ververst zelf elk uur bij wijzigingen —
                zelfde manier als de rest van het dashboard.
              </p>
            </>
          )}
        </div>
      </main>
    </div>
  )
}

export default Intern
