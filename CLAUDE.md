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

## Openstaande punten (eerste Develop-taken, in volgorde)
1. **Cuescore API verkennen** (`api.cuescore.com`, bèta, nauwelijks gedocumenteerd) —
   endpoints, velden, of spelersopstelling per wedstrijd beschikbaar is. Testen met
   tournament-ID `83574424` (Pool Noord-Holland Eerste Klasse 2026/2027).
2. **Datamodel** voor generieke opzet — config per team/competitie (bv. JSON met cuescore-
   tournament-ID per team), zodat nieuwe teams later eenvoudig toegevoegd kunnen worden.
3. **Venue-lookup tabel** — cuescore geeft alleen locatienamen, geen adressen; nodig voor
   bruikbare ICS-locaties.
4. **ICS/webcal-generator** met VALARM (herinnering, uitzetbaar).
5. **Dashboard-UI**: team-/competitieselector, hoofdknop "voeg toe aan agenda", geavanceerde
   opties ingeklapt.
6. **Achtergrond-sync**: Azure Function timer-trigger + handmatige ververs-knop.
7. **Wedstrijddetail-overzicht** voor captains (afhankelijk van punt 1 — spelersdata).

## Setup
Gebruik de bestaande skills voor de repo- en domeinopzet:
- `pdscloud-project-setup` — GitHub repo, branches, GitHub Actions, DNS, Azure infra, Claude Code-config
- `github-pages-subdomain` — subdomein `mokum-competitie.pdscloud.nl` koppelen aan de repo

Werk stap voor stap, wacht op bevestiging van Peter voordat je verdergaat, en geef altijd
volledige bestandsinhoud (geen instructies om regels handmatig te wijzigen).
