<a name="top"></a>

# Headline Editor

Headline Editor lets you search the NY Times Archives, pick any article from any month since 1851, and rewrite its headline. Experiment with news history, craft your own versions, and explore how a single line of text shapes a story.

**Released:** 2024 March 10

**Author:** [Wanda L. McCrae](https://wandamccrae.com), Copyright 2024

**[Live site →](https://wlmccrae.github.io/headline-editor-ghpage/)**

---

## Table of Contents

- [Features](#features)
- [Accessibility](#accessibility)
- [Tech stack](#tech-stack)
  - [Frontend](#frontend)
  - [Backend](#backend)
  - [Infrastructure](#infrastructure)
- [Architecture](#architecture)
- [Project structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Local development setup](#local-development-setup)
  - [1. Clone the repository](#1-clone-the-repository)
  - [2. Configure environment variables](#2-configure-environment-variables)
  - [3a. Run with Docker (recommended)](#3a-run-with-docker-recommended)
  - [3b. Run without Docker](#3b-run-without-docker)
- [Testing](#testing)
  - [Running the frontend tests](#running-the-frontend-tests)
  - [Running the backend tests](#running-the-backend-tests)
  - [Code coverage](#code-coverage)
  - [Frontend test coverage](#frontend-test-coverage)
    - [`src/App.test.js`](#app-test)
    - [`src/DyslexiaContext.test.js`](#dyslexia-context-test)
    - [`src/components/MainPage.test.js`](#main-page-test)
    - [`src/components/SearchResults.test.js`](#search-results-test)
    - [`src/components/Footer.test.js`](#footer-test)
  - [Backend test coverage](#backend-test-coverage)
    - [`tests/test_health.py`](#test-health)
    - [`tests/test_nyt.py`](#test-nyt)
    - [`tests/test_main.py`](#test-main)
- [Deployment](#deployment)
  - [Frontend — GitHub Pages](#frontend--github-pages)
  - [Backend — Railway](#backend--railway)
  - [Production Docker (self-hosted)](#production-docker-self-hosted)
- [API reference](#api-reference)
  - [`GET /nyt`](#get-nyt)
  - [`GET /health`](#get-health)
- [Changelog](#changelog)
  - [2026-04-03 — UI redesign](#2026-04-03--ui-redesign)
  - [2026-04-02](#2026-04-02)
  - [2026-03-13 — Major redesign](#2026-03-13--major-redesign)
  - [2025-07-17](#2025-07-17)
  - [2024-05-17 — Initial release](#2024-05-17--initial-release)
- [Bug fixes](#bug-fixes)
  - [Frontend](#bugs-frontend)
  - [Backend](#bugs-backend)

---

## Features
[Back to Top](#top)

- **Archive search** — retrieve every article published in any month from January 1851 to the present via the NY Times Archive API
- **Headline editing** — select any article from the results and type a new headline; the display updates instantly
- **Article detail view** — see the original headline, byline, publication date, lead paragraph, abstract, news desk, article image, and a link to the original NY Times article
- **Dyslexia-friendly mode** — a toggle in the settings bar below the page title switches to the Lexend typeface with increased letter spacing, word spacing, and line height, and replaces the cool blue palette with warm, low-glare colors; preference is saved across sessions via `localStorage`
- **Accessibility** — semantic HTML landmarks (`<main>`, `<footer>`), correct heading hierarchy (`h1`→`h2`→`h3`), ARIA labels on all interactive controls, live regions for dynamic content, image alt text, and a skip-to-main-content link

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

## Tech stack

### Frontend
[Back to Top](#top)

| Technology | Version | Purpose |
|---|---|---|
| React | 18.3.1 | UI framework |
| Chakra UI | 2.8.2 | Component library and theming |
| Emotion | 11.x | CSS-in-JS (Chakra UI dependency) |
| Framer Motion | 11.x | Animation (Chakra UI dependency) |
| React Router DOM | 6.23.1 | Client-side routing |
| Lexend (Google Fonts) | — | Dyslexia-friendly typeface |

### Backend
[Back to Top](#top)

| Technology | Version | Purpose |
|---|---|---|
| Python | 3.12 | Runtime |
| FastAPI | 0.115.0 | API framework |
| Uvicorn | 0.30.6 | ASGI server |
| httpx | 0.27.2 | Async HTTP client for NYT requests |

### Infrastructure
[Back to Top](#top)

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
│   │       ├── MainPage.js     # Search form, dyslexia toggle, page layout
│   │       ├── MainPage.css
│   │       ├── SearchResults.js # Article list, detail view, headline editor
│   │       ├── SearchResults.css
│   │       ├── Footer.js       # Designer attribution
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

### 1. Clone the repository
[Back to Top](#top)

```bash
git clone https://github.com/wlmccrae/headline-editor-ghpage.git
cd headline-editor-ghpage
```

### 2. Configure environment variables
[Back to Top](#top)

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
[Back to Top](#top)

The dev compose file runs the frontend with hot reload. The backend is expected to be already deployed (Railway) or run separately.

```bash
docker compose -f docker-compose.dev.yml up --build
```

Frontend is available at **http://localhost:3000**.

To also run the backend locally, uncomment the `backend` service block in `docker-compose.dev.yml` and rebuild.

### 3b. Run without Docker
[Back to Top](#top)

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
[Back to Top](#top)

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
[Back to Top](#top)

```bash
cd backend
pip install -r requirements-test.txt
pytest tests/ -v
```

`requirements-test.txt` installs `pytest` on top of the existing runtime dependencies. The `httpx` client used by the backend is already present in `requirements.txt` and is required by FastAPI's TestClient.

---

### Code coverage
[Back to Top](#top)

<a name="code-coverage"></a>

Generated with `npm test -- --watchAll=false --coverage`. The two uncovered files are Create React App boilerplate that do not run in Jest: `index.js` (the browser entry point) and `reportWebVitals.js` (a performance-metrics stub). All application components have 100% statement, function, and line coverage.

| File | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| `App.js` | 100% | 100% | 100% | 100% |
| `DyslexiaContext.js` | 100% | 100% | 100% | 100% |
| `components/Footer.js` | 100% | 100% | 100% | 100% |
| `components/MainPage.js` | 100% | 100% | 100% | 100% |
| `components/SearchResults.js` | 100% | 96.6% | 100% | 100% |
| `index.js` | 0% | — | — | 0% |
| `reportWebVitals.js` | 0% | 0% | 0% | 0% |
| **All files** | **92.2%** | **92.6%** | **91.3%** | **92.0%** |

The one uncovered branch in `SearchResults.js` is the `|| ''` fallback in `setMyArticleImageUrl(sanitizeNytUrl(rawUrl) || '')`. It would only be reached if `sanitizeNytUrl` returned `null` for a URL already confirmed to be hosted on `nytimes.com` — a path that cannot occur. The `sanitizeNytUrl` function's null-return cases are all covered by the dedicated security tests.

---

### Frontend test coverage

<a name="app-test"></a>

#### [`src/App.test.js`](frontend/src/App.test.js) — 8 tests
[Back to Top](#top)

Smoke tests for the fully assembled app tree.

| Area | What is tested |
|---|---|
| Rendering | `h1` heading, subheading description text |
| Accessibility | Skip-to-main-content link present and points to `#main-content` |
| Form | Search form, year input, month select |
| Controls | Search button, Clear button |
| Settings bar | Dyslexia-friendly mode toggle |
| Footer | Designer attribution link |

<a name="dyslexia-context-test"></a>

#### [`src/DyslexiaContext.test.js`](frontend/src/DyslexiaContext.test.js) — 10 tests
[Back to Top](#top)

Isolates the dyslexia mode context provider and `useDyslexia` hook.

| Area | What is tested |
|---|---|
| Default state | Mode is `false` when `localStorage` is empty; no CSS class added to `<body>` |
| localStorage read | Reads saved `true` value on mount; ignores non-`"true"` strings |
| CSS class | `dyslexia-mode` added to `document.body` on enable; removed on disable |
| localStorage write | Persists `"true"` and `"false"` after toggle |
| Toggle | Flips `false → true` and `true → false` correctly |

<a name="main-page-test"></a>

#### [`src/components/MainPage.test.js`](frontend/src/components/MainPage.test.js) — 35 tests
[Back to Top](#top)

Covers the search form: rendering, all validation branches, fetch lifecycle, the Clear button, dyslexia toggle integration, year boundary values, and malformed API responses.

| Area | What is tested |
|---|---|
| Rendering | Heading, subheading, year input, month select (all 12 options), Search and Clear buttons, no alerts on load |
| Dyslexia toggle | Click enables mode and adds CSS class; double-click returns to off; `localStorage` updated |
| Format validation | Letters in year; no month selected; year shorter than 4 digits; `fetch` not called; empty form submission |
| Year validation | Year < 1851; year in the future; year = 1851 accepted; `fetch` not called on errors |
| Month validation | Future month in the current year; current year + current month accepted; `fetch` not called on error |
| Fetch URL | Correct `${BACKEND_URL}/nyt?year=…&month=…` constructed |
| Loading state | "Searching…" shown while fetch is in flight |
| Success | `SearchResults` rendered with article data; copyright text shown; empty `docs` array shows no-articles message |
| Fetch error | Error alert on non-ok response; error shown and "Searching…" cleared on network exception; missing `response.docs` caught and shown as error |
| Clear | Clears year errors, fetch errors, and hides `SearchResults` |

<a name="search-results-test"></a>

#### [`src/components/SearchResults.test.js`](frontend/src/components/SearchResults.test.js) — 39 tests
[Back to Top](#top)

Covers the article list, detail view, headline editor, all `sanitizeNytUrl` security cases, and defensive edge cases.

| Area | What is tested |
|---|---|
| Rendering | Archive heading with month name; month name resolves correctly from a string value (as produced by the `<Select>` input); placeholder text before selection; copyright |
| Dropdown | One option per article; empty dropdown when no articles |
| Article detail | Headline, byline, publication date, abstract, lead paragraph, news desk |
| Media | "No media." when `multimedia` has < 5 items, is empty, is `null`, or `multimedia[4].url` is missing; image shown when ≥ 5 valid items |
| Headline editor | Input and Edit button visible after selection; Edit updates displayed headline; "✓ Headline updated" confirmation appears after edit; confirmation auto-dismisses after 2.5 s; editing with no text typed empties the headline gracefully; the same article can be edited multiple times in succession |
| Article switching | Selecting a second article replaces the first article's content |
| Malformed data | `pub_date` as an invalid date string does not crash the component |
| Accessibility | `aria-live="polite"` on article detail panel; combobox has accessible label |
| **Security — `sanitizeNytUrl`** | Valid `https://www.nytimes.com/…` and `https://nytimes.com/…` URLs are accepted; `javascript:` URLs blocked (XSS); `data:` URLs blocked (XSS); non-NYT hostnames blocked (open redirect); `nytimes.com` appearing only in the path blocked (path spoofing); subdomain tricks blocked; empty string handled; image src prefixed with `https://nytimes.com/`; `src` never contains the literal string `"undefined"` |

<a name="footer-test"></a>

#### [`src/components/Footer.test.js`](frontend/src/components/Footer.test.js) — 3 tests
[Back to Top](#top)

The dyslexia toggle was moved from the Footer to the MainPage settings bar; its interaction tests now live in `MainPage.test.js`. This file covers only the designer attribution.

| Area | What is tested |
|---|---|
| Rendering | Attribution text, designer link with correct `href` and `target="_blank"` |

---

### Backend test coverage
[Back to Top](#top)

<a name="test-health"></a>

#### [`tests/test_health.py`](backend/tests/test_health.py) — 3 tests
[Back to Top](#top)

| What is tested |
|---|
| `GET /health` returns HTTP 200 |
| Response body is `{"status": "ok"}` |
| Content-Type is `application/json` |

<a name="test-nyt"></a>

#### [`tests/test_nyt.py`](backend/tests/test_nyt.py) — 29 tests
[Back to Top](#top)

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

<a name="test-main"></a>

#### [`tests/test_main.py`](backend/tests/test_main.py) — 7 tests
[Back to Top](#top)

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

### Frontend — GitHub Pages
[Back to Top](#top)

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
[Back to Top](#top)

The backend is deployed on Railway using `backend/Dockerfile`. Set the following environment variables in the Railway project dashboard:

| Variable | Value |
|---|---|
| `NYT_API_KEY` | Your NY Times API key |
| `CORS_HOST` | The GitHub Pages frontend URL |
| `ENV` | `production` |

The `railway.toml` in the repo root configures the Railway build and start commands.

### Production Docker (self-hosted)
[Back to Top](#top)

To run the production frontend container locally or on any host:

```bash
REACT_APP_BACKEND_URL=https://your-backend-url docker compose -f docker-compose.prod.yml up --build
```

The frontend is served by Nginx on port 80. The production Docker build is a two-stage build: Node builds the React app, then the compiled output is copied into an Nginx Alpine image.

---

## API reference
[Back to Top](#top)

The backend exposes two endpoints. In development mode, full interactive documentation is available at `/docs` (Swagger UI) and `/redoc`.

<a name="get-nyt"></a>

### `GET /nyt`
[Back to Top](#top)

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

<a name="get-health"></a>

### `GET /health`
[Back to Top](#top)

Health check endpoint. Returns `{"status": "ok"}`. No authentication required. Used for container health checks and uptime monitoring.

---

## Changelog
[Back to Top](#top)

### 2026-04-03 — UI redesign
[Back to Top](#top)

- Moved dyslexia toggle from the footer to a settings bar below the page title for better discoverability
- Replaced the month number input with a named month `<Select>` (January–December)
- Renamed "Reset Page" button to "Clear"
- Added "✓ Headline updated" confirmation message after editing a headline; auto-dismisses after 2.5 s
- Added "No articles were found" message when an archive search returns 0 results
- Added descriptive placeholder text in the article detail panel before an article is selected
- Expanded frontend test suite from 82 to **95 tests** across 5 suites; new coverage includes dyslexia toggle integration in `MainPage`, year boundary values (1851, current year/month), malformed API responses, headline confirmation auto-dismiss, empty headline editing, multiple consecutive edits, and string-typed month values from the Select input

### 2026-04-02
[Back to Top](#top)

- Fixed render bug in `SearchResults`: "No media." was not shown when `multimedia[4].url` was missing; stale image URL also persisted when switching articles
- Fixed `DyslexiaContext` tests: `userEvent.click` was not flushing React state updates and `useEffect` side effects synchronously; wrapped clicks in `await act(async () => {...})` so `localStorage` and `document.body` assertions are reliable
- Fixed `SearchResults` headline-editor tests: `findByText` was matching the `<option>` element before the article detail pane loaded; changed wait condition to `findByRole('heading', ...)` to target the correct element
- Added full frontend test suite (Jest + React Testing Library) and backend test suite (pytest)
- Added GitHub Actions CI/CD workflow: tests must pass before deployment to GitHub Pages proceeds
- Renamed Docker Compose files for clarity (`docker-compose.dev.yml`, `docker-compose.prod.yml`)

### 2026-03-13 — Major redesign
[Back to Top](#top)

- Introduced async Python/FastAPI backend to proxy NY Times API requests and keep the API key server-side
- Added dyslexia-friendly mode (Lexend typeface, adjusted spacing, warm colour palette, persisted via `localStorage`)
- Added accessibility features: semantic landmarks, ARIA labels, live regions, skip link, correct heading hierarchy
- Added `sanitizeNytUrl` to block XSS and open-redirect attacks on article and image URLs
- Added input validation for year upper bound, network error handling (frontend and backend), and `multimedia: null` crash fix
- Improved responsive layout and added a loading indicator during search
- Improved SEO meta tags and added Apple Touch icon
- Deployed backend to Railway; configured CORS

### 2025-07-17
[Back to Top](#top)

- Accessibility improvements (pre-redesign iteration)
- Updated main page instructions and SEO meta description
- Added WM logo; updated dependencies

### 2024-05-17 — Initial release
[Back to Top](#top)

- React SPA deployed to GitHub Pages via `gh-pages`
- NY Times Archive API integration (direct from the browser)
- Article list, detail view (headline, byline, date, abstract, lead paragraph, news desk, image), and headline editor
- Search form with year/month validation
- Chakra UI component library and custom theme colours

---

## Bug fixes
[Back to Top](#top)

The following bugs were identified through edge-case analysis and fixed alongside the test suite.

<a name="bugs-frontend"></a>

### Frontend
[Back to Top](#top)

| File | Bug | Fix |
|---|---|---|
| [`MainPage.js`](frontend/src/components/MainPage.js) | Month `"0"` bypassed the `< 1` validation check for past years and the current year, reaching `fetch` and returning a confusing generic error instead of a month validation message | Added `formMonth < 1` to both month-validation branches |
| [`MainPage.js`](frontend/src/components/MainPage.js) | A network exception thrown by `fetch` (e.g. offline, DNS failure) left the component stuck showing "Searching…" permanently — `setIsSearching(false)` and `setFetchError(true)` were never called | Wrapped the `fetch` call in `try/catch`; the `catch` block clears the loading state and sets the fetch error |
| [`SearchResults.js`](frontend/src/components/SearchResults.js) | `multimedia: null` from the API response caused a `TypeError` crash in two places: the `useEffect` image-URL guard (`null[4]`) and the render check (`null.length`) | Changed guard to `multimedia != null` (covers both `null` and `undefined`); used optional chaining `multimedia?.length` in the render |
| [`SearchResults.js`](frontend/src/components/SearchResults.js) | `multimedia[4].url` being `undefined` produced `src="https://nytimes.com/undefined"` — a silently broken image; the render condition `multimedia?.length > 4` also showed an `<Image>` even when the URL was empty, and switching articles left a stale URL in state | Added `&& foundArticle.multimedia[4].url` to the `useEffect` image-URL guard; added an `else` branch to reset `myArticleImageUrl` to `''` on article change; changed the render condition from `multimedia?.length > 4` to `myArticleImageUrl` so "No media." is shown whenever no valid URL is available |

<a name="bugs-backend"></a>

### Backend
[Back to Top](#top)

| File | Bug | Fix |
|---|---|---|
| [`routers/nyt_api_handler.py`](backend/routers/nyt_api_handler.py) | No upper-bound validation on `year` — values like `9999` passed validation and were forwarded to the NY Times API | Added `year > current_year` check using `datetime.now().year` |
| [`routers/nyt_api_handler.py`](backend/routers/nyt_api_handler.py) | An `httpx.RequestError` (network unreachable, timeout) propagated as an unhandled exception, producing FastAPI's generic `{"detail": "Internal Server Error"}` 500 with no useful context | Wrapped the `httpx` call in `try/except httpx.RequestError`; raises a clean `503` with a descriptive message |

---
