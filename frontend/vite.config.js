import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// base is overridden to '/test/' by de test-deploy workflow (VITE_BASE), want de
// testomgeving draait op een subpad (mokum-competitie.pdscloud.nl/test) i.p.v. een
// los domein — anders verwijzen de gebouwde asset-paden naar de root en laadt /test/
// per ongeluk de productie-bundle (of 404't zodra de content uit elkaar loopt).
export default defineConfig({
  plugins: [react()],
  base: process.env.VITE_BASE || '/',
})
