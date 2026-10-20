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
| AUTH_SECRET            | 🟩       | string  | 🟩              | Used by Better Auth for authorization. [See this tutorial to generate one](https://better-auth.com/docs/installation#set-environment-variables)                                                   |
| BASE_URL               | 🟩       | string  | 🟥              | Used by Better Auth for authorization. Should be the domain the app runs on, for example https://quotes.example.com                                                                               |
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
cd thats-a-quote
pnpm install
pnpm run dev
```

Or, if you plan to contribute back to the project through a PR (pull request), first fork the repo and clone your version instead.

### IDE Setup

For an easier time using the Paraglide JS internationalization library, install the sherlock extension as mentioned in their docs.

## License

This project is licensed under the [GNU Affero General Public License v3.0](https://choosealicense.com/licenses/agpl-3.0/).
