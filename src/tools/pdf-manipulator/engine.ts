import type {
  PdfManipulatorInput,
  PdfManipulatorOutput,
} from './definition';

export function parsePageRange(rangeStr: string, maxPages: number): number[] {
  if (!rangeStr.trim()) {
    return Array.from({ length: maxPages }, (_, i) => i + 1);
  }

  const pages = new Set<number>();
  const parts = rangeStr.split(',');

  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) continue;
    if (trimmed.includes('-')) {
      const [sStr, eStr] = trimmed.split('-');
      const start = parseInt(sStr, 10);
      const end = parseInt(eStr, 10);
      if (isNaN(start) || isNaN(end) || start > end) {
        throw new Error(`Invalid page range: "${trimmed}"`);
      }
      for (let p = start; p <= end; p++) {
        if (p >= 1 && p <= maxPages) pages.add(p);
      }
    } else {
      const num = parseInt(trimmed, 10);
      if (isNaN(num)) {
        throw new Error(`Invalid page number: "${trimmed}"`);
      }
      if (num >= 1 && num <= maxPages) {
        pages.add(num);
      }
    }
  }

  return Array.from(pages).sort((a, b) => a - b);
}

interface RawPdfObject {
  id: number;
  gen: number;
  content: string;
}

function extractPdfObjects(pdfText: string): RawPdfObject[] {
  const objects: RawPdfObject[] = [];
  const regex = /(\d+)\s+(\d+)\s+obj\s*([\s\S]*?)\s*endobj/g;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(pdfText)) !== null) {
    objects.push({
      id: parseInt(match[1], 10),
      gen: parseInt(match[2], 10),
      content: match[3],
    });
  }

  return objects;
}

function findPageObjectIds(objects: RawPdfObject[]): number[] {
  const pageIds: number[] = [];
  for (const obj of objects) {
    if (/\/Type\s*\/Page\b/.test(obj.content) && !/\/Type\s*\/Pages\b/.test(obj.content)) {
      pageIds.push(obj.id);
    }
  }
  return pageIds;
}

export function buildPdfFromObjects(
  objects: RawPdfObject[],
  pageObjectIds: number[]
): ArrayBuffer {
  // We will renumber objects sequentially:
  // Object 1: Catalog root
  // Object 2: Pages tree
  // Objects 3..N: Page objects and supporting streams
  const idMap = new Map<number, number>();
  let nextId = 3;

  pageObjectIds.forEach((oldId) => {
    if (!idMap.has(oldId)) {
      idMap.set(oldId, nextId++);
    }
  });

  objects.forEach((obj) => {
    if (!idMap.has(obj.id)) {
      idMap.set(obj.id, nextId++);
    }
  });

  const renumberRef = (text: string): string => {
    return text.replace(/(\d+)\s+(\d+)\s+R/g, (match, oldIdStr, genStr) => {
      const oldId = parseInt(oldIdStr, 10);
      const mapped = idMap.get(oldId);
      return mapped ? `${mapped} ${genStr} R` : match;
    });
  };

  const renumberedObjects: Array<{ id: number; body: string }> = [];

  // 1. Root Catalog
  renumberedObjects.push({
    id: 1,
    body: '<< /Type /Catalog /Pages 2 0 R >>',
  });

  // 2. Pages tree
  const kidsStr = pageObjectIds.map((id) => `${idMap.get(id)} 0 R`).join(' ');
  renumberedObjects.push({
    id: 2,
    body: `<< /Type /Pages /Kids [${kidsStr}] /Count ${pageObjectIds.length} >>`,
  });

  // 3. Page and supporting objects
  for (const obj of objects) {
    const newId = idMap.get(obj.id);
    if (!newId) continue;

    let content = obj.content;
    // Replace Parent reference in /Page objects with 2 0 R
    if (/\/Type\s*\/Page\b/.test(content)) {
      content = content.replace(/\/Parent\s+\d+\s+\d+\s+R/g, '/Parent 2 0 R');
    }
    content = renumberRef(content);

    renumberedObjects.push({
      id: newId,
      body: content,
    });
  }

  // Sort objects by new ID
  renumberedObjects.sort((a, b) => a.id - b.id);

  // Assemble PDF binary stream
  let pdfString = '%PDF-1.4\n';
  const xrefOffsets: number[] = [0]; // Offset 0 is dummy

  for (const obj of renumberedObjects) {
    const offset = new TextEncoder().encode(pdfString).length;
    xrefOffsets.push(offset);
    pdfString += `${obj.id} 0 obj\n${obj.body}\nendobj\n`;
  }

  const startXref = new TextEncoder().encode(pdfString).length;
  pdfString += `xref\n0 ${renumberedObjects.length + 1}\n`;
  pdfString += '0000000000 65535 f \n';

  for (let i = 1; i <= renumberedObjects.length; i++) {
    const off = xrefOffsets[i].toString().padStart(10, '0');
    pdfString += `${off} 00000 n \n`;
  }

  pdfString += `trailer\n<< /Size ${renumberedObjects.length + 1} /Root 1 0 R >>\nstartxref\n${startXref}\n%%EOF\n`;

  return new TextEncoder().encode(pdfString).buffer;
}

export function executePdfManipulator(
  input: PdfManipulatorInput
): PdfManipulatorOutput {
  const operation = input.operation || 'merge';
  const files = input.files || [];

  if (files.length === 0) {
    return {
      isValid: true,
      totalPages: 0,
      originalPageCount: 0,
      byteSize: 0,
    };
  }

  try {
    if (operation === 'merge') {
      const allObjects: RawPdfObject[] = [];
      const allPageIds: number[] = [];
      let totalOrigPages = 0;

      // Decode and merge objects from each PDF
      let globalObjOffset = 100;

      for (let fIdx = 0; fIdx < files.length; fIdx++) {
        const file = files[fIdx];
        const text = new TextDecoder('latin1').decode(file.buffer);

        if (!text.includes('%PDF-')) {
          throw new Error(`File "${file.name}" is not a valid PDF document.`);
        }

        const rawObjs = extractPdfObjects(text);
        const pageIds = findPageObjectIds(rawObjs);
        totalOrigPages += pageIds.length;

        // Shift object IDs to avoid collisions between multiple documents
        const fileIdMap = new Map<number, number>();
        rawObjs.forEach((o) => {
          fileIdMap.set(o.id, globalObjOffset++);
        });

        for (const o of rawObjs) {
          const shiftedId = fileIdMap.get(o.id)!;
          const renumberedContent = o.content.replace(
            /(\d+)\s+(\d+)\s+R/g,
            (_, idStr, genStr) => {
              const oldId = parseInt(idStr, 10);
              const mapped = fileIdMap.get(oldId);
              return mapped ? `${mapped} ${genStr} R` : `${idStr} ${genStr} R`;
            }
          );
          allObjects.push({
            id: shiftedId,
            gen: 0,
            content: renumberedContent,
          });
        }

        pageIds.forEach((pId) => {
          allPageIds.push(fileIdMap.get(pId)!);
        });
      }

      const outputBuffer = buildPdfFromObjects(allObjects, allPageIds);

      return {
        isValid: true,
        outputBuffer,
        totalPages: allPageIds.length,
        originalPageCount: totalOrigPages,
        byteSize: outputBuffer.byteLength,
      };
    }

    if (operation === 'extract' || operation === 'reorder') {
      const file = files[0];
      const text = new TextDecoder('latin1').decode(file.buffer);

      if (!text.includes('%PDF-')) {
        throw new Error(`File "${file.name}" is not a valid PDF document.`);
      }

      const rawObjs = extractPdfObjects(text);
      const pageIds = findPageObjectIds(rawObjs);
      const originalPageCount = pageIds.length;

      let targetIndices: number[] = [];

      if (operation === 'extract') {
        const selected1Based = parsePageRange(input.pageRange || '', originalPageCount);
        targetIndices = selected1Based.map((p) => p - 1);
      } else {
        // reorder
        const order = input.pageOrder || Array.from({ length: originalPageCount }, (_, i) => i + 1);
        targetIndices = order.map((p) => p - 1).filter((idx) => idx >= 0 && idx < originalPageCount);
      }

      if (targetIndices.length === 0) {
        throw new Error('No pages selected for extraction.');
      }

      const targetPageIds = targetIndices.map((idx) => pageIds[idx]);
      const outputBuffer = buildPdfFromObjects(rawObjs, targetPageIds);

      return {
        isValid: true,
        outputBuffer,
        totalPages: targetPageIds.length,
        originalPageCount,
        byteSize: outputBuffer.byteLength,
      };
    }

    throw new Error(`Unsupported operation: ${operation}`);
  } catch (err: any) {
    return {
      isValid: false,
      error: err?.message || 'Failed to process PDF',
      totalPages: 0,
      originalPageCount: 0,
      byteSize: 0,
    };
  }
}
