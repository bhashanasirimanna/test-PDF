// Validate file magic bytes to prevent extension spoofing
export function validateFileMagicBytes(buffer: Buffer, mimetype: string): boolean {
  const signatures: Record<string, number[][]> = {
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
    'text/plain': [], // no magic bytes, accept any
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': [
      [0x50, 0x4b, 0x03, 0x04], // ZIP (PPTX is a ZIP)
    ],
  };

  const allowed = signatures[mimetype];
  if (!allowed) return false;
  if (allowed.length === 0) return true; // no magic bytes check needed

  return allowed.some((sig) => sig.every((byte, i) => buffer[i] === byte));
}

export const ALLOWED_MIMETYPES = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
];
