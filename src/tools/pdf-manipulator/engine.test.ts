import { describe, it, expect } from 'vitest';
import { executePdfManipulator, parsePageRange } from './engine';

function createMockPdf(numPages: number = 2): ArrayBuffer {
  let str = `%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n`;
  const kids: string[] = [];

  for (let i = 0; i < numPages; i++) {
    const pageId = 3 + i;
    kids.push(`${pageId} 0 R`);
  }

  str += `2 0 obj\n<< /Type /Pages /Kids [${kids.join(' ')}] /Count ${numPages} >>\nendobj\n`;

  for (let i = 0; i < numPages; i++) {
    const pageId = 3 + i;
    str += `${pageId} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] >>\nendobj\n`;
  }

  str += `xref\n0 ${3 + numPages}\ntrailer\n<< /Size ${3 + numPages} /Root 1 0 R >>\nstartxref\n500\n%%EOF\n`;
  return new TextEncoder().encode(str).buffer;
}

describe('PDF Manipulator Engine', () => {
  it('correctly parses page range strings', () => {
    expect(parsePageRange('1-3, 5', 10)).toEqual([1, 2, 3, 5]);
    expect(parsePageRange('2, 4', 5)).toEqual([2, 4]);
    expect(parsePageRange('1-2, ', 5)).toEqual([1, 2]);
    expect(parsePageRange('', 3)).toEqual([1, 2, 3]);
  });

  it('merges two 2-page PDFs into a 4-page PDF document', () => {
    const pdf1 = createMockPdf(2);
    const pdf2 = createMockPdf(2);

    const result = executePdfManipulator({
      operation: 'merge',
      files: [
        { name: 'doc1.pdf', buffer: pdf1 },
        { name: 'doc2.pdf', buffer: pdf2 },
      ],
    });

    expect(result.isValid).toBe(true);
    expect(result.totalPages).toBe(4);
    expect(result.originalPageCount).toBe(4);
    expect(result.outputBuffer).toBeDefined();

    const outputText = new TextDecoder().decode(result.outputBuffer!);
    expect(outputText).toContain('%PDF-1.4');
    expect(outputText).toContain('/Count 4');
    expect(outputText).toContain('%%EOF');
  });

  it('extracts specific page from a multi-page PDF', () => {
    const pdf = createMockPdf(3);

    const result = executePdfManipulator({
      operation: 'extract',
      files: [{ name: 'sample.pdf', buffer: pdf }],
      pageRange: '2',
    });

    expect(result.isValid).toBe(true);
    expect(result.totalPages).toBe(1);
    expect(result.originalPageCount).toBe(3);

    const outputText = new TextDecoder().decode(result.outputBuffer!);
    expect(outputText).toContain('/Count 1');
  });

  it('handles empty input gracefully', () => {
    const result = executePdfManipulator({ operation: 'merge', files: [] });
    expect(result.isValid).toBe(true);
    expect(result.totalPages).toBe(0);
  });
});
