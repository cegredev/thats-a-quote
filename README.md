# thats-a-quote

A tiny app for keeping track of the funny things your friends say.

- Anyone can create a **group** and get a
  unique, shareable link.
- A group can optionally be protected by a **password**.
- Anyone with the link (and password, if set) can add a **quote** with the
  name of who said it.
- No accounts are required. Quotes are stored on the server and each browser keeps its own list of groups
  (id + name + password) in local storage.
- Optionally, you can create a small password-protected **account** to sync
  that list of groups across devices/browsers.

## Tech stack

- SvelteKit (Svelte 5, runes)
- SQLite via `better-sqlite3`
- Tailwind CSS v4 + DaisyUI v5 (custom "thats-a-quote" theme)
- English and German UI via `svelte-i18n`
- `bcryptjs` for password hashing, `nanoid` for IDs

## Running it

```bash
pnpm install
pnpm run dev       # http://localhost:5173, auto-reload
```

Production build:

```bash
npm run build
node build/index.ts     # PORT=3000 by default
```

Run with Docker, using a named volume for the SQLite database:

```bash
docker build -t thats-a-quote .
docker run --rm -p 3000:3000 -v thats-a-quote-data:/app/data thats-a-quote
```

To keep the SQLite file in a directory on the host instead, replace the named
volume with `-v "$PWD/data:/app/data"`.

By default the SQLite file is created at `data/thats-a-quote.sqlite3`. Override
the location with the `DATABASE_PATH` environment variable.

Database schema changes are applied automatically when the server starts. The
`schema_migrations` table records applied migration versions; existing databases
are upgraded without replacing the SQLite file.

### How group passwords work

There are no sessions or cookies for groups. The password is checked against
the group's bcrypt hash on every request that needs it (viewing quotes, or
adding one). The browser remembers the password in `localStorage` next to
the group's id so you don't have to retype it, exactly as you'd expect from
a "no login" app.

### How account sync works

An account is just a username + password (bcrypt-hashed) with a JSON "vault"
column: the same `{id, name, password}` list your browser already keeps
locally. Syncing pushes your local list to the server, merges it with
whatever's already there (matching by group id), saves the result, and pulls
the merged list back into `localStorage`. Do this from two browsers with the
same account and they end up with the union of each other's groups.
