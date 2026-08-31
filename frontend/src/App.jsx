import { HashRouter, Routes, Route } from 'react-router-dom'
import MokumNav from './components/MokumNav'
import Dashboard from './pages/Dashboard'
import Handleiding from './pages/Handleiding'

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
      </Routes>
    </HashRouter>
  )
}

export default App
