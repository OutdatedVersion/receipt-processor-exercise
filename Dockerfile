FROM node:20-alpine3.19 AS base
WORKDIR /app
COPY package*.json .

FROM base AS builder
RUN --mount=type=cache,target=/root/.npm \
  npm clean-install --no-audit --no-fund --prefer-offline
COPY tsconfig.json .
COPY src src
RUN npm run build

FROM base AS dependencies
RUN --mount=type=cache,target=/root/.npm \
  npm clean-install --production --no-audit --no-fund --prefer-offline

FROM base
COPY package.json .
COPY --from=dependencies /app/node_modules node_modules
COPY --from=builder /app/dist dist
EXPOSE 2000
CMD ["node", "dist/bootstrap.js"]
