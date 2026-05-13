FROM node:20-alpine AS base
RUN apk add --no-cache libreoffice

WORKDIR /app
COPY package.json yarn.lock* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/types/package.json ./packages/types/

FROM base AS deps
RUN yarn install --frozen-lockfile

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY apps/backend ./apps/backend
COPY packages/types ./packages/types
WORKDIR /app/apps/backend
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache libreoffice
WORKDIR /app
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/node_modules ./node_modules
COPY --from=builder /app/apps/backend/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./.prisma
ENV NODE_ENV=production
EXPOSE 3001
CMD ["node", "dist/main"]
