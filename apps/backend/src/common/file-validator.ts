// Validate file magic bytes to prevent extension spoofing
export function validateFileMagicBytes(buffer: Buffer, mimetype: string): boolean {
  const ZIP_SIG = [0x50, 0x4b, 0x03, 0x04]; // DOCX/PPTX are ZIP archives
  const OLE2_SIG = [0xd0, 0xcf, 0x11, 0xe0]; // Legacy .doc/.xls OLE2 compound doc

  const signatures: Record<string, number[][]> = {
    'application/pdf': [[0x25, 0x50, 0x44, 0x46]], // %PDF
    'text/plain': [],
    'application/vnd.openxmlformats-officedocument.presentationml.presentation': [ZIP_SIG],
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [ZIP_SIG],
    'application/msword': [OLE2_SIG],
  };

  const allowed = signatures[mimetype];
  if (!allowed) return false;
  if (allowed.length === 0) return true;

  return allowed.some((sig) => sig.every((byte, i) => buffer[i] === byte));
}

export const ALLOWED_MIMETYPES = [
  'application/pdf',
  'text/plain',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
];
