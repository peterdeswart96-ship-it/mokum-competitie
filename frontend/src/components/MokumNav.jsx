import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

const INTERNAL = [
  { href: '/', label: 'Agenda', omschrijving: 'Team- en agendaselectie' },
  { href: '/handleiding', label: 'Handleiding', omschrijving: 'Agenda toevoegen op PC/mobiel' },
]

const EXTERN = [
  { href: 'https://mokum-streams.pdscloud.nl/mokumlive/', label: 'Mokum Live', omschrijving: 'Standen en livestreams' },
  { href: 'https://mokum-streams.pdscloud.nl/archief/', label: 'Archief', omschrijving: 'Zoek een eerder gespeelde partij' },
  { href: 'https://mokum-streams.pdscloud.nl/challenge.html', label: 'Challenge aanmaken', omschrijving: 'Zelf een challenge inplannen' },
  { href: 'https://poolen-amsterdam.nl/', label: 'Mokum-website', omschrijving: 'poolen-amsterdam.nl' },
  { href: 'https://www.youtube.com/@MokumPoolDarts', label: 'YouTube-kanaal', omschrijving: '@MokumPoolDarts' },
]

function MokumNav() {
  const [open, setOpen] = useState(false)
  const panelRef = useRef(null)
  const location = useLocation()

  useEffect(() => {
    function onClick(e) {
      if (open && panelRef.current && !panelRef.current.contains(e.target) && !e.target.closest('#mokumnav-knop')) {
        setOpen(false)
      }
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('click', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('click', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <>
      <button
        id="mokumnav-knop"
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label="Mokum-pagina's"
        onClick={(e) => { e.stopPropagation(); setOpen((v) => !v) }}
        className={`fixed top-3.5 right-4 z-50 w-10 h-10 rounded-lg border flex items-center justify-center text-white text-lg shadow-lg transition-colors ${
          open ? 'border-mokum-red bg-mokum-border' : 'border-mokum-border bg-mokum-card hover:border-mokum-red'
        }`}
      >
        ☰
      </button>

      {open && (
        <div
          ref={panelRef}
          className="fixed top-[60px] right-4 z-50 w-60 bg-mokum-card border border-mokum-border rounded-xl overflow-hidden shadow-2xl"
        >
          <div className="px-3.5 py-3 border-b border-mokum-border font-heading text-[13px] text-white uppercase tracking-wide">
            <span className="text-mokum-red">Mokum</span> Competitie
          </div>

          {INTERNAL.map((item) => {
            const isCurrent = location.pathname === item.href
            return isCurrent ? (
              <div key={item.href} className="px-3.5 py-2.5 border-b border-[#232323]">
                <div className="text-sm font-bold text-mokum-redlight">{item.label} (huidige pagina)</div>
                <div className="text-[11.5px] text-mokum-dim mt-0.5">{item.omschrijving}</div>
              </div>
            ) : (
              <Link
                key={item.href}
                to={item.href}
                onClick={() => setOpen(false)}
                className="block px-3.5 py-2.5 border-b border-[#232323] hover:bg-[#232323]"
              >
                <div className="text-sm font-bold text-white">{item.label}</div>
                <div className="text-[11.5px] text-mokum-dim mt-0.5">{item.omschrijving}</div>
              </Link>
            )
          })}

          {EXTERN.map((item, i) => (
            <a
              key={item.href}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`block px-3.5 py-2.5 border-b border-[#232323] last:border-b-0 hover:bg-[#232323] ${i === 0 ? 'border-t border-t-mokum-border' : ''}`}
            >
              <div className="text-sm font-bold text-white">
                {item.label}
                <span className="text-mokum-dim font-normal ml-1">↗</span>
              </div>
              <div className="text-[11.5px] text-mokum-dim mt-0.5">{item.omschrijving}</div>
            </a>
          ))}
        </div>
      )}
    </>
  )
}

export default MokumNav
