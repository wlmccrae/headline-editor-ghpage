<a name="top"></a>

# Headline Editor

Headline Editor lets you search the NY Times Archives, pick any article from any month since 1851, and rewrite its headline. Experiment with news history, craft your own versions, and explore how a single line of text shapes a story.

Released: March 10, 2024
Author: [Wanda L. McCrae](https://wandamccrae.com), Copyright 2024

**[Live site →](https://wlmccrae.github.io/headline-editor-ghpage/)**

---

## Table of Contents

- [Features](#features)
- [Tech stack](#tech-stack)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local development setup](#local-development-setup)
- [Testing](#testing)
- [Deployment](#deployment)
- [API reference](#api-reference)
- [Accessibility](#accessibility)
- [Changelog](#changelog)
- [Bug fixes](#bug-fixes)

---

## Features
[Back to Top](#top)

- **Archive search** — retrieve every article published in any month from January 1851 to the present via the NY Times Archive API
- **Headline editing** — select any article from the results and type a new headline; the display updates instantly
- **Article detail view** — see the original headline, byline, publication date, lead paragraph, abstract, news desk, article image, and a link to the original NY Times article
- **Dyslexia-friendly mode** — a toggle in the footer switches to the Lexend typeface with increased letter spacing, word spacing, and line height, and replaces the cool blue palette with warm, low-glare colors; preference is saved across sessions via `localStorage`
- **Accessibility** — semantic HTML landmarks (`<main>`, `<footer>`), correct heading hierarchy (`h1`→`h2`→`h3`), ARIA labels on all interactive controls, live regions for dynamic content, image alt text, and a skip-to-main-content link

---

## Tech stack
[Back to Top](#top)

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
[Back to Top](#top)

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
[Back to Top](#top)

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
[Back to Top](#top)

- **Node.js** 20+ and npm (for running the frontend locally without Docker)
- **Python** 3.12+ (for running the backend locally without Docker)
- **Docker** and Docker Compose (for containerised development)
- A **NY Times API key** — register at [developer.nytimes.com](https://developer.nytimes.com/) and enable the *Archive API*

---

## Local development setup
[Back to Top](#top)

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

## Testing
[Back to Top](#top)

The project has a full test suite covering functionality, rendering, input validation, and security. Frontend tests use **Jest** and **React Testing Library** (included with Create React App). Backend tests use **pytest** and FastAPI's built-in **TestClient**.

### Running the frontend tests

```bash
cd frontend
npm test
```

This launches Jest in watch mode. To run once and exit:

```bash
cd frontend
npm test -- --watchAll=false
```

### Running the backend tests

```bash
cd backend
pip install -r requirements-test.txt
pytest tests/ -v
```

`requirements-test.txt` installs `pytest` on top of the existing runtime dependencies. The `httpx` client used by the backend is already present in `requirements.txt` and is required by FastAPI's TestClient.

---

### Frontend test coverage

#### [`src/App.test.js`](frontend/src/App.test.js) — 8 tests
Smoke tests for the fully assembled app tree.

| Area | What is tested |
|---|---|
| Rendering | `h1` heading, subheading description text |
| Accessibility | Skip-to-main-content link present and points to `#main-content` |
| Form | Search form, year input, month input |
| Controls | Search button, Reset Page button |
| Footer | Dyslexia toggle, designer attribution link |

#### [`src/DyslexiaContext.test.js`](frontend/src/DyslexiaContext.test.js) — 10 tests
Isolates the dyslexia mode context provider and `useDyslexia` hook.

| Area | What is tested |
|---|---|
| Default state | Mode is `false` when `localStorage` is empty; no CSS class added to `<body>` |
| localStorage read | Reads saved `true` value on mount; ignores non-`"true"` strings |
| CSS class | `dyslexia-mode` added to `document.body` on enable; removed on disable |
| localStorage write | Persists `"true"` and `"false"` after toggle |
| Toggle | Flips `false → true` and `true → false` correctly |

#### [`src/components/MainPage.test.js`](frontend/src/components/MainPage.test.js) — 31 tests
Covers the search form: rendering, all validation branches, fetch lifecycle, and the Reset button.

| Area | What is tested |
|---|---|
| Rendering | Heading, subheading, inputs, buttons, no alerts on load |
| Format validation | Letters in year, letters in month, year shorter than 4 digits; `fetch` not called; empty form submission |
| Year validation | Year < 1851, year in the future; `fetch` not called |
| Month validation | Month 13 in a past year; month `0` in a past year; month `0` in the current year; future month in the current year; `fetch` not called in all cases |
| Fetch URL | Correct `${BACKEND_URL}/nyt?year=…&month=…` constructed |
| Loading state | "Searching…" shown while fetch is in flight |
| Success | `SearchResults` rendered with article data; copyright text shown |
| Fetch error | Error alert shown on non-ok response; error shown and "Searching…" cleared on network exception |
| Reset | Clears year errors, fetch errors, and hides `SearchResults` |

#### [`src/components/SearchResults.test.js`](frontend/src/components/SearchResults.test.js) — 34 tests
Covers the article list, detail view, headline editor, all `sanitizeNytUrl` security cases, and defensive edge cases.

| Area | What is tested |
|---|---|
| Rendering | Archive heading with month name, placeholder text, copyright |
| Dropdown | One option per article; empty dropdown when no articles |
| Article detail | Headline, byline, publication date, abstract, lead paragraph, news desk |
| Media | "No media." when `multimedia` has < 5 items, is empty, is `null`, or `multimedia[4].url` is missing; image shown when ≥ 5 valid items |
| Headline editor | Input and Edit button visible after selection; Edit updates the displayed headline |
| Article switching | Selecting a second article replaces the first article's content |
| Malformed data | `pub_date` as an invalid date string does not crash the component |
| Accessibility | `aria-live="polite"` on article detail panel; combobox has accessible label |
| **Security — `sanitizeNytUrl`** | Valid `https://www.nytimes.com/…` and `https://nytimes.com/…` URLs are accepted; `javascript:` URLs blocked (XSS); `data:` URLs blocked (XSS); non-NYT hostnames blocked (open redirect); `nytimes.com` appearing only in the path blocked (path spoofing); subdomain tricks blocked; empty string handled; image src prefixed with `https://nytimes.com/`; `src` never contains the literal string `"undefined"` |

#### [`src/components/Footer.test.js`](frontend/src/components/Footer.test.js) — 10 tests

| Area | What is tested |
|---|---|
| Rendering | Dyslexia toggle label, attribution text, designer link with correct `href` and `target="_blank"` |
| Initial state | Toggle unchecked by default; checked when `localStorage` has `dyslexiaMode=true` |
| Interaction | Click enables mode and adds CSS class; second click disables mode and removes class; `localStorage` updated |

---

### Backend test coverage

#### [`tests/test_health.py`](backend/tests/test_health.py) — 3 tests

| What is tested |
|---|
| `GET /health` returns HTTP 200 |
| Response body is `{"status": "ok"}` |
| Content-Type is `application/json` |

#### [`tests/test_nyt.py`](backend/tests/test_nyt.py) — 29 tests
All outbound HTTP calls to the NY Times API are mocked — no network access required.

| Area | What is tested |
|---|---|
| Happy path | 200 response, proxied JSON contains `copyright` and `response` keys |
| API key forwarded | Outbound request to NYT includes `api-key` query parameter |
| URL construction | Correct NYT Archive URL built from `year`/`month` (e.g. `…/1969/7.json`) |
| Boundary values | Year 1851, current year, month 1, month 12 all accepted |
| Year validation | Year < 1851 → 400; year 0 → 400; year > current year → 400; year 9999 → 400; non-integer → 422; float → 422 |
| Month validation | Month 0 → 400; month 13 → 400; negative month → 400; non-integer → 422 |
| Missing parameters | Missing `year` → 422; missing `month` → 422; both missing → 422 |
| Missing API key | `NYT_API_KEY` unset or empty string → 500 with descriptive error detail |
| Network errors | `httpx.ConnectError` → 503; `httpx.ConnectTimeout` → 503 with "NY Times API" in detail |
| Upstream errors | 401, 429, and 503 from NYT API forwarded to the client unchanged |
| Error text length | Upstream error detail truncated to ≤ 200 characters |

#### [`tests/test_main.py`](backend/tests/test_main.py) — 7 tests

| Area | What is tested |
|---|---|
| CORS — allowed origin | `Access-Control-Allow-Origin` header matches the configured origin |
| CORS — preflight | OPTIONS preflight returns 200 for the allowed origin |
| CORS — unknown origin | Unregistered origin does not receive a matching CORS header |
| CORS — multiple origins | Comma-separated `CORS_HOST` allows each listed origin independently |
| Docs — production | `/docs` and `/redoc` return 404 when `ENV != development` |
| Docs — development | `/docs` and `/redoc` return 200 when `ENV=development` |

---

## Deployment
[Back to Top](#top)

### Frontend — GitHub Pages

Deployment is automated via GitHub Actions (`.github/workflows/deploy.yml`). Every push to `main` runs the full test suite first. The build and deploy only proceed if all tests pass.

The workflow has two sequential jobs:

| Job | What it does |
|---|---|
| `test` | Sets up Node 20 and Python 3.12, installs dependencies for both services, runs `npm test -- --watchAll=false --ci` (frontend) and `pytest tests/ -v` (backend) |
| `deploy` | Blocked by `needs: test` — only runs when `test` succeeds; builds the React app and pushes the output to the `gh-pages` branch |

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
[Back to Top](#top)

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
[Back to Top](#top)

The site is built to work well with screen readers and keyboard navigation:

- **Skip link** — a "Skip to main content" link is the first focusable element on the page; it is visually hidden until focused
- **Landmarks** — `<main>`, `<footer>`, and `role="region"` on the article detail panel provide structural navigation
- **Heading hierarchy** — `h1` (page title) → `h2` (archive section) → `h3` (selected article headline)
- **Form labels** — all inputs have programmatic labels via `aria-label`; the visual `InputLeftAddon` elements are hidden from assistive technology with `aria-hidden="true"` to avoid duplication
- **Live regions** — `aria-live="polite"` on the results section and article detail panel announce changes without interrupting the user
- **Image alt text** — article images use the article headline as alt text
- **External links** — links that open in a new tab include that information in their `aria-label`
- **Dyslexia-friendly mode** — see Features section above

---

## Changelog
[Back to Top](#top)

### 2026-04-02
- Fixed render bug in `SearchResults`: "No media." was not shown when `multimedia[4].url` was missing; stale image URL also persisted when switching articles
- Fixed `DyslexiaContext` tests: `userEvent.click` was not flushing React state updates and `useEffect` side effects synchronously; wrapped clicks in `await act(async () => {...})` so `localStorage` and `document.body` assertions are reliable
- Fixed `SearchResults` headline-editor tests: `findByText` was matching the `<option>` element before the article detail pane loaded; changed wait condition to `findByRole('heading', ...)` to target the correct element
- Added full frontend test suite (Jest + React Testing Library) and backend test suite (pytest)
- Added GitHub Actions CI/CD workflow: tests must pass before deployment to GitHub Pages proceeds
- Renamed Docker Compose files for clarity (`docker-compose.dev.yml`, `docker-compose.prod.yml`)

### 2026-03-13 — Major redesign
- Introduced async Python/FastAPI backend to proxy NY Times API requests and keep the API key server-side
- Added dyslexia-friendly mode (Lexend typeface, adjusted spacing, warm colour palette, persisted via `localStorage`)
- Added accessibility features: semantic landmarks, ARIA labels, live regions, skip link, correct heading hierarchy
- Added `sanitizeNytUrl` to block XSS and open-redirect attacks on article and image URLs
- Added input validation for year upper bound, network error handling (frontend and backend), and `multimedia: null` crash fix
- Improved responsive layout and added a loading indicator during search
- Improved SEO meta tags and added Apple Touch icon
- Deployed backend to Railway; configured CORS

### 2025-07-17
- Accessibility improvements (pre-redesign iteration)
- Updated main page instructions and SEO meta description
- Added WM logo; updated dependencies

### 2024-05-17 — Initial release
- React SPA deployed to GitHub Pages via `gh-pages`
- NY Times Archive API integration (direct from the browser)
- Article list, detail view (headline, byline, date, abstract, lead paragraph, news desk, image), and headline editor
- Search form with year/month validation
- Chakra UI component library and custom theme colours

---

## Bug fixes
[Back to Top](#top)

The following bugs were identified through edge-case analysis and fixed alongside the test suite.

### Frontend

| File | Bug | Fix |
|---|---|---|
| [`MainPage.js`](frontend/src/components/MainPage.js) | Month `"0"` bypassed the `< 1` validation check for past years and the current year, reaching `fetch` and returning a confusing generic error instead of a month validation message | Added `formMonth < 1` to both month-validation branches |
| [`MainPage.js`](frontend/src/components/MainPage.js) | A network exception thrown by `fetch` (e.g. offline, DNS failure) left the component stuck showing "Searching…" permanently — `setIsSearching(false)` and `setFetchError(true)` were never called | Wrapped the `fetch` call in `try/catch`; the `catch` block clears the loading state and sets the fetch error |
| [`SearchResults.js`](frontend/src/components/SearchResults.js) | `multimedia: null` from the API response caused a `TypeError` crash in two places: the `useEffect` image-URL guard (`null[4]`) and the render check (`null.length`) | Changed guard to `multimedia != null` (covers both `null` and `undefined`); used optional chaining `multimedia?.length` in the render |
| [`SearchResults.js`](frontend/src/components/SearchResults.js) | `multimedia[4].url` being `undefined` produced `src="https://nytimes.com/undefined"` — a silently broken image; the render condition `multimedia?.length > 4` also showed an `<Image>` even when the URL was empty, and switching articles left a stale URL in state | Added `&& foundArticle.multimedia[4].url` to the `useEffect` image-URL guard; added an `else` branch to reset `myArticleImageUrl` to `''` on article change; changed the render condition from `multimedia?.length > 4` to `myArticleImageUrl` so "No media." is shown whenever no valid URL is available |

### Backend

| File | Bug | Fix |
|---|---|---|
| [`routers/nyt_api_handler.py`](backend/routers/nyt_api_handler.py) | No upper-bound validation on `year` — values like `9999` passed validation and were forwarded to the NY Times API | Added `year > current_year` check using `datetime.now().year` |
| [`routers/nyt_api_handler.py`](backend/routers/nyt_api_handler.py) | An `httpx.RequestError` (network unreachable, timeout) propagated as an unhandled exception, producing FastAPI's generic `{"detail": "Internal Server Error"}` 500 with no useful context | Wrapped the `httpx` call in `try/except httpx.RequestError`; raises a clean `503` with a descriptive message |

---
