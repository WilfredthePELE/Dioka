FROM node:24-bookworm-slim AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --legacy-peer-deps --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:24-bookworm-slim AS runtime
WORKDIR /app
ENV NODE_ENV=production HOSTNAME=0.0.0.0 PORT=3000 DIOKA_DATA_DIR=/app/data
RUN mkdir /app/data && chown node:node /app/data
COPY --from=build --chown=node:node /app/.next/standalone ./
COPY --from=build --chown=node:node /app/.next/static ./.next/static
COPY --from=build --chown=node:node /app/public ./public
USER node
EXPOSE 3000
VOLUME ["/app/data"]
CMD ["node", "server.js"]
