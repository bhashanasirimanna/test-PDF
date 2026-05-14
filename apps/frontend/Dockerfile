FROM node:20-alpine AS base
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json* ./
COPY apps/frontend/package.json ./apps/frontend/
COPY packages/types/package.json ./packages/types/
RUN npm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY apps/frontend ./apps/frontend
COPY packages/types ./packages/types
WORKDIR /app/apps/frontend
RUN npm run build

FROM base AS runner
ENV NODE_ENV=production
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/frontend/.next ./.next
COPY --from=builder /app/apps/frontend/package.json ./package.json
COPY --from=builder /app/apps/frontend/next.config.js ./next.config.js
COPY --from=builder /app/apps/frontend/public ./public
EXPOSE 3000
CMD ["node_modules/.bin/next", "start"]
