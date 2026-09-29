# 🎬 Movie Explorer – Discover Your Favorite Films

A responsive React web app for discovering trending movies, searching the TMDb catalogue, watching trailers and keeping a personal list of favorites.

Built with **React 18 (Create React App)**, **Material-UI v5**, **React Router v6**, **Axios**, the **TMDb API v3**, and **React Context + LocalStorage** for state and persistence.

---

## ✨ Features

| Area | What you get |
| --- | --- |
| **Auth** | Mock login at `/login` (any username ≥ 3 chars, password ≥ 4 chars, or the "demo" button). Session persists in LocalStorage. `/`, `/movie/:id` and `/favorites` are protected and redirect back to the page you wanted after sign-in. |
| **Navbar** | Sticky, responsive header with logo, Home/Favorites links (favorites count badge), debounced search bar, dark/light switch, account menu with logout, and a mobile drawer. |
| **Home** | Auto-rotating hero of trending movies, Today / This week toggle, debounced search (URL-driven `?q=`), genre filter, sort options, "last search" chip, responsive grid, infinite scroll **plus** a "Load more" button. |
| **Movie details** | Backdrop, poster, title, tagline, rating bar, runtime, release date, genres, overview, director/budget/revenue, horizontally scrollable cast, embedded YouTube trailer, trailer modal, recommendations, add/remove favorites. |
| **Favorites** | Per-user list stored in LocalStorage, filter + sort, remove single items or clear all (with confirmation). Syncs across browser tabs. |
| **Theme** | Dark/light mode, persisted in LocalStorage, defaults to your OS preference. |
| **UX & errors** | MUI Skeleton loaders everywhere data loads, fallback artwork for missing/broken posters and backdrops, friendly error messages (missing key, bad key, network, rate limit, 404) shown in MUI Snackbars and inline alerts with Retry buttons. |

---

## 🚀 Getting started

### Prerequisites

- **Node.js 18+** and **npm 9+**
- A free **TMDb account** for an API key

### 1. Get a TMDb API key

1. Sign up at <https://www.themoviedb.org/signup>.
2. Go to **Settings → API** (<https://www.themoviedb.org/settings/api>) and request a key (choose "Developer", fill in the short form).
3. Copy either the **API Key (v3 auth)** *or* the **API Read Access Token (v4)** — the app supports both.

### 2. Install and configure

```bash
cd movie-explorer
npm install
cp .env.example .env        # Windows (PowerShell): Copy-Item .env.example .env
```

Open `.env` and paste your key:

```env
REACT_APP_TMDB_API_KEY=your_tmdb_api_key_here
```

> CRA only reads `.env` on startup — restart `npm start` after editing it.

### 3. Run

```bash
npm start          # dev server at http://localhost:3000
npm run build      # optimized production build in /build
```

Log in with any username/password (or click **Use demo credentials**).

---

## 📁 Folder layout

```
movie-explorer/
├── public/
│   └── index.html
├── src/
│   ├── api/
│   │   └── tmdb.js              # Axios instance, error mapping, image helpers, API calls
│   ├── components/
│   │   ├── Navbar.jsx           # Header: links, debounced search, theme switch, logout
│   │   ├── MovieCard.jsx        # Poster card + PosterImage/PosterFallback helpers
│   │   ├── SkeletonLoader.jsx   # Grid, hero and details skeletons
│   │   └── TrailerModal.jsx     # Trailer dialog + reusable YouTubeEmbed
│   ├── context/
│   │   ├── AuthContext.js       # Mock login/logout, LocalStorage session
│   │   ├── ThemeContext.js      # MUI theme + persisted dark/light mode
│   │   └── MovieContext.js      # Favorites, last search, global Snackbar notifications
│   ├── hooks/
│   │   ├── useDebounce.js       # Debounce any value
│   │   └── useFetch.js          # Abortable fetch with loading/error/refetch
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Home.jsx
│   │   ├── MovieDetails.jsx
│   │   └── Favorites.jsx
│   ├── App.js                   # Providers, router, protected routes, layout
│   └── index.js                 # React DOM entry
├── .env.example
├── .gitignore
├── package.json
├── vercel.json                  # SPA rewrite so deep links work on Vercel
└── README.md
```

---

## 🔌 API usage

All requests go through the Axios instance in `src/api/tmdb.js` (base URL `https://api.themoviedb.org/3`):

| Helper | Endpoint |
| --- | --- |
| `fetchTrending({ page, timeWindow })` | `GET /trending/movie/{day\|week}` |
| `searchMovies({ query, page })` | `GET /search/movie` |
| `fetchMovieDetails(id)` | `GET /movie/{id}?append_to_response=credits,videos,recommendations` |
| `fetchGenres()` | `GET /genre/movie/list` |

- A v3 key is sent as the `api_key` query param; a v4 token (starts with `eyJ`) is sent as a `Bearer` header.
- Images use `https://image.tmdb.org/t/p/{size}{path}`; missing paths render a fallback.
- Requests are cancelled with `AbortController` when the user types a new search or leaves a page, so stale results never overwrite fresh ones.

### LocalStorage keys

| Key | Contents |
| --- | --- |
| `movie-explorer:session` | Mock user session |
| `movie-explorer:theme` | `"dark"` or `"light"` |
| `movie-explorer:favorites:<username>` | Array of saved movies |
| `movie-explorer:last-search` | Last search term |

---

## ▲ Deploying to Vercel

**Option A – Dashboard**

1. Push the project to a GitHub/GitLab/Bitbucket repo (`.env` is git-ignored — never commit your key).
2. At <https://vercel.com/new>, import the repo. Vercel detects **Create React App** automatically
   (build command `npm run build`, output directory `build`).
3. Under **Environment Variables**, add `REACT_APP_TMDB_API_KEY` with your key (for Production and Preview).
4. Click **Deploy**.

**Option B – CLI**

```bash
npm i -g vercel
vercel                                   # first deploy, follow the prompts
vercel env add REACT_APP_TMDB_API_KEY    # paste your key
vercel --prod                            # redeploy with the variable baked in
```

`vercel.json` rewrites every path to `index.html`, so refreshing `/favorites` or `/movie/123` works instead of returning a 404.

> Note: CRA embeds `REACT_APP_*` variables into the JS bundle at build time, so the key is visible to anyone inspecting the site. That's standard for TMDb client apps (the key is read-only), but if you need to hide it, proxy requests through a Vercel serverless function.

---

## 🧰 Scripts

| Command | Description |
| --- | --- |
| `npm start` | Start the dev server |
| `npm run build` | Production build to `/build` |
| `npm test` | Run the CRA test runner |

---

## 🙏 Credits

Movie data and images © [TMDb](https://www.themoviedb.org/). This product uses the TMDb API but is not endorsed or certified by TMDb.
