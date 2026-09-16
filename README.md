# Shelf of Books

An interactive, minimalist digital library for tracking reading habits, inspired by a popular bookshelf concept on Framer.

**Live:** https://sonayoktan.github.io/bookshelf/

Visitors are greeted with a sample shelf. After signing up, everyone can build and manage their own shelf, synced across devices.

## Features

- **Three shelf views**: book spines on a wooden shelf, front covers, and a reading timeline grouped by year and month
- **Personal shelves**: email and password sign-up; each user's books are private to them
- **Book details**: rating, reading status, favorites, personal review and saved quotes
- **Smart add**: search Google Books and Open Library to fill in title, author and cover automatically
- **Search**: prioritized matching across titles, authors, genres, quotes and notes
- **Filters**: by genre and reading status, with statistics that follow the active genre
- **Dark mode**, keyboard navigation between books, page-flip sound and a confetti celebration for finished books
- **Backup**: export and import the shelf as JSON

## Tech Stack

| Layer | Technology |
| --- | --- |
| UI | [React 18](https://react.dev), [Vite 5](https://vitejs.dev) |
| Styling | [Tailwind CSS 3](https://tailwindcss.com), [Radix UI](https://www.radix-ui.com) primitives, [lucide-react](https://lucide.dev) icons |
| Animation | [Framer Motion](https://www.framer.com/motion/), [canvas-confetti](https://github.com/catdad/canvas-confetti) |
| Auth & database | [Supabase](https://supabase.com) (Postgres, Auth, auto-generated REST API) |
| Hosting | [GitHub Pages](https://pages.github.com) |

## How It Works

The app is a static single-page application. There is no custom backend server:

```
Browser (GitHub Pages)  ──supabase-js──▶  Supabase REST API  ──▶  Postgres (books table)
                                          Supabase Auth (JWT)
```

- **Guests** see the sample shelf bundled in `src/data/initialBooks.js`. No database call is made, so the landing page always loads, even if the backend is unavailable.
- **Signed-in users** read and write their own rows in the `books` table through Supabase's auto-generated REST API.
- **Access control** is enforced in the database with Row Level Security: a user can only select, insert, update or delete rows where `user_id` matches their own id. The publishable key shipped in the bundle is public by design.
- **Legacy data**: books saved in `localStorage` by earlier versions can be imported into an account after signing in.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) 20 or later, **or** [Docker](https://www.docker.com)
- A free [Supabase](https://supabase.com) project (optional; see below)

### 1. Clone the repository

```bash
git clone https://github.com/sonayoktan/bookshelf.git
cd bookshelf
```

### 2. Configure environment variables

```bash
cp .env.example .env.local
```

| Variable | Description |
| --- | --- |
| `VITE_SUPABASE_URL` | Your project URL, e.g. `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | The **publishable** (or legacy `anon`) key. Never use the secret / `service_role` key. |

> Leaving both empty runs the app in demo-only mode: the sample shelf works, but sign-in is hidden and editing is disabled.

### 3. Set up the database

The schema lives in [`supabase/migrations`](supabase/migrations). Apply it to your own Supabase project with the [Supabase CLI](https://supabase.com/docs/guides/cli):

```bash
npx supabase login
npx supabase link --project-ref <your-project-ref>
npx supabase db push
```

Alternatively, paste the migration file into the **SQL Editor** in the Supabase dashboard.

Then, in **Authentication → Sign In / Providers → Email**, turn off **Confirm email** (recommended for the free tier, which has a low email sending limit), and add your local and production URLs under **Authentication → URL Configuration**.

### 4. Run the app

With Node.js:

```bash
npm ci
npm run dev
```

With Docker, without installing anything locally:

```bash
docker run --rm -it -p 3000:3000 \
  -v "$PWD":/app -v bookshelf_node_modules:/app/node_modules -w /app \
  node:22-alpine sh -c "npm ci && npm run dev"
```

Open http://localhost:3000/bookshelf/.

## Available Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start the development server on port 3000 |
| `npm run build` | Create a production build in `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run deploy` | Build and publish `dist/` to the `gh-pages` branch |

## Project Structure

```
├── public/                  # Static assets (GIFs, page-flip sound)
├── src/
│   ├── components/          # Shelf, modals, navbar, stats, timeline
│   │   └── ui/              # Reusable primitives (button, card, input, dialog, badge)
│   ├── data/                # Sample books and genre list
│   ├── hooks/               # useAuth
│   ├── lib/                 # Supabase client, books API, search and helpers
│   ├── App.jsx              # App state and data flow
│   └── main.jsx
├── supabase/
│   ├── config.toml          # Supabase CLI configuration
│   └── migrations/          # Database schema and RLS policies
└── vite.config.js           # Base path is /bookshelf/ for GitHub Pages
```

## Deployment

The site is served from the `gh-pages` branch.

```bash
npm run deploy
```

Environment variables are embedded at build time, so run the deploy from a machine that has a valid `.env.local`. If you fork the project to a different repository name, update `base` in `vite.config.js` and the site URL in Supabase Auth settings.

## Contributing

Contributions, bug reports and ideas are welcome.

1. **Fork** the repository and create a branch from `main`:
   ```bash
   git checkout -b feature/short-description   # or fix/short-description
   ```
2. **Make your changes**, following the conventions below.
3. **Verify the production build passes:**
   ```bash
   npm run build
   ```
4. **Commit** using [Conventional Commits](https://www.conventionalcommits.org):
   ```
   feat: add reading goal progress bar
   fix: keep search dropdown open on mobile
   ```
5. **Open a pull request** against `main` with a short description of what changed and why. Include screenshots for visual changes.

### Conventions

- **Code** (identifiers, comments, database objects) is written in English. **User-facing text** in the interface is Turkish.
- **Styling** uses Tailwind CSS and should follow the existing soft pink / baby blue design language in both light and dark mode.
- **Interactive elements** need `cursor-pointer` and a visible hover state.
- **Database changes** go in a new migration (`npx supabase migration new <name>`). Never edit a migration that has already been applied.
- **Secrets** never go in the repository. `.env.local` is git-ignored; only the publishable key belongs in the frontend.

## Acknowledgements

- Design inspired by a bookshelf concept shared on [Framer](https://www.framer.com)
- Book data from [Google Books API](https://developers.google.com/books) and [Open Library](https://openlibrary.org/developers/api)
- Sample cover images from [Unsplash](https://unsplash.com)
