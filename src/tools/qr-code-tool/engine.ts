import type {
  QrCodeToolInput,
  QrCodeToolOutput,
} from './definition';

/**
 * Compact, self-contained QR Code Matrix Generator (Byte mode, ISO/IEC 18004)
 */

// Galois Field GF(256) tables
const GF256_EXP = new Uint8Array(512);
const GF256_LOG = new Uint8Array(256);
(() => {
  let x = 1;
  for (let i = 0; i < 255; i++) {
    GF256_EXP[i] = x;
    GF256_EXP[i + 255] = x;
    GF256_LOG[x] = i;
    x = (x << 1) ^ (x >= 128 ? 0x11d : 0);
  }
})();

function gfMultiply(x: number, y: number): number {
  if (x === 0 || y === 0) return 0;
  return GF256_EXP[GF256_LOG[x] + GF256_LOG[y]];
}

function rsComputeSyndromes(data: Uint8Array, numEcBytes: number): Uint8Array {
  // Generate generator polynomial
  let gen = new Uint8Array([1]);
  for (let i = 0; i < numEcBytes; i++) {
    const next = new Uint8Array(gen.length + 1);
    const root = GF256_EXP[i];
    for (let j = 0; j < gen.length; j++) {
      next[j] ^= gfMultiply(gen[j], root);
      next[j + 1] ^= gen[j];
    }
    gen = next;
  }

  // Polynomial division
  const remainder = new Uint8Array(numEcBytes);
  for (let i = 0; i < data.length; i++) {
    const factor = data[i] ^ remainder[0];
    remainder.copyWithin(0, 1);
    remainder[numEcBytes - 1] = 0;
    for (let j = 0; j < numEcBytes; j++) {
      remainder[j] ^= gfMultiply(gen[gen.length - 1 - j], factor);
    }
  }

  return remainder;
}

// Version capacities (byte mode, Level M)
// Version 1: 21x21, 14 bytes data, 10 bytes EC
// Version 2: 25x25, 26 bytes data, 16 bytes EC
// Version 3: 29x29, 42 bytes data, 26 bytes EC
// Version 4: 33x33, 62 bytes data, 36 bytes EC
// Version 5: 37x37, 84 bytes data, 48 bytes EC
// Version 6: 41x41, 106 bytes data, 64 bytes EC
interface VersionInfo {
  version: number;
  size: number;
  dataBytes: number;
  ecBytes: number;
  alignmentPositions: number[];
}

const VERSIONS: VersionInfo[] = [
  { version: 1, size: 21, dataBytes: 14, ecBytes: 10, alignmentPositions: [] },
  { version: 2, size: 25, dataBytes: 26, ecBytes: 16, alignmentPositions: [6, 18] },
  { version: 3, size: 29, dataBytes: 42, ecBytes: 26, alignmentPositions: [6, 22] },
  { version: 4, size: 33, dataBytes: 62, ecBytes: 36, alignmentPositions: [6, 26] },
  { version: 5, size: 37, dataBytes: 84, ecBytes: 48, alignmentPositions: [6, 30] },
  { version: 6, size: 41, dataBytes: 106, ecBytes: 64, alignmentPositions: [6, 34] },
  { version: 7, size: 45, dataBytes: 122, ecBytes: 72, alignmentPositions: [6, 22, 38] },
  { version: 8, size: 49, dataBytes: 152, ecBytes: 88, alignmentPositions: [6, 24, 42] },
  { version: 9, size: 53, dataBytes: 180, ecBytes: 110, alignmentPositions: [6, 26, 46] },
  { version: 10, size: 57, dataBytes: 213, ecBytes: 130, alignmentPositions: [6, 28, 50] },
];

function selectVersion(byteCount: number): VersionInfo {
  for (const v of VERSIONS) {
    if (v.dataBytes >= byteCount + 3) {
      return v;
    }
  }
  throw new Error(`Input exceeds maximum supported capacity of ${VERSIONS[VERSIONS.length - 1].dataBytes - 3} bytes in client-side QR mode.`);
}

class BitBuffer {
  private bits: number[] = [];

  put(num: number, length: number) {
    for (let i = 0; i < length; i++) {
      this.bits.push(((num >>> (length - i - 1)) & 1));
    }
  }

  get length(): number {
    return this.bits.length;
  }

  get(index: number): boolean {
    return this.bits[index] === 1;
  }

  getBytes(): Uint8Array {
    const bytes = new Uint8Array(Math.ceil(this.bits.length / 8));
    for (let i = 0; i < this.bits.length; i++) {
      if (this.bits[i] === 1) {
        bytes[i >>> 3] |= 0x80 >>> (i & 7);
      }
    }
    return bytes;
  }
}

function generateQrMatrix(content: string): { matrix: boolean[][]; size: number } {
  const textBytes = new TextEncoder().encode(content);
  const version = selectVersion(textBytes.length);
  const size = version.size;

  // 1. Bit encoding in 8-bit byte mode
  const bb = new BitBuffer();
  bb.put(0x4, 4); // 8-bit byte mode indicator
  bb.put(textBytes.length, version.version < 10 ? 8 : 16); // Character count indicator
  for (let i = 0; i < textBytes.length; i++) {
    bb.put(textBytes[i], 8);
  }

  // Terminator
  const totalDataBits = version.dataBytes * 8;
  const padLength = Math.min(4, totalDataBits - bb.length);
  bb.put(0, padLength);

  // Align to byte
  if (bb.length % 8 !== 0) {
    bb.put(0, 8 - (bb.length % 8));
  }

  // Pad bytes 0xEC, 0x11
  let padByte = 0xec;
  while (bb.length < totalDataBits) {
    bb.put(padByte, 8);
    padByte = padByte === 0xec ? 0x11 : 0xec;
  }

  const dataPayload = bb.getBytes().slice(0, version.dataBytes);
  const ecPayload = rsComputeSyndromes(dataPayload, version.ecBytes);

  // Combine data + EC bytes
  const fullBytes = new Uint8Array(dataPayload.length + ecPayload.length);
  fullBytes.set(dataPayload);
  fullBytes.set(ecPayload, dataPayload.length);

  // 2. Initialize matrix
  const matrix: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));
  const isFunctionModule: boolean[][] = Array.from({ length: size }, () => new Array(size).fill(false));

  const setModule = (r: number, c: number, isDark: boolean, isFunc = true) => {
    if (r >= 0 && r < size && c >= 0 && c < size) {
      matrix[r][c] = isDark;
      if (isFunc) isFunctionModule[r][c] = true;
    }
  };

  // Finder Patterns (top-left, top-right, bottom-left)
  const drawFinder = (top: number, left: number) => {
    for (let r = -1; r <= 7; r++) {
      for (let c = -1; c <= 7; c++) {
        if (
          r >= 0 && r <= 6 && c >= 0 && c <= 6 &&
          (r === 0 || r === 6 || c === 0 || c === 6 || (r >= 2 && r <= 4 && c >= 2 && c <= 4))
        ) {
          setModule(top + r, left + c, true);
        } else {
          setModule(top + r, left + c, false);
        }
      }
    }
  };
  drawFinder(0, 0);
  drawFinder(0, size - 7);
  drawFinder(size - 7, 0);

  // Timing patterns
  for (let i = 8; i < size - 8; i++) {
    const isDark = i % 2 === 0;
    setModule(6, i, isDark);
    setModule(i, 6, isDark);
  }

  // Alignment patterns for version >= 2
  if (version.alignmentPositions.length > 0) {
    const pos = version.alignmentPositions;
    for (let r of pos) {
      for (let c of pos) {
        if (isFunctionModule[r][c]) continue;
        for (let dr = -2; dr <= 2; dr++) {
          for (let dc = -2; dc <= 2; dc++) {
            const isDark = Math.abs(dr) === 2 || Math.abs(dc) === 2 || (dr === 0 && dc === 0);
            setModule(r + dr, c + dc, isDark);
          }
        }
      }
    }
  }

  // Reserve format information areas
  for (let i = 0; i < 9; i++) {
    if (i !== 6) {
      setModule(8, i, false);
      setModule(i, 8, false);
    }
  }
  for (let i = 0; i < 8; i++) {
    setModule(8, size - 1 - i, false);
    setModule(size - 1 - i, 8, false);
  }
  setModule(size - 8, 8, true); // Dark module

  // Write codewords into matrix using zigzag scan
  let bitIdx = 0;
  const totalBits = fullBytes.length * 8;
  const getBit = (idx: number) => {
    if (idx >= totalBits) return false;
    const b = fullBytes[idx >>> 3];
    return ((b >>> (7 - (idx & 7))) & 1) === 1;
  };

  let up = true;
  for (let right = size - 1; right > 0; right -= 2) {
    if (right === 6) right--; // Skip vertical timing column
    for (let vert = 0; vert < size; vert++) {
      const r = up ? size - 1 - vert : vert;
      for (let c = right; c > right - 2; c--) {
        if (!isFunctionModule[r][c]) {
          let dark = getBit(bitIdx++);
          // Mask pattern 0: (r + c) % 2 === 0
          if ((r + c) % 2 === 0) {
            dark = !dark;
          }
          matrix[r][c] = dark;
        }
      }
    }
    up = !up;
  }

  // Write format info (EC Level M, Mask 0 = 0x5412)
  const formatBits = 0x5412;
  for (let i = 0; i < 15; i++) {
    const bit = ((formatBits >>> i) & 1) === 1;
    if (i < 6) setModule(8, i, bit);
    else if (i < 8) setModule(8, i + 1, bit);
    else setModule(8, size - 15 + i, bit);

    if (i < 7) setModule(size - 1 - i, 8, bit);
    else if (i < 9) setModule(15 - i, 8, bit);
    else setModule(14 - i, 8, bit);
  }

  return { matrix, size };
}

export function executeQrCodeTool(input: QrCodeToolInput): QrCodeToolOutput {
  const content = (input?.content || '').trim();
  const fg = input?.foregroundHex || '#0F172A';
  const bg = input?.backgroundHex || '#FFFFFF';
  const margin = Math.max(1, Math.min(10, input?.margin ?? 4));

  if (!content) {
    return {
      isValid: true,
      svgMarkup: '',
      payloadString: '',
      matrixSize: 0,
    };
  }

  try {
    const { matrix, size } = generateQrMatrix(content);
    const totalSize = size + margin * 2;

    let pathData = '';
    for (let r = 0; r < size; r++) {
      for (let c = 0; c < size; c++) {
        if (matrix[r][c]) {
          pathData += `M${c + margin},${r + margin}h1v1h-1z `;
        }
      }
    }

    const svgMarkup = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" shape-rendering="crispEdges">
  <rect width="${totalSize}" height="${totalSize}" fill="${bg}" />
  <path d="${pathData.trim()}" fill="${fg}" />
</svg>`;

    return {
      isValid: true,
      svgMarkup,
      payloadString: content,
      matrixSize: size,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: `Failed to generate QR code: ${err?.message || 'Unsupported data size'}`,
      svgMarkup: '',
      payloadString: content,
      matrixSize: 0,
    };
  }
}
