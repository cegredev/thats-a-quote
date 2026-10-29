# thats-a-quote

**that's a quote!** is a small web-app for keeping and interacting with quotes from your friends, coworkers and loved ones! Also available as a PWA for your phone.

## Features

- Fully free and self-hostable
- Create groups that you can share with your friends simply by sending them the link
- Add quotes to those groups along with who said, when it was said and more context
- Join groups and sync your membership across devices by creating an account and logging in
- Get notified of new quotes on your phone if you install the PWA
- Coming soon: Comments and reactions on quotes (also with the ability to receive notifications)
- Support for multiple languages (contributions very welcome!)

## Quickstart

The only currently supported way to deploy the app is via its docker image.

To get started simply copy this `docker-compose.yml` and follow the instructions below:

```yml
services:
    quotes:
        image: ghcr.io/cegredev/thats-a-quote:latest
        volumes:
            - /path/to/storage:/app/data
        ports:
            - 3000:3000
        # If you want, you can specify a user to run the app as here:
        # user: "1000:1000"
        environment:
            - AUTH_SECRET= # See docs on generating
            - BASE_URL= # For example https://quotes.example.com
            - VAPID_SUBJECT= # To be able to send notifications with web-push, you need to specify an email. For example: mailto:you@example.com
```

Then run `docker compose up --detach` and that's it! [See how to install docker here](https://docs.docker.com/get-started/get-docker/).

### Configuration options

**thats-a-quote** can be configured only using environment variables. Below is a list of all options, and if and for what they are required. Certain variables can also be specified with a `_FILE` suffix and read their contents from the file at the specified path. Non `_FILE` entries take precedence.

| Name                   | Required | Type    | `_FILE` variant | Description                                                                                                                                                                                       |
| ---------------------- | -------- | ------- | --------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| AUTH_SECRET            | 🟩       | string  | 🟩              | Used by Better Auth for authentication. [See this tutorial to generate one](https://better-auth.com/docs/installation#set-environment-variables)                                                  |
| BASE_URL               | 🟩       | string  | 🟥              | Used by Better Auth for authentication. Should be the domain the app runs on, for example https://quotes.example.com                                                                              |
| VAPID_SUBJECT          | 🟨       | string  | 🟥              | Required to send notifications to clients. Should be an e-mail address belonging to you in the shape of `mailto:you@example.com` or a URL like `https://example.com/contact`.                     |
| JSON_LOGS              | 🟥       | boolean | 🟥              | If true, the server will output all logs as JSON. The default pretty logs can in theory become a performance bottleneck.                                                                          |
| FILL_WITH_DUMMY_DATA   | 🟥       | boolean | 🟥              | If true, the database will be filled with some dummy (demo) data on startup                                                                                                                       |
| RESET_INTERVAL_SECONDS | 🟥       | number  | 🟥              | The interval in seconds after which to reset the database. If FILL_WITH_DUMMY_DATA is true, the database will also be filled with dummy data. No value or a value <= 0 will disable this feature. |
| **Others:**            |
| BASE_DIR               | -        | string  | 🟥              | The base directory for all files. This is set in the docker image to `/app` and in development to `./` through `.env.development`, meaning you never need to set this.                            |

### Notifications

To get notifications for new quotes, comments, etc., you need to install the app as a PWA (progressive web app). Tutorials on [how to do that for all major browser can be found here](https://pwa.directory/how-to-install).

Notifications have currently been tested on:

| Browser | OS      | Works? |
| ------- | ------- | ------ |
| Chrome  | Android | ✅     |
| Firefox | Android | ❌     |

## More about deployment

### Releases

Releases follow [Semantic Versioning 2.0.0](https://semver.org/) and are automatically generated via Github Actions when a new tag is created.

You can read about changes in the description of each release and also [CHANGELOG.md](./CHANGELOG.MD), which is based on [keep a changelog](https://keepachangelog.com/en/1.0.0/).

### Directory structure

- `/app` this is the base directory in which all data is stored
    - `/app/data` this is where all irrecoverable data lives and is the (only) directory you should backup
    - `/app/build` build data required to run the app
    - `/app/node_modules` dependencies
    - `/app/drizzle` database migrations
    - `/app/package.json` package.json of the project

## About the code

### Technologies

- Frontend
    - Framework: [SvelteKit](https://svelte.dev/docs/kit/introduction)
    - Components: [shadcn-svelte](https://www.shadcn-svelte.com/)
    - Forms: [Superforms](https://superforms.rocks/)
    - Icons: [Lucide for Svelte](https://lucide.dev/guide/svelte/)
    - CSS: [Tailwind CSS](https://tailwindcss.com/)
    - i18n: [Paraglide JS](https://paraglidejs.com/sveltekit)
- Backend:
    - Database: [SQLite](https://sqlite.org/index.html)
    - ORM: [Drizzle](https://orm.drizzle.team/)
    - Authentication: [Better Auth](https://better-auth.com/)
    - Logging: [pino](https://getpino.io/#/)
    - Validation: [Zod](https://zod.dev/)
    - Notifications: [web-push](https://www.npmjs.com/package/web-push)
    - Rate limiting: [sveltekit-rate-limiter](https://github.com/ciscoheat/sveltekit-rate-limiter)
- The whole project is written in [TypeScript](https://www.typescriptlang.org/)

### Security

The code uses modern and widely-used frameworks and is fairly small. We (plan to) use renovate to regularly update dependencies to keep ahead of potential vulnerabilities and tech-debt. Still, there will be always be some risk with exposing this software to the public internet. These are some of the steps taken to ensure security in the project:

TODO

## Development

To setup and run the project locally, run the following commands:

```sh
git clone git@github.com:cegredev/thats-a-quote.git
cd thats-a-quote # or `code thats-a-quote` to open in VS Code
pnpm install
pnpm run dev
```

Or, if you plan to contribute back to the project through a PR (pull request), first fork the repo and clone your version instead.

### IDE Setup

For an easier time using the Paraglide JS internationalization library, install the [sherlock extension](https://marketplace.visualstudio.com/items?itemName=inlang.vs-code-extension) as mentioned in their docs.

### Conventions

#### Backend

The backend is solely implemented in SvelteKit and most requests to it will come through [form actions](https://svelte.dev/docs/kit/form-actions). Data received should be validated with [zod](https://zod.dev/) or preferably [sveltekit-superforms](https://superforms.rocks/) if applicable. Schemas are defined in `src/lib/zod-schemas.ts`.

Interaction with the database can be handled through one of three interfaces:

1. `db()` : Is raw access to [drizzle-orm](https://orm.drizzle.team/), which is what all other interfaces use under the hood.
2. `betterDb()`: Is raw access to [better-drizzle](https://better-drizzle.com/) which is essentially a helper library for drizzle and provides some useful utility functions.
3. `crud()`: A utility wrapper around drizzle for CRUD (create, update, read, delete) methods. Might fall out of favor as we investigate better-drizzle more.

We try to abstract `db()` and `betterDb()` out of the way, for example by using `crud()` or moving more complex queries into `src/lib/server/queries.ts`.

Authentication is handled in `src/hooks.server.ts` and information about the user added to [locals](https://svelte.dev/docs/kit/hooks#handle-locals). Use this to get information about the currently logged in user and to make sure only users who are allowed to interact with your content can do it.

#### Frontend

When writing frontend code, please use components whenever sensible in order to keep the code simple. Before creating one yourself, look at the `src/lib/components` directory and check if one fitting your needs already exist. You can also click through the web-app to check if you see the component that you need. It could also be that a component is directly imported from `src/lib/shadcn/components`, although we try to wrap every shadcn component in our own component. If you don't find what you're looking for, go to [shadcn-svelte.com](https://www.shadcn-svelte.com/) or [shadcn-svelte-extras.com](https://shadcn-svelte-extras.com/) to see if it already exists there and install it. We try to keep `+page.svelte` files minimal and only for structuring/layouting other components.

In order to get user input, we currently use forms and form actions for everything, even simple button presses with no other data attached. This will likely change once [SvelteKit's remote functions](https://svelte.dev/docs/kit/remote-functions) become stable. New forms should be created in the `src/lib/components/forms` directory and usually be based off `SchemaForm` which is a form component that automates a lot of things and integrates nicely with [sveltekit-superforms](https://superforms.rocks/), which we use. More on that in the backend part. For most forms, it makes sense to hide them behind a bottom-side drawer on mobile and a dialog on bigger screens. For this there is the `src/lib/components/drawer/ResponsiveDrawer.svelte` component which handles other things like closing on back navigation as well.

## License

This project is licensed under the [GNU Affero General Public License v3.0](https://choosealicense.com/licenses/agpl-3.0/).
