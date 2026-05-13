# Research Findings

## 1. PDF Rendering Libraries

### Comparison: react-pdf vs pdfjs-dist vs react-pdf-viewer

| Criteria | react-pdf | pdfjs-dist | react-pdf-viewer |
|----------|-----------|------------|------------------|
| Annotation support | Limited (no text layer API) | Full control via renderTextLayer | Good UI but abstracted |
| 100+ page performance | Poor (renders all pages) | Excellent (virtual scroll possible) | Moderate |
| TypeScript | Good | Excellent (@types/pdfjs-dist) | Good |
| Text selection | None built-in | Full Range API access | Limited |
| Custom text layer | No | Yes | Partial |

**Decision: pdfjs-dist** — Direct access to `renderTextLayer`, `getTextContent()`, and viewport transform for precise annotation rect calculation. Only option that allows custom text selection + highlight overlay pipeline.

---

## 2. Text Layer Selection in PDF.js

### Approach
1. Render each page with `PDFPageProxy.render({ canvasContext, viewport })` for visual layer
2. Call `PDFPageProxy.getTextContent()` to obtain text items with their transforms
3. Use `renderTextLayer({ textContentSource, container, viewport })` to create a positioned `<div>` over the canvas
4. Listen to `mouseup` on the text layer div → read `window.getSelection()` → call `selection.getRangeAt(0)`
5. Use `range.getClientRects()` to get screen-space DOMRects of selected spans
6. Convert screen rects to PDF space: subtract canvas offset, divide by viewport scale → gives normalized `{x, y, w, h}` per rect
7. Store `rects[]` (one per line of selection), `selectedText`, `pageNumber` in annotation

### Key API
```ts
const textLayer = await page.getTextContent();
await renderTextLayer({ textContentSource: textLayer, container: textLayerDiv, viewport });
// After mouseup:
const sel = window.getSelection();
const range = sel.getRangeAt(0);
const rects = Array.from(range.getClientRects()).map(r => toPageCoords(r, viewport, canvasOffset));
```

---

## 3. AWS S3 Backend Upload Pattern (NestJS + @aws-sdk/client-s3 v3)

### Pattern: Backend receives file, uploads to S3
- Frontend sends multipart/form-data to NestJS endpoint
- NestJS uses `@aws-sdk/client-s3` `PutObjectCommand` to stream file to S3
- S3 bucket is **private** — no public access
- For serving: backend uses `GetObjectCommand`, pipes the response body stream to the HTTP response
- For watermarked download: backend fetches from S3, injects watermark with pdf-lib, streams modified PDF

```ts
// Upload
const command = new PutObjectCommand({ Bucket, Key, Body: fileBuffer, ContentType });
await s3.send(command);

// Download
const { Body } = await s3.send(new GetObjectCommand({ Bucket, Key }));
// Body is a ReadableStream — pipe to res
```

**Never use presigned URLs for GET** — all access goes through the backend so watermarks are always applied.

---

## 4. JWT Multi-User Auth (NestJS + Next.js)

### Pattern
- **Access token**: 15-minute JWT, stored in `httpOnly; SameSite=strict; Secure` cookie (`access_token`)
- **Refresh token**: 7-day JWT, stored in `httpOnly` cookie (`refresh_token`), stored hash in DB for rotation
- NestJS: `@nestjs/jwt` + `@nestjs/passport` + `passport-jwt`
- Two strategies: `JwtStrategy` (reads access_token cookie) and `JwtRefreshStrategy` (reads refresh_token cookie)
- `/auth/refresh` endpoint: validates refresh token, issues new pair, rotates refresh token in DB
- Next.js: middleware reads `access_token` cookie → redirects to `/login` if missing on protected routes

### Cookie extraction in NestJS
```ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req) => req?.cookies?.access_token,
      ]),
      secretOrKey: config.get('JWT_SECRET'),
    });
  }
}
```

---

## 5. PDF Watermarking with pdf-lib

### Pattern: In-memory watermark, no original modification
1. Fetch original PDF bytes from S3 → `Buffer`
2. `const pdfDoc = await PDFDocument.load(originalBytes)`
3. For each page: embed a semi-transparent diagonal text (username) using `page.drawText()`
4. `const watermarkedBytes = await pdfDoc.save()`
5. Stream bytes to client — original S3 object is never modified

```ts
import { PDFDocument, rgb, degrees } from 'pdf-lib';

async function injectWatermark(pdfBytes: Buffer, username: string): Promise<Uint8Array> {
  const doc = await PDFDocument.load(pdfBytes);
  const pages = doc.getPages();
  for (const page of pages) {
    const { width, height } = page.getSize();
    page.drawText(username, {
      x: width / 4, y: height / 2,
      size: 48, color: rgb(0.8, 0.8, 0.8),
      opacity: 0.3, rotate: degrees(45),
    });
  }
  return doc.save();
}
```

---

## 6. WebSocket (Socket.IO) vs Polling

| Criteria | Socket.IO | HTTP Polling |
|----------|-----------|-------------|
| Latency | ~10-50ms | ~500ms-2s |
| Server load | Low (persistent) | High (repeated requests) |
| NestJS integration | First-class (@nestjs/websockets) | Standard controllers |
| Reconnection | Built-in | Manual |
| Complexity | Moderate | Low |

**Decision: Socket.IO** — NestJS has `@WebSocketGateway` with rooms support. Clients join a room keyed by `documentId`. All annotation CRUD events broadcast to that room. Discussion replies require sub-100ms sync → polling is unacceptable.

```ts
@WebSocketGateway({ cors: true })
export class AnnotationsGateway {
  @WebSocketServer() server: Server;
  
  handleJoinDocument(@MessageBody() { documentId }: JoinDto, @ConnectedSocket() client: Socket) {
    client.join(`doc:${documentId}`);
  }
  
  broadcastAnnotation(documentId: string, event: string, payload: any) {
    this.server.to(`doc:${documentId}`).emit(event, payload);
  }
}
```

---

## 7. E-Signature: signature_pad + PDF Annotation Storage

### Approach
- `signature_pad` renders on a `<canvas>` element, captures stroke data
- `signaturePad.toDataURL('image/png')` → base64 data URL
- User clicks "Place on page" → enters placement mode; next click on PDF canvas sets `{x, y}`
- Signature stored as `Annotation { type: SIGNATURE, rects: [{x, y, w, h}], content: base64DataURL }`
- Rendering: `<img src={content} style={{ position: absolute, left: x*scale, top: y*scale, width: w*scale, height: h*scale }} />`

**Why not fabric.js**: signature_pad is purpose-built, smaller bundle (~10KB vs ~280KB), sufficient for basic e-signature capture.

---

## Summary of Stack Choices

| Layer | Library | Reason |
|-------|---------|--------|
| PDF Render | pdfjs-dist | Text layer access, virtual scroll, TypeScript |
| Backend Auth | @nestjs/jwt + passport-jwt | Cookie extraction, refresh rotation |
| S3 | @aws-sdk/client-s3 v3 | Modular, tree-shakeable, TypeScript-native |
| Watermark | pdf-lib | In-memory page mutation, no ffmpeg/CLI dep |
| Real-time | Socket.IO (NestJS gateway) | Built-in rooms, reconnect, NestJS integration |
| Signatures | signature_pad | Lightweight, purpose-built |
| File convert | libreoffice-convert | TXT/PPTX → PDF, wraps soffice subprocess |
