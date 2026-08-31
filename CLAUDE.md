# Mokum Competitie Agenda

Dashboard op `mokum-competitie.pdscloud.nl` waarmee Mokum-poolteams hun cuescore-wedstrijdschema
in Apple/Google Agenda krijgen via een abonnee-agenda (webcal), met een los .ics-bestand en
wedstrijddetail-overzichten (incl. spelers) voor captains als extra opties.

**Volledige context (Discover/Define-fase, al afgerond):** zie `DEFINE.md` in deze repo.
Lees dat bestand eerst bij twijfel over scope, requirements of eerdere keuzes.

## Kernpunten
- Doelgroep: alleen Mokum-teams/spelers, niet openbaar voor andere clubs
- Scope: architectuur generiek voor alle Mokum-teams/competities/regio's; content start met
  team "Mokum Mayhem" (Pool Noord-Holland Eerste Klasse 2026/2027)
- Puur agendafunctie — geen uitslagen/klassement in het dashboard
- Hoofdfunctie: webcal-abonnee-link (auto-update bij schemawijzigingen), niet primair een download
- Geavanceerd/optioneel: los .ics-bestand, herinnering aan/uit-schakelaar
- Wedstrijddetail-overzicht voor captains: kopieer-tekstblok voor WhatsApp + deelbare link
- UX: superrsimpel als hoofdpad, geavanceerde opties klein/ingeklapt
- Kosten: moet binnen gratis tiers van GitHub/Azure blijven (zie DEFINE.md voor onderbouwing)

## Stack (zelfde patroon als Peters andere pdscloud.nl-projecten)
- GitHub repo onder `peterdeswart96-ship-it`, branches `main` (productie) en `develop` (test)
- Frontend: React + Vite + Tailwind CSS
- Hosting: GitHub Pages, custom domain `mokum-competitie.pdscloud.nl`
- Backend: Azure Functions (Node.js) — cuescore-datasync + ICS/webcal-generatie
- CI/CD via GitHub Actions

## Openstaande punten (voortgang per 2026-08-31)
1. ✅ **Cuescore API verkend** — echte endpoints zijn `GET api.cuescore.com/tournament/?id=`
   en `/participant/?id=`. Matchdata bevat volledig venue-adres per wedstrijd en een
   bevestigde match-URL (`cuescore.com/match/{matchId}`). Zie `backend/src/lib/cuescore.js`.
2. ✅ **Datamodel** — `backend/src/config/teams.json`, gevuld met Mokum Mayhem
   (tournamentId `83574424`, teamId `2852247`).
3. ✅ **Venue-lookup grotendeels opgelost** — cuescore levert zelf het volledige adres per
   wedstrijd (geverifieerd voor alle 4 venues in dit seizoen), geen losse tabel nodig gebleken.
   Alleen relevant als een adres ooit ontbreekt/klopt niet.
4. ✅ **ICS/webcal-generator** — `backend/src/lib/ics.js`, VALARM uitzetbaar via
   `?reminder=off`. Aanname: wedstrijdduur 3 uur (cuescore geeft geen stoptime) — nog te
   bevestigen met Peter.
5. ✅ **Dashboard-UI (eerste versie)** — `frontend/src/App.jsx`: teamselector, hoofdknop
   "voeg toe aan agenda" (webcal), ingeklapt geavanceerd blok (herinnering-toggle + .ics-
   download).
6. **Nog te doen — achtergrond-sync**: de ICS-functie haalt nu live bij elk verzoek op bij
   cuescore (geen caching). Timer-trigger + ververs-knop nog te bouwen; ook relevant voor
   DEFINE.md's aanbeveling om niet per bezoek van cuescore's bèta-API af te hangen.
7. **Nog te doen — wedstrijddetail-overzicht** voor captains. Teamroster (captain + leden)
   is beschikbaar via `/participant/`, maar dat is niet per se de opstelling van één
   specifieke wedstrijd — nog te verifiëren of cuescore dat apart bijhoudt.

## Azure-resources (rg-mokum-competitie, westeurope)
- Function App: `func-mokum-competitie` (Linux, Node 24 — Node 20 is inmiddels EOL,
  dus lesson [1] uit de tools-repo setup-script is achterhaald op dit punt)
- Storage account: `stmokumcompetitie`
- Budget: €10/maand, alerts bij 50/80/100% naar peterdeswart96@gmail.com

## Setup
De skills `pdscloud-project-setup` en `github-pages-subdomain` bleken niet aanwezig op de
gebruikte machine (2026-08-31) — repo, branches, workflows, Azure-infra en GitHub Pages zijn
handmatig opgezet via Azure CLI/gh CLI (zie git-historie voor de exacte commits). Check bij
een nieuwe sessie eerst of de skills wél beschikbaar zijn; zo niet, is de git-historie hier
het beste referentiepunt voor de gevolgde stappen.

Test-omgeving is een subpad op hetzelfde domein (`mokum-competitie.pdscloud.nl/test`), geen
apart testdomein — zie DEFINE.md §Technische aanpak voor de reden.

Werk stap voor stap, wacht op bevestiging van Peter voordat je verdergaat, en geef altijd
volledige bestandsinhoud (geen instructies om regels handmatig te wijzigen).
