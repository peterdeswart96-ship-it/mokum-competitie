# backend

Azure Functions (Node.js v4-model) — cuescore-datasync en ICS/webcal-generatie.

## Lokaal draaien

```
npm install
func start
```

`local.settings.json` bestaat lokaal (niet in git, want secrets) en moet minimaal bevatten:

```json
{
  "IsEncrypted": false,
  "Values": {
    "AzureWebJobsStorage": "",
    "FUNCTIONS_WORKER_RUNTIME": "node"
  },
  "Host": {
    "CORS": "*"
  }
}
```

De `Host.CORS`-instelling is nodig zodat de frontend (`npm run dev` op `localhost:5173`)
lokaal bij de API (`localhost:7071`) kan — anders blokkeert de browser dit met een
CORS-fout. In productie staat CORS ingesteld op de Azure Function App zelf
(`az functionapp cors add`), niet via deze file.

## Endpoints

- `GET /api/teams` — lijst van beschikbare teams/competities
- `GET /api/ics/{teamSlug}` — live .ics-feed voor een team (`?reminder=off` zet de
  VALARM-herinnering uit)
