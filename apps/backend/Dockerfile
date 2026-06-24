FROM node:20-alpine AS base
RUN apk add --no-cache libreoffice

WORKDIR /app
COPY package.json package-lock.json* ./
COPY apps/backend/package.json ./apps/backend/
COPY packages/types/package.json ./packages/types/

FROM base AS deps
RUN npm install

FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY apps/backend ./apps/backend
COPY packages/types ./packages/types
WORKDIR /app/apps/backend
RUN npx prisma generate
RUN npm run build

FROM node:20-alpine AS runner
RUN apk add --no-cache libreoffice openssl wget \
    font-noto font-noto-extra font-noto-emoji font-dejavu ttf-freefont && \
    # Carlito = metrically identical to Calibri, so text layout matches the original PPTX
    mkdir -p /usr/share/fonts/carlito && \
    wget -q -P /usr/share/fonts/carlito \
      "https://github.com/googlefonts/carlito/raw/main/fonts/ttf/Carlito-Regular.ttf" \
      "https://github.com/googlefonts/carlito/raw/main/fonts/ttf/Carlito-Bold.ttf" \
      "https://github.com/googlefonts/carlito/raw/main/fonts/ttf/Carlito-Italic.ttf" \
      "https://github.com/googlefonts/carlito/raw/main/fonts/ttf/Carlito-BoldItalic.ttf" && \
    fc-cache -f /usr/share/fonts && \
    apk del wget && \
    # Alias common Microsoft fonts → free equivalents so LibreOffice uses correct metrics
    mkdir -p /etc/fonts/conf.d && \
    printf '%s\n' \
      '<?xml version="1.0"?>' \
      '<!DOCTYPE fontconfig SYSTEM "fonts.dtd">' \
      '<fontconfig>' \
      '  <alias><family>Calibri</family><prefer><family>Carlito</family></prefer></alias>' \
      '  <alias><family>Calibri Light</family><prefer><family>Carlito</family></prefer></alias>' \
      '  <alias><family>Arial</family><prefer><family>FreeSans</family></prefer></alias>' \
      '  <alias><family>Helvetica</family><prefer><family>FreeSans</family></prefer></alias>' \
      '  <alias><family>Times New Roman</family><prefer><family>FreeSerif</family></prefer></alias>' \
      '  <alias><family>Courier New</family><prefer><family>FreeMono</family></prefer></alias>' \
      '  <alias><family>Segoe UI</family><prefer><family>FreeSans</family></prefer></alias>' \
      '  <alias><family>Segoe UI Light</family><prefer><family>FreeSans</family></prefer></alias>' \
      '  <alias><family>Segoe UI Semibold</family><prefer><family>FreeSans</family></prefer></alias>' \
      '</fontconfig>' \
    > /etc/fonts/conf.d/99-ms-font-aliases.conf
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/apps/backend/dist ./dist
COPY --from=builder /app/apps/backend/prisma ./prisma
ENV NODE_ENV=production
EXPOSE 3005
CMD ["sh", "-c", "node node_modules/.bin/prisma migrate deploy && node dist/src/main"]
