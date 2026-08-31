function Header({ title, subtitle }) {
  return (
    <header className="sticky top-0 z-40 bg-mokum-card border-b border-mokum-border px-4 py-3.5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
      <div className="flex items-center gap-3">
        <img src="/mokum-logo.png" alt="Mokum Pool & Darts" className="h-10 w-auto" />
      </div>
      <div className="text-center">
        <div className="font-heading text-lg text-white leading-tight">
          <span className="text-mokum-red">Mokum</span> {title}
        </div>
        <div className="text-xs text-mokum-dim mt-0.5">{subtitle}</div>
      </div>
      <div />
    </header>
  )
}

export default Header
