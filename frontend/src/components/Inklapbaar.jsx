import { useState } from 'react'

function Chevron({ open }) {
  return (
    <svg
      className={`w-5 h-5 flex-none text-mokum-dim transition-transform ${open ? 'rotate-180' : ''}`}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 7.5L10 12.5L15 7.5" />
    </svg>
  )
}

function Inklapbaar({ titel, subtitel, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen)

  return (
    <div className="w-full max-w-md bg-mokum-card rounded-2xl border border-mokum-border mt-4 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-start justify-between gap-3 p-8 text-left"
        aria-expanded={open}
      >
        <div>
          <h2 className="font-heading text-xl text-white mb-1">{titel}</h2>
          {subtitel && <p className="text-mokum-dim text-sm">{subtitel}</p>}
        </div>
        <Chevron open={open} />
      </button>

      {open && <div className="px-8 pb-8 -mt-2">{children}</div>}
    </div>
  )
}

export default Inklapbaar
