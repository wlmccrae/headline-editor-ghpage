# Headline Editor

**[Live site →](https://wlmccrae.github.io/headline-editor-ghpage/)**

Headline Editor lets you search the NY Times Archives, pick any article from any month since 1851, and rewrite its headline. Experiment with news history, craft your own versions, and explore how a single line of text shapes a story.

Released: March 10, 2024
Author: [Wanda L. McCrae](https://wandamccrae.com), Copyright 2024–2026

**Major Redesign**: March 13, 2026

Description:

- Async backend for NY Times API calls
- Dyslexia-friendly mode
- Accessibility for screen readers

---

## Features

- **Archive search** — retrieve every article published in any month from January 1851 to the present via the NY Times Archive API
- **Headline editing** — select any article from the results and type a new headline; the display updates instantly
- **Article detail view** — see the original headline, byline, publication date, lead paragraph, abstract, news desk, article image, and a link to the original NY Times article
- **Dyslexia-friendly mode** — a toggle in the footer switches to the Lexend typeface with increased letter spacing, word spacing, and line height, and replaces the cool blue palette with warm, low-glare colors; preference is saved across sessions via `localStorage`
- **Accessibility** — semantic HTML landmarks (`<main>`, `<footer>`), correct heading hierarchy (`h1`→`h2`→`h3`), ARIA labels on all interactive controls, live regions for dynamic content, image alt text, and a skip-to-main-content link

---

## Tech stack

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| Chakra UI | 2.8.2 | Component library and theming |
| Emotion | 11.x | CSS-in-JS (Chakra UI dependency) |
| Framer Motion | 11.x | Animation (Chakra UI dependency) |
| React Router DOM | 6.23.1 | Client-side routing |
| Lexend (Google Fonts) | — | Dyslexia-friendly typeface |

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.12 | Runtime |
| FastAPI | 0.115.0 | API framework |
| Uvicorn | 0.30.6 | ASGI server |
| httpx | 0.27.2 | Async HTTP client for NYT requests |

### Infrastructure
| Tool | Purpose |
|---|---|
| Docker | Containerisation for both services |
| Nginx | Static file serving in production frontend container |
| Railway | Backend hosting |
| GitHub Pages | Frontend hosting (`gh-pages` branch) |

---

## Architecture

```
Browser
  │
  ├── GitHub Pages (frontend)
  │     React SPA built with Create React App
  │     Served by Nginx inside Docker
  │
  └── Railway (backend)
        FastAPI application
        Proxies requests to the NY Times Archive API
        Keeps the NYT API key server-side
```

The frontend never talks directly to the NY Times API. All archive requests go through the backend, which holds the NYT API key and adds CORS headers for the frontend origin.

---

## Project structure

```
headline-editor-ghpage/
├── frontend/
│   ├── public/
│   │   └── index.html          # HTML shell, CSP headers
│   ├── src/
│   │   ├── index.js            # React entry point
│   │   ├── index.css           # Global styles, dyslexia-mode overrides
│   │   ├── App.js              # Root component, Chakra theme, skip link
│   │   ├── DyslexiaContext.js  # Context + hook for dyslexia mode toggle
│   │   └── components/
│   │       ├── MainPage.js     # Search form and page layout
│   │       ├── MainPage.css
│   │       ├── SearchResults.js # Article list, detail view, headline editor
│   │       ├── SearchResults.css
│   │       ├── Footer.js       # Dyslexia toggle switch, attribution
│   │       └── Footer.css
│   ├── Dockerfile              # Production: multi-stage build → Nginx
│   ├── Dockerfile.dev          # Development: CRA dev server with hot reload
│   └── package.json
├── backend/
│   ├── main.py                 # FastAPI app, CORS middleware
│   ├── routers/
│   │   └── nyt_api_handler.py  # GET /nyt and GET /health endpoints
│   ├── requirements.txt
│   └── Dockerfile              # python:3.12-slim, runs as non-root user
├── docker-compose.dev.yml      # Development: frontend container only
├── docker-compose.prod.yml     # Production: frontend container on port 80
└── .env                        # Local environment variables (not committed)
```

---

## Prerequisites

- **Node.js** 20+ and npm (for running the frontend locally without Docker)
- **Python** 3.12+ (for running the backend locally without Docker)
- **Docker** and Docker Compose (for containerised development)
- A **NY Times API key** — register at [developer.nytimes.com](https://developer.nytimes.com/) and enable the *Archive API*

---

## Local development setup

### 1. Clone the repository

```bash
git clone https://github.com/wlmccrae/headline-editor-ghpage.git
cd headline-editor-ghpage
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
ENV=development
NYT_API_KEY=your_nyt_api_key_here
REACT_APP_BACKEND_URL=http://localhost:8000
CORS_HOST=http://localhost:3000
```

| Variable | Description |
|---|---|
| `ENV` | Set to `development` to enable FastAPI `/docs` and `/redoc` |
| `NYT_API_KEY` | Your NY Times API key |
| `REACT_APP_BACKEND_URL` | URL the browser uses to reach the backend |
| `CORS_HOST` | Origin the backend will accept requests from |

### 3a. Run with Docker (recommended)

The dev compose file runs the frontend with hot reload. The backend is expected to be already deployed (Railway) or run separately.

```bash
docker compose -f docker-compose.dev.yml up --build
```

Frontend is available at **http://localhost:3000**.

To also run the backend locally, uncomment the `backend` service block in `docker-compose.dev.yml` and rebuild.

### 3b. Run without Docker

**Backend:**

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
NYT_API_KEY=your_key ENV=development uvicorn main:app --reload --port 8000
```

**Frontend** (separate terminal):

```bash
cd frontend
npm install
REACT_APP_BACKEND_URL=http://localhost:8000 npm start
```

Frontend is available at **http://localhost:3000**.
FastAPI interactive docs are available at **http://localhost:8000/docs** (development mode only).

---

## Deployment

### Frontend — GitHub Pages

Deployment is automated via GitHub Actions. Every push to `main` triggers `.github/workflows/deploy.yml`, which builds the React app and pushes the output to the `gh-pages` branch using the `gh-pages` npm package.

No manual steps are required.

The `homepage` field in `package.json` must be set to the GitHub Pages URL for routing to work correctly:

```json
"homepage": "https://wlmccrae.github.io/headline-editor-ghpage"
```

### Backend — Railway

The backend is deployed on Railway using `backend/Dockerfile`. Set the following environment variables in the Railway project dashboard:

| Variable | Value |
|---|---|
| `NYT_API_KEY` | Your NY Times API key |
| `CORS_HOST` | The GitHub Pages frontend URL |
| `ENV` | `production` |

The `railway.toml` in the repo root configures the Railway build and start commands.

### Production Docker (self-hosted)

To run the production frontend container locally or on any host:

```bash
REACT_APP_BACKEND_URL=https://your-backend-url docker compose -f docker-compose.prod.yml up --build
```

The frontend is served by Nginx on port 80. The production Docker build is a two-stage build: Node builds the React app, then the compiled output is copied into an Nginx Alpine image.

---

## API reference

The backend exposes two endpoints. In development mode, full interactive documentation is available at `/docs` (Swagger UI) and `/redoc`.

### `GET /nyt`

Fetches all articles for a given month from the NY Times Archive API.

**Query parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `year` | integer | Yes | 4-digit year. Must be 1851 or later. |
| `month` | integer | Yes | Month number 1–12. |

**Example:**

```
GET /nyt?year=1969&month=7
```

**Response:** JSON from the NY Times Archive API (`response.docs` array), including headline, byline, abstract, lead paragraph, publication date, news desk, multimedia, and article URL for each article.

**Error responses:**

| Status | Cause |
|---|---|
| 400 | Year before 1851, or month outside 1–12 |
| 500 | `NYT_API_KEY` environment variable not set |
| 4xx/5xx | Error returned by the NY Times API (status and message forwarded) |

---

### `GET /health`

Health check endpoint. Returns `{"status": "ok"}`. No authentication required. Used for container health checks and uptime monitoring.

---

## Accessibility

The site is built to work well with screen readers and keyboard navigation:

- **Skip link** — a "Skip to main content" link is the first focusable element on the page; it is visually hidden until focused
- **Landmarks** — `<main>`, `<footer>`, and `role="region"` on the article detail panel provide structural navigation
- **Heading hierarchy** — `h1` (page title) → `h2` (archive section) → `h3` (selected article headline)
- **Form labels** — all inputs have programmatic labels via `aria-label`; the visual `InputLeftAddon` elements are hidden from assistive technology with `aria-hidden="true"` to avoid duplication
- **Live regions** — `aria-live="polite"` on the results section and article detail panel announce changes without interrupting the user
- **Image alt text** — article images use the article headline as alt text
- **External links** — links that open in a new tab include that information in their `aria-label`
- **Dyslexia-friendly mode** — see Features section above
