import { Injectable } from '@nestjs/common';
import { PDFDocument, rgb, degrees, StandardFonts } from 'pdf-lib';

@Injectable()
export class WatermarkService {
  async inject(pdfBytes: Buffer, username: string): Promise<Uint8Array> {
    const doc = await PDFDocument.load(pdfBytes);
    const font = await doc.embedFont(StandardFonts.HelveticaBold);
    const pages = doc.getPages();

    for (const page of pages) {
      const { width, height } = page.getSize();
      const text = username;
      const fontSize = 42;

      // Draw diagonal watermark twice (top-left quadrant + bottom-right quadrant)
      for (const [x, y] of [
        [width * 0.15, height * 0.55],
        [width * 0.5, height * 0.2],
      ]) {
        page.drawText(text, {
          x,
          y,
          size: fontSize,
          font,
          color: rgb(0.75, 0.75, 0.75),
          opacity: 0.3,
          rotate: degrees(35),
        });
      }
    }

    return doc.save();
  }
}
