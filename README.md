# my-friendly-quotes

A tiny app for keeping track of the funny things your friends say.

- Anyone can create a **group** (unlimited members, no invites needed) and get a
  long, unique, shareable link.
- A group can optionally be protected by a **password**.
- Anyone with the link (and password, if set) can add a **quote** with the
  name of who said it. The "who said it" field autocompletes from names
  already used in that group.
- No accounts are required. Each browser keeps its own list of groups
  (id + name + password) in `localStorage`.
- Optionally, you can create a small password-protected **account** to sync
  that list of groups across devices/browsers.

## Tech stack

- SvelteKit (Svelte 5, runes)
- SQLite via `better-sqlite3`
- Tailwind CSS v4 + DaisyUI v5 (custom "my-friendly-quotes" theme)
- English and German UI via `svelte-i18n`
- `bcryptjs` for password hashing, `nanoid` for IDs

## Running it

```bash
npm install
npm run dev       # http://localhost:5173, auto-reload
```

Production build:

```bash
npm run build
node build/index.js     # PORT=3000 by default
```

Run with Docker, using a named volume for the SQLite database:

```bash
docker build -t my-friendly-quotes .
docker run --rm -p 3000:3000 -v my-friendly-quotes-data:/app/data my-friendly-quotes
```

To keep the SQLite file in a directory on the host instead, replace the named
volume with `-v "$PWD/data:/app/data"`.

By default the SQLite file is created at `data/my-friendly-quotes.sqlite3`. Override
the location with the `DATABASE_PATH` environment variable.

## How the pieces fit together

```text
src/
  lib/
    storage.js            client-side localStorage helpers (the "vault")
    server/
      db.js                sqlite connection + schema
      groups.js             group + quote queries
      accounts.js           optional sync-account queries
  routes/
    +page.svelte           home: your groups, create/join forms
    group/[id]/+page.svelte group view: password gate, quotes, add-quote form
    account/+page.svelte    optional cross-device sync
    api/
      groups/                POST create group
      groups/[id]/            GET group info + quotes (password-gated)
      groups/[id]/quotes/      POST add a quote
      account/register/       POST create a sync account
      account/login/          POST log in, returns the account's group list
      account/sync/           POST merge this device's groups with the account
```

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
