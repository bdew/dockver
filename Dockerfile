FROM --platform=$BUILDPLATFORM node:24 AS builder
WORKDIR /build

COPY package.json yarn.lock .yarnrc.yml ./

RUN --mount=type=cache,target=/root/.yarn/berry/cache,sharing=locked \
    corepack enable && \
    yarn install --immutable 

COPY . .

RUN yarn run lint
RUN yarn run build

FROM gcr.io/distroless/nodejs24-debian13:latest

WORKDIR /opt/dockver
USER 1000
COPY --from=builder /build/dist ./

ENV NODE_ENV=production

ENTRYPOINT ["/nodejs/bin/node", "index.js"]
