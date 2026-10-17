FROM node:lts-alpine3.24 AS build

WORKDIR /build

RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc ./
RUN pnpm install --frozen-lockfile

COPY . .

RUN pnpm build && pnpm prune --prod

FROM node:lts-alpine3.24 AS runtime

ENV NODE_ENV=production \
    HOST=0.0.0.0 \
    PORT=3000 \
    BASE_DIR=/app

WORKDIR ${BASE_DIR}

COPY --from=build /build/build \
                  /build/node_modules \
                  /build/package.json\
                  /build/drizzle \
                  ./

RUN mkdir -p ${BASE_DIR}/data
VOLUME ["${BASE_DIR}/data"]

EXPOSE 3000

CMD ["node", "build/index.js"]
