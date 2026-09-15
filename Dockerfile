FROM node:lts-alpine3.24 AS build

WORKDIR /app

RUN corepack enable

COPY package.json package-lock.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .

ENV DATABASE_PATH=data/db.sqlite3 \
    BETTER_AUTH_SECRET=NOT-A-REAL-SECRET \
    BETTER_AUTH_URL=http://localhost:3000

RUN pnpm build && pnpm prune --prod

FROM node:lts-alpine3.24 AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    DATABASE_PATH=/app/data/db.sqlite3 \
    MIGRATIONS_PATH=/app/drizzle

WORKDIR /app

COPY --from=build /app/build ./build
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/drizzle ./drizzle

RUN mkdir -p /app/data
VOLUME ["/app/data"]
EXPOSE 3000

CMD ["node", "build/index.js"]
