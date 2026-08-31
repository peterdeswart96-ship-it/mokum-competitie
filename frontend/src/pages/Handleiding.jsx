import { Link } from 'react-router-dom'
import Header from '../components/Header'

function Stap({ nummer, children }) {
  return (
    <div className="flex gap-3 mb-3">
      <div className="flex-none w-6 h-6 rounded-full bg-mokum-red text-white text-xs font-bold flex items-center justify-center">
        {nummer}
      </div>
      <div className="text-sm text-mokum-text pt-0.5">{children}</div>
    </div>
  )
}

function Platform({ titel, children }) {
  return (
    <div className="bg-mokum-card border border-mokum-border rounded-xl p-5 mb-4">
      <h2 className="font-heading text-white text-base mb-3">{titel}</h2>
      {children}
    </div>
  )
}

function Handleiding() {
  return (
    <div className="min-h-screen bg-mokum-bg text-mokum-text">
      <Header title="Handleiding" subtitle="Agenda toevoegen op PC en mobiel" />

      <main className="max-w-2xl mx-auto p-6">
        <Link to="/" className="text-sm text-mokum-redlight hover:underline">
          ← Terug naar de agenda
        </Link>

        <p className="text-mokum-dim text-sm my-4">
          Je hoeft dit maar één keer te doen. De "Voeg toe aan mijn agenda"-knop op de
          hoofdpagina gebruikt een <strong className="text-white">abonnee-link (webcal)</strong>:
          je agenda-app ververst het wedstrijdschema daarna vanzelf als er iets wijzigt op
          Cuescore — geen handmatig werk meer nodig.
        </p>

        <Platform titel="📱 iPhone / iPad (Apple Agenda)">
          <Stap nummer="1">Tik op de pagina op <strong className="text-white">"Voeg toe aan mijn agenda"</strong>.</Stap>
          <Stap nummer="2">Je Agenda-app opent vanzelf met een "Nieuw abonnement"-scherm.</Stap>
          <Stap nummer="3">Tik rechtsboven op <strong className="text-white">"Voeg toe"</strong>. Klaar.</Stap>
        </Platform>

        <Platform titel="💻 Mac (Apple Agenda)">
          <Stap nummer="1">Klik op <strong className="text-white">"Voeg toe aan mijn agenda"</strong> in je browser.</Stap>
          <Stap nummer="2">De Agenda-app opent automatisch (of je browser vraagt eerst om toestemming).</Stap>
          <Stap nummer="3">Bevestig het abonnement. Klaar.</Stap>
        </Platform>

        <Platform titel="🤖 Android / Google Agenda">
          <p className="text-sm text-mokum-dim mb-3">
            Android herkent webcal-links niet altijd automatisch. Voeg 'm handmatig toe via
            Google Agenda op het web (werkt daarna ook op je telefoon, want je account
            synchroniseert):
          </p>
          <Stap nummer="1">Klik op <strong className="text-white">"Geavanceerde opties"</strong> op de hoofdpagina en kopieer de link achter <strong className="text-white">"Download los .ics-bestand"</strong> (rechtermuisknop → link kopiëren, of open 'm en kopieer de adresbalk).</Stap>
          <Stap nummer="2">Ga op je computer naar <a href="https://calendar.google.com" target="_blank" rel="noopener noreferrer" className="text-mokum-redlight hover:underline">calendar.google.com</a>.</Stap>
          <Stap nummer="3">Klik links op het <strong className="text-white">+</strong> naast "Andere agenda's" → <strong className="text-white">"Via URL"</strong>.</Stap>
          <Stap nummer="4">Plak de link (vervang <code className="text-xs bg-mokum-bg px-1 py-0.5 rounded">webcal://</code> door <code className="text-xs bg-mokum-bg px-1 py-0.5 rounded">https://</code> als je 'm van de knop hebt gekopieerd) en klik op <strong className="text-white">"Agenda toevoegen"</strong>.</Stap>
          <Stap nummer="5">Het schema verschijnt na een paar minuten ook in de Google Agenda-app op je telefoon.</Stap>
        </Platform>

        <Platform titel="🪟 Windows (Outlook)">
          <Stap nummer="1">Kopieer de link achter <strong className="text-white">"Download los .ics-bestand"</strong> (onder "Geavanceerde opties"), met <code className="text-xs bg-mokum-bg px-1 py-0.5 rounded">https://</code> in plaats van <code className="text-xs bg-mokum-bg px-1 py-0.5 rounded">webcal://</code>.</Stap>
          <Stap nummer="2">Ga in Outlook naar <strong className="text-white">Agenda → Agenda toevoegen → Abonneren via internet</strong>.</Stap>
          <Stap nummer="3">Plak de link en bevestig. Klaar.</Stap>
        </Platform>

        <div className="text-xs text-mokum-dim mt-6">
          <p className="mb-1">
            <strong className="text-white">Waarom niet gewoon downloaden?</strong> Dat kan ook
            (via "Geavanceerde opties" → "Download los .ics-bestand"), maar dan krijg je een
            momentopname: wijzigt Cuescore het schema later, dan moet je zelf opnieuw
            downloaden en importeren. Het abonnement hierboven doet dat automatisch.
          </p>
        </div>
      </main>
    </div>
  )
}

export default Handleiding
