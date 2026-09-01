import { HashRouter, Routes, Route } from 'react-router-dom'
import MokumNav from './components/MokumNav'
import Dashboard from './pages/Dashboard'
import Handleiding from './pages/Handleiding'
import WedstrijdDetail from './pages/WedstrijdDetail'
import Intern from './pages/Intern'

// HashRouter (i.p.v. BrowserRouter) omdat GitHub Pages geen server-side rewrites
// ondersteunt voor client-side routes, en de site zowel op / (productie) als op
// /test (testomgeving) draait — een hash-URL werkt overal zonder extra configuratie.
function App() {
  return (
    <HashRouter>
      <MokumNav />
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/handleiding" element={<Handleiding />} />
        <Route path="/wedstrijd/:teamSlug/:matchId" element={<WedstrijdDetail />} />
        <Route path="/intern" element={<Intern />} />
      </Routes>
    </HashRouter>
  )
}

export default App
