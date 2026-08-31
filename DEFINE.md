# Mokum Competitie Agenda — Projectprompt (4D-framework)

**Projectnaam / subdomein:** `mokum-competitie.pdscloud.nl`
**Eigenaar:** Peter de Swart
**Status:** Define-fase afgerond, klaar voor Develop

---

## 1. Discover — probleem & context

- Poolcompetities in Nederland (KNBB, georganiseerd per regio) worden geadministreerd via **cuescore.com**: wedstrijdschema's, uitslagen en klassementen staan daar alleen als webpagina.
- Spelers moeten dit handmatig overtypen in hun eigen agenda — foutgevoelig en tijdrovend, en gebeurt in de praktijk vaak niet, waardoor wedstrijden gemist worden.
- Mokum Pool & Darts heeft meerdere teams die in verschillende competitieniveaus en regio's spelen:
  - Niveaus: Eredivisie, Divisies (1/2/3), Klasses (1/2/3)
  - Regio's: o.a. Noord-Holland (Peters eigen team "Mokum Mayhem" speelt hier)
- Cuescore heeft een **bèta JSON API** op `api.cuescore.com` (tournament-, match- en resultaatdata). Documentatie is minimaal ("try it out"-pagina zonder vaste specificatie) — endpoint-structuur moet tijdens de Develop-fase uitgetest worden. Fallback: Peter levert een cuescore-tournamentlink, het systeem/Claude haalt en verwerkt de data.
- Elke wedstrijdrij op cuescore toont: ronde, thuisteam (links) vs uitteam, locatie, datum/tijd. Thuisteam bepaalt de locatie (bijv. "Mokum Pool & Darts" voor Mokum-thuiswedstrijden, of het clubhuis van de tegenstander bij uitwedstrijden).

## 2. Define — scope & requirements

### Doel
Eén centraal, interactief dashboard waar Mokum-spelers hun team en competitie selecteren en direct een agendabestand (.ics) downloaden met al hun wedstrijden — thuis én uit — inclusief locatie, cuescore-link en ingebouwde herinnering.

### Scope fase 1
- **Architectuur meteen generiek opzetten** (herbruikbaar voor alle Mokum-teams, alle niveaus, alle regio's).
- **Content start smal**: eerst alleen "Mokum Mayhem" — Pool Noord-Holland Eerste Klasse 2026/2027 — als eerste gevulde dataset, om het end-to-end werkend te krijgen.
- Daarna uitbreiden naar overige Mokum-teams/competities.

### Doelgroep
Alleen Mokum-teams en -spelers. Niet openbaar bedoeld voor andere clubs (kan later heroverwogen worden, maar nu bewust buiten scope).

### Functionaliteit
- **Wel:** wedstrijdschema bekijken, team-/competitieselector, ICS-download.
- **Niet (bewust buiten scope):** uitslagen, klassement/ranglijst tonen. Puur een agenda-tool, geen livescore-dashboard.

### Distributie
- Geen geautomatiseerde e-mail. Peter deelt de link naar het dashboard zelf via **Facebook** en de **WhatsApp-groep(en)** van de teams.
- Consequentie: het dashboard moet er zelfstandig gebruiksvriendelijk uitzien voor iemand die 'm voor het eerst opent via een gedeelde link (geen uitleg via e-mail erbij).

### Data-actualiteit
- **Combinatie** van:
  - Automatische achtergrond-sync (bijv. Azure Function met timer-trigger die periodiek de cuescore API bevraagt)
  - Handmatige "ververs"-knop op de pagina zelf voor direct actuele data

### Schemawijzigingen tijdens het seizoen (belangrijke toevoeging)
Cuescore-schema's kunnen tussentijds wijzigen (afgelaste wedstrijden, verzette data). Een eenmalig gedownload .ics-bestand raakt dan verouderd, en spelers moeten niet zelf handmatig oude wedstrijden gaan verwijderen en opnieuw importeren.

**Hoofdoplossing: abonnee-agenda (webcal-link)** in plaats van een eenmalige download.
- De backend serveert een **live, altijd actuele .ics-feed** per team/competitie op een vaste URL (`webcal://mokum-competitie.pdscloud.nl/...`).
- Spelers voegen deze link **één keer** toe aan Apple Agenda of Google Agenda.
- De agenda-app ververst deze feed vervolgens zelf periodiek (meestal elke paar uur, buiten onze controle — is app-instelling).
- Wijzigingen in het cuescore-schema komen zo vanzelf door, zonder dat de speler iets hoeft te doen.
- Dit is dezelfde live-feed die de achtergrond-sync (Azure Function) al ververst — geen dubbel werk.
- **Downloaden van een statisch .ics-bestand blijft beschikbaar als geavanceerde/optionele route** (zie UX-principe hieronder), voor wie liever los importeert. Bij die route moet duidelijke uitleg op de site staan hoe je de oude reeks vervangt bij een schemawijziging.

### Inhoud van elk agenda-item (.ics event)
- Datum/tijd
- Tegenstander
- Locatie (adres van de speellocatie, niet alleen de naam)
- Link naar de cuescore-wedstrijdpagina (in de beschrijving/notes van het event)
- Ingebouwde ICS-herinnering (`VALARM`) — standaard ondersteund door zowel Apple Agenda als Google Agenda, dus geen aparte notificatie-oplossing nodig

### Bestandsformaat
- **Eén universeel .ics-bestand / .ics-feed** per team/competitie-selectie. ICS is de open standaard die zowel iOS/Apple Agenda als Android/Google Agenda ondersteunt — geen aparte bestanden per platform nodig.

### UX-principe: simpel als hoofdpad, geavanceerd als optie
- Het dashboard moet zonder uitleg vooraf te gebruiken zijn — spelers komen binnen via een gedeelde Facebook-/WhatsApp-link, zonder begeleidende instructie.
- **Standaardpad (groot, prominent):** team/competitie kiezen → één knop "Voeg toe aan mijn agenda" die de webcal-abonnee-link opent (of activeert via een duidelijke stap-voor-stap uitleg per platform, want iOS en Android verschillen hierin).
- **Geavanceerd (klein, ingeklapt/optioneel):**
  - Los .ics-bestand downloaden (naast de abonnee-link)
  - Herinnering **aan/uit-schakelaar** — standaard aan, maar spelers die geen ICS-herinnering willen kunnen 'm zelf uitzetten
- Korte, on-page uitleg waar nodig (bijv. "wat is een abonnee-agenda en waarom werkt dit beter dan downloaden") — kort en visueel, geen lange tekstblokken.

### Wedstrijddetail-overzicht (voor captains)
Nieuwe functie, specifiek voor teamaanvoerders: een overzichtspagina/kaart per aankomende wedstrijd, bedoeld om te posten in bijv. de team-WhatsApp.
- **Inhoud:** datum/tijd, thuis-/uitteam, locatie, en waar mogelijk de **spelersopstelling** van beide teams.
- **Deelvorm — beide aanbieden:**
  1. Kopieer-knop die een kant-en-klaar, netjes opgemaakt tekstblok genereert (direct plakbaar in WhatsApp)
  2. Directe link naar een pagina met dezelfde wedstrijddetails, die captains ook los kunnen delen
- **Open punt (Develop-fase):** nog onbekend of cuescore per wedstrijd spelersnamen/opstelling bijhoudt via de API. Uit te zoeken tijdens het verkennen van de API. Als dit niet beschikbaar is: fallback waarbij captains de opstelling zelf handmatig invoeren op het dashboard.

### Kosteninschatting
Doel: het project draaiend houden **binnen gratis tiers** van GitHub en Azure, geen hard maandbudget.

| Onderdeel | Verwachte kosten | Toelichting |
|---|---|---|
| GitHub Pages + Actions | €0 | Gratis voor publieke repositories |
| Azure Functions (Consumption plan) | €0 (naar verwachting) | Gratis maandelijkse grant: 1 miljoen requests + 400.000 GB-s. Bij een klein team-dashboard (periodieke sync + incidentele bezoekers) blijft het verbruik hier ruim onder |
| Azure Storage (voor caching van cuescore-data, indien gebruikt) | Enkele centen/maand | Niet inbegrepen in de gratis grant, maar bij kleine datavolumes verwaarloosbaar |
| Domein `pdscloud.nl` | €0 extra | Al in bezit, geen nieuwe kosten per subdomein |
| Cuescore API | Onbekend/risico | Geen prijsvermelding gevonden (lijkt gratis), maar het is expliciet een **bèta-endpoint zonder garanties** — risico is eerder beschikbaarheid/rate limits dan kosten. Dit moet tijdens Develop bevestigd worden |

**Conclusie:** realistisch gezien past dit project ruim binnen de gratis tiers van GitHub en Azure. Het enige echte risico zit niet in kosten, maar in de **stabiliteit van de cuescore bèta-API** (kan zonder aankondiging wijzigen). Aanbevolen: tijdens Develop een cache-laag bouwen (bijv. data 1x per uur ophalen en opslaan) zodat het dashboard niet direct afhankelijk is van de live beschikbaarheid van cuescore bij elk bezoek.

### Technische aanpak
Zelfde patroon als Peters overige pdscloud.nl-projecten:
- GitHub-repo onder `peterdeswart96-ship-it`, branches `main` (productie) en `develop` (test)
- Frontend: React + Vite + Tailwind CSS
- Hosting: GitHub Pages, custom domain `mokum-competitie.pdscloud.nl` (test: `mokum-competitie.test.pdscloud.nl`)
- Backend: Azure Functions (Node.js) voor de cuescore-datasync en ICS-generatie
- CI/CD via GitHub Actions
- Claude Code-compatibele projectstructuur (`.claude/`-map)

## 3. Develop — openstaande punten & bouwaanpak

Nog niet besloten / uit te zoeken tijdens het bouwen:

1. **Cuescore API verkennen** — welke endpoints bestaan er precies voor tournament/match-data, welke velden krijg je terug, is authenticatie nodig?
2. **Datamodel voor generieke opzet** — hoe wordt een nieuw team/competitie/regio toegevoegd? Handmatige config (bijv. JSON-bestand met cuescore-tournament-ID per team) is de eenvoudigste eerste stap.
3. **Venue/locatie-lookup** — cuescore toont alleen locatienamen (bijv. "Café Purple Pool", "Postcentrum Boven 1-2"), geen adressen. Er is een aparte tabel nodig die locatienaam koppelt aan een volledig adres, zodat de ICS-locatie bruikbaar is in Maps-apps.
4. **Herinnering-timing** — hoeveel tijd van tevoren moet de VALARM afgaan? (instelbaar maken of vaste waarde, bijv. 1 uur of 1 dag vooraf)
5. **Beheer** — voorlopig beheert alleen Peter welke teams/competities in het systeem staan; later evt. uit te breiden met input van andere teamaanspreekpunten.

Bouwvolgorde (voorstel):
1. Repo + subdomein opzetten (via bestaande pdscloud-project-setup / github-pages-subdomain werkwijze)
2. Cuescore-datafetch module bouwen en testen op de Mokum Mayhem-competitie
3. Venue-lookup tabel opzetten
4. ICS-generator bouwen (incl. VALARM)
5. Dashboard-UI: selector + downloadknop
6. Achtergrond-sync (Azure Function timer) + handmatige refresh-knop toevoegen
7. Testen, daarna uitbreiden met overige Mokum-teams

## 4. Deliver — oplevering & rollout

1. Eerst volledig testen met eigen team (Mokum Mayhem, Pool Noord-Holland Eerste Klasse)
2. Live zetten op `mokum-competitie.pdscloud.nl`
3. Link delen via Facebook en de teamgenoten-WhatsApp-groep
4. Feedback ophalen van teamgenoten (werkt de .ics goed op hun telefoon, klopt de herinnering, etc.)
5. Daarna stap voor stap uitbreiden: overige Mokum-teams toevoegen, andere competitieniveaus (Eredivisie, Divisies, Klasses) en regio's
