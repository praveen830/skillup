import { createRequire } from 'module';
const nodeRequire = createRequire(import.meta.url);

export async function extractTextFromPdfBuffer(buffer: Buffer): Promise<string> {
  try {
    const pdfModule = nodeRequire('pdf-parse');
    const { PDFParse } = pdfModule;
    if (PDFParse) {
      const parser = new PDFParse({ data: buffer });
      await parser.load();
      const textResult = await parser.getText();
      const text = typeof textResult === 'string' ? textResult : (textResult?.text || '');
      if (text && text.trim().length > 10) {
        return text.trim();
      }
    }
  } catch (err) {
    console.warn('Primary PDFParse attempt failed, trying fallback:', err);
  }

  // Fallback: extract plain ASCII text streams from PDF buffer directly
  try {
    const raw = buffer.toString('latin1');
    const matches = raw.match(/\(([^()]{3,})\)/g) || [];
    const textPieces = matches
      .map(m => m.slice(1, -1))
      .filter(t => !t.startsWith('/') && t.trim().length > 2);
    if (textPieces.length > 5) {
      return textPieces.join(' ');
    }
  } catch (err2) {
    console.error('PDF text stream fallback error:', err2);
  }

  return '';
}
