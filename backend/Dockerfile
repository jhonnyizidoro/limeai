FROM node:22-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile
COPY src ./src
COPY tsup.config.ts ./
RUN pnpm build

FROM node:22-alpine
WORKDIR /app
RUN npm install -g pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --no-frozen-lockfile --prod --ignore-scripts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/db/migrations ./migrations
ENV NODE_ENV=production
CMD ["node", "dist/index.js"]
