// Generates a technical overview PDF for the Prokoti project
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'Prokoti-Technical-Overview.pdf');
const doc = new PDFDocument({ size: 'A4', margins: { top: 60, bottom: 60, left: 72, right: 72 }, autoFirstPage: false });
doc.pipe(fs.createWriteStream(OUT));

// ─── Colour palette ──────────────────────────────────────────────────────────
const C = {
  primary:    '#4F46E5',  // indigo-600
  secondary:  '#0EA5E9',  // sky-500
  accent:     '#10B981',  // emerald-500
  warn:       '#F59E0B',  // amber-500
  dark:       '#1E293B',  // slate-800
  mid:        '#475569',  // slate-600
  light:      '#94A3B8',  // slate-400
  bg:         '#F8FAFC',  // slate-50
  white:      '#FFFFFF',
  border:     '#E2E8F0',  // slate-200
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function newPage() {
  doc.addPage();
  doc.font('Helvetica').fontSize(8).fillColor(C.light)
     .text('Prokoti — Technical Overview', 72, 820, { align: 'left', width: 451 });
  doc.text(`Page ${doc.bufferedPageRange().count}`, 72, 820, { align: 'right', width: 451 });
  doc.moveDown(0);
  doc.y = 60;
}

let _currentPage = 0;
function ensureSpace(needed) {
  if (doc.y + needed > 780) newPage();
}

function h1(text) {
  ensureSpace(60);
  doc.fontSize(26).font('Helvetica-Bold').fillColor(C.primary).text(text, { paragraphGap: 6 });
  doc.moveDown(0.3);
  // underline
  doc.moveTo(72, doc.y).lineTo(523, doc.y).lineWidth(2).strokeColor(C.primary).stroke();
  doc.moveDown(0.6);
}

function h2(text) {
  ensureSpace(50);
  doc.fontSize(15).font('Helvetica-Bold').fillColor(C.dark).text(text, { paragraphGap: 4 });
  doc.moveDown(0.15);
  doc.moveTo(72, doc.y).lineTo(523, doc.y).lineWidth(0.5).strokeColor(C.border).stroke();
  doc.moveDown(0.5);
}

function h3(text) {
  ensureSpace(36);
  doc.fontSize(11).font('Helvetica-Bold').fillColor(C.secondary).text(text, { paragraphGap: 3 });
  doc.moveDown(0.2);
}

function body(text, opts = {}) {
  doc.fontSize(10).font('Helvetica').fillColor(C.mid).text(text, { lineGap: 3, paragraphGap: 6, ...opts });
  doc.moveDown(0.2);
}

function bullet(items) {
  items.forEach(item => {
    ensureSpace(18);
    doc.fontSize(10).font('Helvetica').fillColor(C.mid);
    const x = doc.x;
    doc.circle(x + 4, doc.y + 5, 2.5).fill(C.secondary);
    doc.text(item, x + 14, doc.y - 9, { lineGap: 3, paragraphGap: 4 });
  });
  doc.moveDown(0.3);
}

function badge(label, color) {
  const w = doc.widthOfString(label, { fontSize: 8 }) + 14;
  doc.roundedRect(doc.x, doc.y, w, 14, 4).fill(color + '22').stroke(color);
  doc.fontSize(8).font('Helvetica-Bold').fillColor(color)
     .text(label, doc.x + 7, doc.y - 13, { lineBreak: false });
  doc.x += w + 6;
}

function infoBox(title, content, color) {
  ensureSpace(70);
  const startY = doc.y;
  doc.roundedRect(72, startY, 451, 1, 4).fill(color + '15');  // height placeholder
  doc.fontSize(9).font('Helvetica-Bold').fillColor(color)
     .text(title, 84, startY + 8);
  doc.fontSize(9).font('Helvetica').fillColor(C.mid)
     .text(content, 84, doc.y + 2, { width: 427, lineGap: 3 });
  const endY = doc.y + 10;
  doc.roundedRect(72, startY, 451, endY - startY, 6).lineWidth(1).strokeColor(color + '55').stroke();
  doc.moveTo(72, startY).lineTo(72, endY).lineWidth(3).strokeColor(color).stroke();
  doc.y = endY + 8;
}

function techRow(name, version, description, color) {
  ensureSpace(30);
  const rowY = doc.y;
  doc.rect(72, rowY, 451, 24).fill(C.bg);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(color ?? C.primary)
     .text(name, 80, rowY + 7, { lineBreak: false, width: 130 });
  doc.fontSize(9).font('Helvetica').fillColor(C.light)
     .text(version, 218, rowY + 8, { lineBreak: false, width: 80 });
  doc.fontSize(9).font('Helvetica').fillColor(C.mid)
     .text(description, 300, rowY + 8, { lineBreak: false, width: 220 });
  doc.y = rowY + 28;
}

// ─── COVER PAGE ──────────────────────────────────────────────────────────────
doc.addPage();

// gradient-like header bar
doc.rect(0, 0, 595, 200).fill(C.primary);
doc.rect(0, 195, 595, 5).fill(C.secondary);

doc.fontSize(38).font('Helvetica-Bold').fillColor(C.white)
   .text('Prokoti', 72, 60, { align: 'center', width: 451 });
doc.fontSize(16).font('Helvetica').fillColor('#C7D2FE')
   .text('Collaborative PDF Viewer — Technical Overview', 72, 110, { align: 'center', width: 451 });
doc.fontSize(11).font('Helvetica').fillColor('#A5B4FC')
   .text('Architecture · Libraries · Design Decisions', 72, 138, { align: 'center', width: 451 });

// Date
doc.fontSize(9).font('Helvetica').fillColor(C.white)
   .text(new Date().toDateString(), 72, 172, { align: 'center', width: 451 });

// Abstract box
doc.roundedRect(72, 220, 451, 100, 8).fill(C.bg).stroke(C.border);
doc.fontSize(10).font('Helvetica').fillColor(C.mid)
   .text(
     'This document describes the complete technology stack behind Prokoti — a browser-based ' +
     'collaborative PDF viewer. It explains why each library was chosen over alternatives, how ' +
     'the PDF rendering pipeline works, and how the real-time annotation and e-signature systems ' +
     'are implemented end to end.',
     86, 234, { width: 423, lineGap: 3 }
   );

// Tech badge row
const badges = [
  ['Next.js 14', C.dark], ['NestJS', '#E0234E'], ['PostgreSQL', '#336791'],
  ['pdfjs-dist 4', '#FF6B35'], ['Socket.IO', '#010101'], ['AWS S3', '#FF9900'],
];
let bx = 72;
doc.y = 336;
badges.forEach(([label, color]) => {
  const w = doc.widthOfString(label, { fontSize: 9, font: 'Helvetica-Bold' }) + 16;
  doc.roundedRect(bx, 336, w, 18, 4).fill(color);
  doc.fontSize(9).font('Helvetica-Bold').fillColor(C.white).text(label, bx + 8, 340, { lineBreak: false });
  bx += w + 6;
});
doc.y = 370;

// ─── TABLE OF CONTENTS ───────────────────────────────────────────────────────
doc.fontSize(13).font('Helvetica-Bold').fillColor(C.dark).text('Contents', 72, 390);
doc.moveTo(72, doc.y + 2).lineTo(523, doc.y + 2).lineWidth(0.5).strokeColor(C.border).stroke();
doc.y += 10;

const toc = [
  ['1',  'Project Architecture',               '3'],
  ['2',  'Technology Stack',                   '3'],
  ['3',  'PDF Rendering Pipeline',             '5'],
  ['4',  'Text Layer & Text Selection',        '6'],
  ['5',  'Annotation System',                  '7'],
  ['6',  'Real-Time Sync (Socket.IO)',         '9'],
  ['7',  'E-Signature System',                 '10'],
  ['8',  'Authentication & Security',          '11'],
  ['9',  'Document Storage (AWS S3)',          '12'],
  ['10', 'Watermark Injection',                '12'],
  ['11', 'Document Conversion Pipeline',       '13'],
  ['12', 'Font Configuration & Rendering',     '14'],
];

toc.forEach(([num, title, pg]) => {
  const ty = doc.y;
  doc.fontSize(10).font('Helvetica').fillColor(C.mid)
     .text(`${num}.  ${title}`, 80, ty, { lineBreak: false });
  // dot leaders
  const textW = doc.widthOfString(`${num}.  ${title}`);
  let dx = 80 + textW + 4;
  while (dx < 490) { doc.circle(dx, ty + 6, 1).fill(C.border); dx += 5; }
  doc.fontSize(10).font('Helvetica-Bold').fillColor(C.primary).text(pg, 490, ty, { lineBreak: false });
  doc.y = ty + 16;
});

// ─── PAGE 3: Architecture + Tech Stack ───────────────────────────────────────
newPage();
h1('1. Project Architecture');

body(
  'Prokoti is a monorepo structured into three packages: a Next.js 14 frontend, a NestJS backend, ' +
  'and a shared TypeScript types package. The three apps communicate via a REST API and a Socket.IO ' +
  'WebSocket connection. Documents are stored on AWS S3; metadata and annotations live in PostgreSQL ' +
  'managed through Prisma ORM.'
);

infoBox('Monorepo Layout',
  '/apps/frontend   — Next.js 14 (App Router, TypeScript, Tailwind CSS)\n' +
  '/apps/backend    — NestJS + Prisma + Socket.IO gateway\n' +
  '/packages/types  — Shared DTOs (AnnotationDto, DocumentDto, …)\n' +
  'docker-compose.yml  PostgreSQL 15 container',
  C.primary
);

body(
  'The frontend is a pure SPA-style page inside the Next.js App Router. The PDF viewer renders ' +
  'entirely in the browser using pdfjs-dist; the backend never re-renders pages. Annotations are ' +
  'overlaid as absolute-positioned HTML elements on top of the canvas, keeping the PDF layer and ' +
  'the interaction layer cleanly separated.'
);

h1('2. Technology Stack');
h2('Frontend');

doc.y += 4;
techRow('Next.js 14',   'App Router',  'React framework — server components, file-based routing, middleware', C.dark);
techRow('TypeScript',   '5.x',         'Static typing shared via /packages/types', C.secondary);
techRow('Tailwind CSS', '3.x',         'Utility-first styling, zero runtime CSS-in-JS overhead', '#06B6D4');
techRow('pdfjs-dist',   '4.10.38',     'Mozilla PDF rendering engine — canvas + text layer', '#FF6B35');
techRow('signature_pad','4.x',         'Smooth freehand e-signature drawing on <canvas>', C.accent);
techRow('Socket.IO',    'client 4.x',  'Real-time annotation sync over WebSocket', '#010101');
doc.moveDown(0.6);

h2('Backend');
doc.y += 4;
techRow('NestJS',        '10.x',  'Modular Node.js framework — DI, Guards, Decorators', '#E0234E');
techRow('Prisma ORM',    '5.x',   'Type-safe database access with migration tooling', '#2D3748');
techRow('PostgreSQL',    '15',    'Primary data store for users, documents, annotations', '#336791');
techRow('Socket.IO',     'server 4.x','WebSocket gateway for broadcast events', '#010101');
techRow('AWS SDK v3',    '@aws-sdk','S3 client — PutObject / GetObject (backend-only)', '#FF9900');
techRow('pdf-lib',       '1.17',  'In-memory PDF manipulation for watermark injection', C.warn);
techRow('@nestjs/throttler','5.x','Rate-limiting on auth endpoints (5 req/min)', C.accent);
techRow('libreoffice-convert', '1.6', 'Converts PPTX / DOCX / DOC / TXT → PDF via LibreOffice CLI', C.accent);
techRow('multer',        '1.4-lts','Multipart file upload middleware for NestJS', C.mid);
techRow('xss',           '1.x',   'XSS sanitization for annotation content', '#EF4444');
techRow('bcrypt',        '5.x',   'Refresh-token hashing before DB storage', C.mid);
techRow('passport-jwt',  '4.x',   'JWT strategy — reads httpOnly cookie', C.secondary);
doc.moveDown(0.4);

h2('Runtime Fonts (Docker image)');
doc.y += 4;
techRow('font-noto-emoji',  'Alpine pkg', 'Google Noto Color Emoji — renders Unicode emoji in converted slides', C.warn);
techRow('Carlito (TTF)',    'Google Fonts','Metrically identical to Microsoft Calibri — preserves text layout', C.secondary);
techRow('font-dejavu',      'Alpine pkg', 'DejaVu family — fallback for Latin/Greek/Cyrillic', C.mid);
techRow('ttf-freefont',     'Alpine pkg', 'FreeSans/FreeSerif/FreeMono — Arial / TNR / Courier substitutes', C.mid);
doc.moveDown(0.6);

// ─── PAGE 5: PDF Rendering ────────────────────────────────────────────────────
newPage();
h1('3. PDF Rendering Pipeline');

body(
  'The PDF viewer uses pdfjs-dist 4.x, Mozilla\'s JavaScript port of the PDF rendering engine. ' +
  'Each page is rendered independently into an HTML5 <canvas> element; a transparent text layer ' +
  'is overlaid on top to enable text selection and search.'
);

h2('Why pdfjs-dist instead of react-pdf or react-pdf-viewer?');
bullet([
  'Full access to the low-level pdfjs API: viewport, text content, operator lists.',
  'react-pdf wraps pdfjs but hides the TextLayer API, making custom overlays awkward.',
  'react-pdf-viewer adds a large bundle and opinionated UI that conflicts with our custom toolbar.',
  'Direct use of pdfjs lets us co-locate canvas and text layer in one React component with precise control.',
]);

h2('Rendering Steps (per page)');

const steps = [
  ['1', 'Load document', 'pdfjs.getDocument(url) returns a PDFDocumentProxy. The worker runs in a separate thread via /pdf.worker.min.mjs served from the Next.js public/ folder.'],
  ['2', 'Build viewport', 'page.getViewport({ scale }) computes the pixel-space transform. scale = user zoom × devicePixelRatio for crisp rendering on HiDPI screens.'],
  ['3', 'Size canvas', 'canvas.width/height = viewport.width/height. CSS width/height = viewport.width/height / devicePixelRatio so the element fits the page without blur.'],
  ['4', 'Render to canvas', 'page.render({ canvasContext, viewport }).promise draws all PDF operators (text, images, paths) onto the canvas in the pdfjs worker thread.'],
  ['5', 'Build text layer', 'page.getTextContent() returns spans with bounding boxes in PDF coordinates. new pdfjs.TextLayer({ textContentSource, container, viewport }) maps them to CSS absolute positions.'],
  ['6', 'setLayerDimensions', 'pdfjs.setLayerDimensions(div, viewport) writes the CSS --scale-factor custom property. The pdfjs text layer stylesheet uses this variable to scale font sizes correctly.'],
  ['7', 'Font ready', 'await document.fonts.ready ensures PDF-embedded fonts have been parsed before the text layer renders, preventing invisible-text frames.'],
];

steps.forEach(([n, title, desc]) => {
  ensureSpace(50);
  const sy = doc.y;
  doc.circle(80, sy + 7, 9).fill(C.primary);
  doc.fontSize(9).font('Helvetica-Bold').fillColor(C.white).text(n, 76, sy + 3, { lineBreak: false });
  doc.fontSize(10).font('Helvetica-Bold').fillColor(C.dark).text(title, 98, sy, { lineBreak: false });
  doc.fontSize(9).font('Helvetica').fillColor(C.mid).text(desc, 98, doc.y + 2, { width: 420, lineGap: 3 });
  doc.y += 6;
});

infoBox('Worker file location',
  'The pdfjs worker (pdf.worker.min.mjs, ~1.4 MB) is copied into /apps/frontend/public/ so Next.js ' +
  'serves it as a static asset. This avoids CDN availability issues and works in offline/intranet environments.',
  C.warn
);

// ─── PAGE 6: Text Layer ───────────────────────────────────────────────────────
newPage();
h1('4. Text Layer & Text Selection');

body(
  'The text layer renders invisible but selectable <span> elements on top of the canvas. ' +
  'It is the bridge between the visual PDF and user interactions (selection, search, annotation).'
);

h2('pdfjs 4.x API change');
body(
  'In pdfjs-dist 3.x the API was renderTextLayer(params). This function was removed in v4.x. ' +
  'The replacement is the TextLayer class:'
);

infoBox('Old API (v3 — removed)',
  'import { renderTextLayer } from "pdfjs-dist";\nawaitPage renderTextLayer({ textContentSource, container, viewport }).promise;',
  '#EF4444'
);
infoBox('New API (v4+)',
  'const tl = new pdfjs.TextLayer({ textContentSource: textContent, container: div, viewport });\nawait tl.render();',
  C.accent
);

h2('Coordinate System');
body(
  'PDF coordinates have the origin at the bottom-left corner and y increases upward. The viewport ' +
  'transform flips this so the canvas origin is top-left with y increasing downward, matching the ' +
  'browser DOM. All annotation rects are stored in canvas-space (post-viewport) coordinates at scale=1, ' +
  'then multiplied by the current scale at render time.'
);

h2('Annotation Overlay Alignment');
bullet([
  'The canvas, text layer <div>, and annotation overlay <div> are siblings inside a position:relative wrapper.',
  'All three share the same pixel dimensions (viewport.width × viewport.height at scale=1).',
  'Annotation rects stored as {x, y, w, h} in PDF canvas units; rendered as left: x*scale, top: y*scale.',
  'This means the overlay stays perfectly aligned regardless of the user\'s zoom level.',
]);

// ─── PAGE 7: Annotations ──────────────────────────────────────────────────────
newPage();
h1('5. Annotation System');

body(
  'Prokoti supports five annotation types. All are stored in PostgreSQL and synced in real time ' +
  'to every connected client viewing the same document.'
);

h2('Annotation Types');

const types = [
  ['HIGHLIGHT',  C.warn,    'Coloured semi-transparent rectangle over selected text. Multiple rects per annotation for multi-line selections.'],
  ['UNDERLINE',  C.secondary,'Horizontal line under selected text (border-bottom, no fill). Uses the same rect array as HIGHLIGHT.'],
  ['NOTE',       C.accent,   'Single-point sticky note. Stores a rect with the anchor position plus free-text content.'],
  ['DISCUSSION', C.primary,  'Like NOTE but supports threaded replies (DiscussionReply table) and sharing with named members.'],
  ['SIGNATURE',  '#8B5CF6',  'Base-64 encoded PNG of the drawn signature. Stored as a single rect that tracks position and size; owner can drag/resize.'],
];

types.forEach(([name, color, desc]) => {
  ensureSpace(35);
  const ty = doc.y;
  doc.rect(72, ty, 4, 28).fill(color);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(color).text(name, 84, ty + 2, { lineBreak: false });
  doc.fontSize(9).font('Helvetica').fillColor(C.mid).text(desc, 84, ty + 14, { width: 430, lineGap: 3 });
  doc.y = ty + 32;
});

doc.moveDown(0.5);
h2('Data Flow: Creating a Highlight');

const flow = [
  'User drags on the text layer → mouseup fires in PDFViewer.',
  'window.getSelection() extracts the selected text and bounding rects.',
  'Rects are converted from viewport pixels back to scale=1 coordinates.',
  'onAnnotationCreate(dto) is called; the hook POSTs to POST /annotations.',
  'Backend validates, sanitizes content (xss.filterXSS), persists to PostgreSQL.',
  'Backend emits annotation:created to all sockets in the doc:{documentId} room.',
  'useAnnotations hook updates local state optimistically — no wait for the socket echo.',
  'AnnotationOverlay renders the new highlight div immediately.',
];
flow.forEach((step, i) => {
  ensureSpace(18);
  const fy = doc.y;
  doc.rect(72, fy, 18, 16).fill(C.primary + '22');
  doc.fontSize(8).font('Helvetica-Bold').fillColor(C.primary).text(String(i + 1), 78, fy + 4, { lineBreak: false });
  doc.fontSize(9).font('Helvetica').fillColor(C.mid).text(step, 96, fy + 3, { width: 420, lineGap: 2 });
  doc.y = fy + 20;
});

doc.moveDown(0.5);
h2('Visibility & Privacy');
bullet([
  'isPrivate: true — only the creator sees the annotation (filtered client-side and server-side).',
  'isPrivate: false — all document viewers can see it.',
  'share(annotationId, memberIds) adds rows to DiscussionMember and sets isPrivate: false.',
  'The /annotations/document/:id endpoint applies an OR filter: own annotations ∪ shared annotations.',
]);

h2('Rect Storage');
infoBox('PostgreSQL schema',
  'rects  Json   -- stored as [{ x: number, y: number, w: number, h: number }, ...]\n' +
  '               -- coordinates are in PDF canvas units at scale=1\n' +
  '               -- multiple rects per annotation for multi-line text selections',
  C.primary
);

// ─── PAGE 9: Socket.IO ────────────────────────────────────────────────────────
newPage();
h1('6. Real-Time Sync (Socket.IO)');

body(
  'Every annotation mutation is broadcast to all other clients viewing the same document. ' +
  'Socket.IO was chosen over polling and raw WebSockets because it provides rooms, automatic ' +
  'reconnection, and a familiar event API.'
);

h2('Why Socket.IO instead of polling or raw WebSocket?');
bullet([
  'Rooms: socket.join("doc:xyz") lets the gateway broadcast only to viewers of that document.',
  'Automatic reconnect with exponential back-off — no user-visible interruption on network blip.',
  'Falls back to HTTP long-poll in environments that block WebSocket upgrades.',
  'NestJS has first-class @WebSocketGateway support with full dependency injection.',
  'Polling adds latency and server load proportional to the number of active sessions.',
]);

h2('Gateway Architecture');

body(
  'The NestJS gateway (AnnotationsGateway) handles authentication by reading the access_token ' +
  'httpOnly cookie from the socket handshake headers. On connection it joins the client to the ' +
  'room matching the documentId provided in the join-document event.'
);

infoBox('Event Reference',
  'join-document    { documentId }  →  client joins room doc:{documentId}\n' +
  'leave-document   { documentId }  →  client leaves room\n' +
  'annotation:created   { annotation }  →  new annotation persisted\n' +
  'annotation:updated   { annotation }  →  content / rects changed\n' +
  'annotation:deleted   { annotationId }  →  annotation removed\n' +
  'reply:created    { reply, annotationId }  →  new reply in discussion',
  C.secondary
);

h2('Optimistic Updates');
body(
  'The frontend does not wait for the socket echo to update its own UI. After a successful API ' +
  'call the useAnnotations hook applies the change to local state immediately. If the socket event ' +
  'arrives later (e.g., from another tab), the deduplication check (prev.some(a => a.id === id)) ' +
  'prevents duplicates.'
);

h2('CORS Configuration');
body(
  'Both the HTTP server (main.ts) and the @WebSocketGateway decorator use a function-based ' +
  'CORS origin check that allows any localhost:* origin. This is necessary because Next.js ' +
  'dev server can bind to a different port than the default (3000 vs 3002 etc.).'
);

// ─── PAGE 10: Signatures ─────────────────────────────────────────────────────
newPage();
h1('7. E-Signature System');

body(
  'The signature feature lets users draw a freehand signature on a canvas and place it anywhere ' +
  'on any page of the document. The full pipeline spans the SignaturePickerModal, the ' +
  'AnnotationOverlay, and the standard annotation REST/WebSocket path.'
);

h2('Why signature_pad?');
bullet([
  'Pressure-sensitive B-spline smoothing produces natural-looking strokes.',
  'Exports directly to PNG data URL — no server round-trip for the initial capture.',
  'Lightweight (~5 KB gzipped) — no canvas library dependency like fabric.js.',
  'Active maintenance (GitHub: szimek/signature_pad).',
  'fabric.js was evaluated but is 10× larger and adds abstraction not needed for a single-use signature canvas.',
]);

h2('Two-Step Placement Flow');

const sigSteps = [
  ['Draw', C.primary,    'SignaturePickerModal renders a <canvas> element wired to a signature_pad instance. User draws; the pad captures pointer events and renders smooth bezier curves.'],
  ['Export', C.secondary,'On "Use Signature" the pad calls toDataURL("image/png") to produce a base-64 encoded PNG string (~5–30 KB).'],
  ['Pending', C.warn,    'The data URL is stored as pendingSignature state in the viewer page. The cursor changes to crosshair and the toolbar shows "Cancel placement".'],
  ['Place',  C.accent,   'User clicks anywhere on the PDF canvas. The click handler captures the (x, y) position in scale=1 coordinates and emits onAnnotationCreate with type=SIGNATURE, rects=[{x,y,w:120,h:60}], content=dataUrl.'],
  ['Persist', '#8B5CF6', 'Backend stores the annotation like any other. The content column holds the full data URL (up to ~500 KB for a detailed signature).'],
  ['Overlay', '#E0234E', 'AnnotationOverlay renders a <img src={annotation.content}> inside a ResizableSignature component. The owner can drag the image or drag corner handles to resize.'],
];

sigSteps.forEach(([step, color, desc]) => {
  ensureSpace(42);
  const sy = doc.y;
  doc.roundedRect(72, sy, 60, 32, 4).fill(color + '22').stroke(color + '55');
  doc.fontSize(10).font('Helvetica-Bold').fillColor(color).text(step, 72, sy + 10, { width: 60, align: 'center' });
  doc.fontSize(9).font('Helvetica').fillColor(C.mid).text(desc, 142, sy + 6, { width: 370, lineGap: 3 });
  doc.y = sy + 38;
});

doc.moveDown(0.4);
h2('Drag & Resize');
body(
  'The ResizableSignature component in AnnotationOverlay.tsx implements its own drag system using ' +
  'window-level mousemove/mouseup listeners (attached on mousedown, removed on mouseup). ' +
  'Corner handles allow proportional resizing. On mouseup, the updated rect is sent to ' +
  'PATCH /annotations/:id, persisted, and broadcast to other viewers via annotation:updated.'
);

// ─── PAGE 11: Auth ────────────────────────────────────────────────────────────
newPage();
h1('8. Authentication & Security');

h2('JWT Dual-Token Strategy');
body(
  'Prokoti uses two JWTs: a short-lived access token and a long-lived refresh token. ' +
  'Both are stored in httpOnly; SameSite=Strict cookies — they are never accessible to JavaScript, ' +
  'mitigating XSS-based token theft.'
);

infoBox('Token Lifetimes',
  'Access token:   15 minutes — extracted from req.cookies.access_token by passport-jwt\n' +
  'Refresh token:  7 days — bcrypt hash stored in DB; raw value in cookie only\n' +
  'Rotation:       Each use of the refresh token issues a new pair (token rotation)',
  C.primary
);

h2('Security Measures');
bullet([
  'Rate limiting: @nestjs/throttler limits /auth/login and /auth/register to 5 requests/min/IP.',
  'XSS sanitization: all user-supplied text (annotation content, selectedText, replies) passes through xss.filterXSS() before DB writes.',
  'Refresh token hashing: the raw refresh token is never stored; bcrypt.compare() validates it on each refresh.',
  'CORS: function-based origin check; credentials: true; only localhost origins allowed in development.',
  'S3 credentials: backend-only, never exposed to the frontend. The frontend calls the backend API which proxies S3 responses.',
  'Magic byte validation: document uploads check the first bytes of the file, not just the MIME type.',
]);

h2('Auth Flow Summary');
const authFlow = [
  'POST /auth/register — hash password with bcrypt, create User, issue access + refresh tokens as cookies.',
  'POST /auth/login — validate credentials, issue fresh token pair.',
  'Every protected route — JwtAuthGuard reads access_token cookie, verifies signature, attaches user to req.',
  'POST /auth/refresh — JwtRefreshGuard reads refresh_token cookie, looks up DB hash, issues new pair.',
  'POST /auth/logout — clears both cookies and nullifies the stored refresh hash.',
];
authFlow.forEach((step, i) => {
  ensureSpace(20);
  const fy = doc.y;
  doc.fontSize(9).font('Helvetica-Bold').fillColor(C.primary).text(`${i+1}.`, 72, fy, { lineBreak: false, width: 18 });
  doc.fontSize(9).font('Helvetica').fillColor(C.mid).text(step, 90, fy, { width: 430, lineGap: 3 });
  doc.y = fy + 20;
});

// ─── PAGE 12: S3 + Watermark ──────────────────────────────────────────────────
newPage();
h1('9. Document Storage (AWS S3)');

body(
  'Documents are stored as objects in an S3 bucket. The backend uses @aws-sdk/client-s3 v3. ' +
  'S3 credentials are kept in the backend .env file and are never sent to the browser.'
);

h2('Upload Flow');
bullet([
  'Frontend POSTs the file to POST /documents as multipart/form-data.',
  'Backend validates magic bytes (PDF: %PDF header, DOCX/PPTX: PK zip header).',
  'Non-PDF files are converted to PDF via libreoffice-convert before upload.',
  'Backend calls PutObjectCommand with the PDF buffer; stores the S3 key in PostgreSQL.',
  'The frontend receives the DocumentDto (no S3 URL, no credentials).',
]);

h2('Download / Print Flow');
bullet([
  'Frontend requests GET /documents/:id/download (or /print) from the backend.',
  'Backend calls GetObjectCommand to stream the original PDF from S3.',
  'pdf-lib injects a per-user watermark in memory (not written back to S3).',
  'Backend streams the watermarked PDF buffer to the client with the correct Content-Disposition header.',
]);

h1('10. Watermark Injection');

body(
  'When a user downloads or prints a document, the backend injects their name as a diagonal ' +
  'watermark on every page. The original file in S3 is never modified.'
);

infoBox('pdf-lib watermark implementation',
  '1. Fetch S3 object → Buffer\n' +
  '2. PDFDocument.load(buffer)\n' +
  '3. For each page:\n' +
  '     page.drawText(username, { x: w/2, y: h/2, size: 48, opacity: 0.3,\n' +
  '                                rotate: degrees(35), color: rgb(0.5,0.5,0.5) })\n' +
  '4. doc.save() → new Buffer (never touches S3)\n' +
  '5. Stream to HTTP response',
  C.warn
);

h2('Why pdf-lib instead of pdfkit or Ghostscript?');
bullet([
  'pdf-lib can load an existing PDF and modify it; pdfkit only creates new PDFs from scratch.',
  'No native binary dependency (unlike Ghostscript or Puppeteer) — runs in a standard Node.js process.',
  'Pure JavaScript — works on Windows, Linux, and macOS without additional system packages.',
  'In-memory operation — watermark is injected in the request handler with no temp files.',
]);

// ─── PAGE 13: Document Conversion Pipeline ───────────────────────────────────
newPage();
h1('11. Document Conversion Pipeline');

body(
  'Prokoti accepts PDF, PPTX, DOCX, DOC, and TXT files. All non-PDF formats are converted to PDF ' +
  'on the backend before being stored in S3. This means the viewer always works with a single ' +
  'canonical format and never needs format-specific rendering code in the browser.'
);

h2('Supported Input Formats');

const formats = [
  ['PDF',  'application/pdf',          '%PDF (0x25 0x50 0x44 0x46)',   'Stored as-is — no conversion needed'],
  ['PPTX', 'application/vnd...presentationml', 'ZIP (0x50 0x4B 0x03 0x04)', 'Converted → PDF via LibreOffice'],
  ['DOCX', 'application/vnd...wordprocessingml','ZIP (0x50 0x4B 0x03 0x04)', 'Converted → PDF via LibreOffice'],
  ['DOC',  'application/msword',       'OLE2 (0xD0 0xCF 0x11 0xE0)',   'Converted → PDF via LibreOffice'],
  ['TXT',  'text/plain',               'None (any bytes accepted)',     'Converted → PDF via LibreOffice'],
];

formats.forEach(([ext, mime, magic, action]) => {
  ensureSpace(26);
  const ry = doc.y;
  doc.rect(72, ry, 451, 22).fill(C.bg);
  doc.fontSize(10).font('Helvetica-Bold').fillColor(C.primary).text(ext,   80, ry + 6, { lineBreak: false, width: 40 });
  doc.fontSize(8).font('Helvetica').fillColor(C.light).text(magic,        126, ry + 7, { lineBreak: false, width: 160 });
  doc.fontSize(9).font('Helvetica').fillColor(C.mid).text(action,         292, ry + 7, { lineBreak: false, width: 224 });
  doc.y = ry + 26;
});

doc.moveDown(0.5);
h2('Why libreoffice-convert?');
bullet([
  'LibreOffice has the most faithful PPTX/DOCX rendering of any open-source converter — it shares code with the desktop app.',
  'The npm package libreoffice-convert wraps the LibreOffice headless CLI (soffice --convert-to pdf).',
  'It accepts a Buffer in and returns a Buffer out — no temp files needed; fits naturally into the NestJS upload handler.',
  'Alternatives evaluated: Pandoc (poor slide fidelity), Puppeteer+html (requires a headless browser, ~300 MB extra), CloudConvert (external SaaS, adds latency and cost).',
  'LibreOffice is pre-installed in the Docker runner image via: apk add --no-cache libreoffice',
]);

h2('Two-Layer Validation: MIME Type + Magic Bytes');
body(
  'Accepting only the MIME type declared by the browser is insufficient — any file can be renamed. ' +
  'The backend performs a second check by reading the first 4 bytes of the uploaded buffer and ' +
  'comparing them against known file signatures.'
);

infoBox('Magic Byte Checks',
  'PDF   : 25 50 44 46  (%PDF)\n' +
  'PPTX/DOCX: 50 4B 03 04  (ZIP — both Office Open XML formats are ZIP archives)\n' +
  'DOC   : D0 CF 11 E0  (OLE2 compound document — legacy Word format)\n' +
  'TXT   : no check — plaintext has no fixed header; any byte sequence is accepted',
  C.accent
);

h2('Conversion Code Path');

const convSteps = [
  'POST /documents/upload receives a multipart file via Multer (memory storage).',
  'MaxFileSizeValidator rejects files over 50 MB.',
  'ALLOWED_MIMETYPES check — rejects unknown types with 400 Bad Request.',
  'validateFileMagicBytes() — checks buffer[0..3] against the expected signature.',
  'If mimetype !== application/pdf: libreConvert.convertAsync(buffer, ".pdf") is awaited.',
  'The resulting PDF Buffer is uploaded to S3 via PutObjectCommand.',
  'A Document row is created in PostgreSQL with the .pdf extension and application/pdf MIME type.',
];
convSteps.forEach((step, i) => {
  ensureSpace(20);
  const sy = doc.y;
  doc.rect(72, sy, 18, 16).fill(C.primary + '22');
  doc.fontSize(8).font('Helvetica-Bold').fillColor(C.primary).text(String(i + 1), 78, sy + 4, { lineBreak: false });
  doc.fontSize(9).font('Helvetica').fillColor(C.mid).text(step, 96, sy + 3, { width: 420, lineGap: 2 });
  doc.y = sy + 22;
});

// ─── PAGE 14: Font Configuration ─────────────────────────────────────────────
newPage();
h1('12. Font Configuration & Rendering Quality');

body(
  'LibreOffice running headless on Alpine Linux has no fonts by default. Without fonts, every ' +
  'glyph — including emoji icons commonly used in presentations — renders as a hollow box (tofu). ' +
  'Four problems needed solving: emoji rendering, Calibri metric compatibility, common Microsoft ' +
  'font substitution, and fontconfig wiring.'
);

h2('Problem 1 — Emoji / Icon Rendering');
body(
  'Modern PPTX slide decks use Unicode emoji (🎤 📅 ⏰) inside coloured circles as visual icons. ' +
  'On a vanilla Alpine image these codepoints have no glyph and render as empty squares.'
);
infoBox('Fix: font-noto-emoji',
  'apk add font-noto-emoji\n\n' +
  'Installs NotoColorEmoji.ttf — Google\'s full-colour emoji font that covers all emoji in Unicode 15.\n' +
  'LibreOffice picks it up automatically through fontconfig when it encounters an emoji codepoint.',
  C.warn
);

h2('Problem 2 — Calibri Metric Compatibility');
body(
  'The default font in Microsoft Office 2007+ is Calibri. When Calibri is unavailable, LibreOffice ' +
  'substitutes a different font with different character widths. This causes text to reflow — words ' +
  'wrap at different points, font sizes appear different, and column layouts break.'
);
infoBox('Fix: Carlito (metric-compatible Calibri substitute)',
  'Carlito is a Google Fonts typeface designed to be metrically identical to Calibri — every ' +
  'character has the same advance width. Text laid out in Calibri in PowerPoint will wrap at ' +
  'exactly the same points when rendered in Carlito by LibreOffice.\n\n' +
  'Installed during Docker image build:\n' +
  '  wget Carlito-{Regular,Bold,Italic,BoldItalic}.ttf → /usr/share/fonts/carlito/\n' +
  '  fc-cache -f /usr/share/fonts   (rebuilds fontconfig cache)',
  C.secondary
);

h2('Problem 3 — Microsoft Font Substitutions');
body(
  'Even after installing Carlito, other common Microsoft fonts (Arial, Times New Roman, Courier New, ' +
  'Segoe UI) may be absent. LibreOffice\'s random fallback can pick fonts with very different metrics. ' +
  'A fontconfig alias file pins each name to its closest free equivalent.'
);

const aliases = [
  ['Calibri / Calibri Light', '→', 'Carlito',   'Metrically identical'],
  ['Arial / Helvetica',       '→', 'FreeSans',   'Visually close; similar metrics'],
  ['Times New Roman',         '→', 'FreeSerif',  'Serif family match'],
  ['Courier New',             '→', 'FreeMono',   'Monospace family match'],
  ['Segoe UI / Segoe UI Light/Semibold', '→', 'FreeSans', 'Microsoft UI font'],
];

aliases.forEach(([from, arrow, to, note]) => {
  ensureSpace(22);
  const ry = doc.y;
  doc.rect(72, ry, 451, 20).fill(C.bg);
  doc.fontSize(9).font('Helvetica-Bold').fillColor(C.dark).text(from,  80, ry + 5, { lineBreak: false, width: 180 });
  doc.fontSize(9).font('Helvetica-Bold').fillColor(C.primary).text(arrow, 265, ry + 5, { lineBreak: false, width: 16 });
  doc.fontSize(9).font('Helvetica-Bold').fillColor(C.accent).text(to,  286, ry + 5, { lineBreak: false, width: 100 });
  doc.fontSize(8).font('Helvetica').fillColor(C.light).text(note,      390, ry + 6, { lineBreak: false, width: 130 });
  doc.y = ry + 24;
});

doc.moveDown(0.5);
infoBox('fontconfig alias file: /etc/fonts/conf.d/99-ms-font-aliases.conf',
  '<?xml version="1.0"?>\n' +
  '<!DOCTYPE fontconfig SYSTEM "fonts.dtd">\n' +
  '<fontconfig>\n' +
  '  <alias><family>Calibri</family><prefer><family>Carlito</family></prefer></alias>\n' +
  '  <alias><family>Arial</family><prefer><family>FreeSans</family></prefer></alias>\n' +
  '  <alias><family>Times New Roman</family><prefer><family>FreeSerif</family></prefer></alias>\n' +
  '  ... (Courier New, Segoe UI variants)\n' +
  '</fontconfig>',
  C.primary
);

h2('Problem 4 — OpenSSL / Prisma Engine Mismatch');
body(
  'Alpine Linux 3.17+ ships OpenSSL 3 (libssl.so.3). The Prisma query engine binary generated ' +
  'without an explicit binaryTargets defaults to "openssl-1.1.x" and fails to start in the container ' +
  'with: Error loading shared library libssl.so.1.1.'
);
infoBox('Fix: binaryTargets in schema.prisma + openssl apk package',
  '// prisma/schema.prisma\n' +
  'generator client {\n' +
  '  provider      = "prisma-client-js"\n' +
  '  binaryTargets = ["native", "linux-musl-openssl-3.0.x"]\n' +
  '}\n\n' +
  '// Dockerfile runner stage\n' +
  'RUN apk add --no-cache libreoffice openssl ...\n\n' +
  '"native" covers local Windows/macOS development; "linux-musl-openssl-3.0.x" targets Alpine with OpenSSL 3.',
  '#EF4444'
);

// ─── Final: closing note ──────────────────────────────────────────────────────
ensureSpace(120);
doc.moveDown(1);
doc.roundedRect(72, doc.y, 451, 70, 8)
   .fill(C.primary + '11').stroke(C.primary + '44');
doc.fontSize(11).font('Helvetica-Bold').fillColor(C.primary)
   .text('Prokoti — Built with open-source tooling', 84, doc.y + 14, { width: 427, align: 'center' });
doc.fontSize(9).font('Helvetica').fillColor(C.mid)
   .text(
     'Next.js · NestJS · Prisma · PostgreSQL · pdfjs-dist · Socket.IO · AWS S3 · pdf-lib · signature_pad',
     84, doc.y + 4, { width: 427, align: 'center' }
   );

doc.end();
doc.on('end', () => console.log('PDF written to:', OUT));
