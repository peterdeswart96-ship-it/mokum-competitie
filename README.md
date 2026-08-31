# mokum-competitie

Dashboard waarmee Mokum-poolteams hun cuescore-wedstrijdschema in Apple/Google Agenda krijgen
via een abonnee-agenda (webcal), met een los .ics-bestand en wedstrijddetail-overzichten
(incl. spelers) voor captains als extra opties.

Zie [CLAUDE.md](CLAUDE.md) en [DEFINE.md](DEFINE.md) voor de volledige projectcontext.

## URLs
- Productie: https://mokum-competitie.pdscloud.nl
- Test: https://mokum-competitie.pdscloud.nl/test

## Stack
- Frontend: React + Vite + Tailwind CSS v3
- Hosting: GitHub Pages
- Backend: Azure Functions (Linux, Node 20)
- CI/CD: GitHub Actions

## Branch strategie
- `main` → productie
- `develop` → test
- `feature/*` → nieuwe features
