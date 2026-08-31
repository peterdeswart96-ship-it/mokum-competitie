import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import Header from '../components/Header'
import { formatWedstrijdDatum } from '../lib/datum'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:7071/api'

function buildWhatsappTekst(match) {
  const lijnen = [
    `🎱 ${match.home.name} - ${match.away.name}`,
    `📅 ${formatWedstrijdDatum(match.starttime)}`,
    `📍 ${match.venueName}, ${match.venueAddress}`,
    '',
  ]

  for (const kant of [match.home, match.away]) {
    lijnen.push(`Opstelling ${kant.name}:`)
    if (kant.roster) {
      for (const lid of kant.roster.members) {
        const isAanvoerder = kant.roster.captain && lid.name === kant.roster.captain.name
        lijnen.push(`- ${lid.name}${isAanvoerder ? ' (aanvoerder)' : ''}`)
      }
    } else {
      lijnen.push('(opstelling nog niet bekend)')
    }
    lijnen.push('')
  }

  lijnen.push(`Meer info: ${match.matchUrl}`)
  return lijnen.join('\n')
}

function RosterKolom({ team }) {
  return (
    <div className="bg-mokum-bg border border-mokum-border rounded-lg p-4">
      <div className="text-white font-bold mb-2">{team.name}</div>
      {team.roster ? (
        <ul className="text-sm text-mokum-text space-y-1">
          {team.roster.members.map((lid) => {
            const isAanvoerder = team.roster.captain && lid.name === team.roster.captain.name
            return (
              <li key={lid.name}>
                {lid.name}
                {isAanvoerder && <span className="text-mokum-redlight text-xs ml-1">(aanvoerder)</span>}
              </li>
            )
          })}
        </ul>
      ) : (
        <p className="text-mokum-dim text-sm">Opstelling nog niet bekend.</p>
      )}
    </div>
  )
}

function WedstrijdDetail() {
  const { teamSlug, matchId } = useParams()
  const [match, setMatch] = useState(null)
  const [error, setError] = useState(false)
  const [gekopieerd, setGekopieerd] = useState(false)
  const [linkGekopieerd, setLinkGekopieerd] = useState(false)

  useEffect(() => {
    fetch(`${API_URL}/wedstrijd/${teamSlug}/${matchId}`)
      .then((res) => {
        if (!res.ok) throw new Error('request failed')
        return res.json()
      })
      .then(setMatch)
      .catch(() => setError(true))
  }, [teamSlug, matchId])

  function kopieerVoorWhatsapp() {
    navigator.clipboard.writeText(buildWhatsappTekst(match)).then(() => {
      setGekopieerd(true)
      setTimeout(() => setGekopieerd(false), 2000)
    })
  }

  function kopieerLink() {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setLinkGekopieerd(true)
      setTimeout(() => setLinkGekopieerd(false), 2000)
    })
  }

  return (
    <div className="min-h-screen bg-mokum-bg text-mokum-text">
      <Header title="Wedstrijddetails" subtitle="Voor teamaanvoerders" />

      <main className="max-w-2xl mx-auto p-6">
        <Link to="/" className="text-sm text-mokum-redlight hover:underline">
          ← Terug naar de agenda
        </Link>

        {error && (
          <p className="text-mokum-redlight mt-4">
            Kon deze wedstrijd niet laden. Controleer de link of probeer het later opnieuw.
          </p>
        )}

        {!error && !match && <p className="text-mokum-dim mt-4">Laden…</p>}

        {match && (
          <>
            <div className="bg-mokum-card border border-mokum-border rounded-xl p-6 mt-4">
              <h1 className="font-heading text-white text-xl mb-1">
                {match.home.name} - {match.away.name}
              </h1>
              <p className="text-mokum-dim text-sm mb-4">{match.competitionName} · {match.roundName}</p>

              <div className="text-sm text-mokum-text space-y-1">
                <p>📅 {formatWedstrijdDatum(match.starttime)}</p>
                <p>📍 {match.venueName}, {match.venueAddress}</p>
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              <RosterKolom team={match.home} />
              <RosterKolom team={match.away} />
            </div>

            <div className="flex flex-wrap gap-3 mt-6">
              <button
                type="button"
                onClick={kopieerVoorWhatsapp}
                className="bg-mokum-red hover:bg-red-700 text-white font-semibold rounded-lg px-4 py-2.5 transition-colors"
              >
                {gekopieerd ? 'Gekopieerd ✓' : 'Kopieer voor WhatsApp'}
              </button>
              <button
                type="button"
                onClick={kopieerLink}
                className="bg-mokum-bg border border-mokum-border hover:border-mokum-red text-white rounded-lg px-4 py-2.5 transition-colors"
              >
                {linkGekopieerd ? 'Link gekopieerd ✓' : 'Kopieer deelbare link'}
              </button>
            </div>

            <p className="text-xs text-mokum-dim mt-4">
              <Link to="/handleiding#captains" className="text-mokum-redlight hover:underline">
                Hoe gebruik ik dit als aanvoerder?
              </Link>
            </p>
          </>
        )}
      </main>
    </div>
  )
}

export default WedstrijdDetail
