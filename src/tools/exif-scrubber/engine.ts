import type {
  ExifScrubberInput,
  ExifScrubberOutput,
  ExifExtractedData,
} from './definition';

function parseJpegExif(view: DataView): {
  extracted: ExifExtractedData;
  cleanedBuffer: ArrayBuffer;
} {
  const extracted: ExifExtractedData = { hasExif: false };
  const length = view.byteLength;

  if (view.getUint16(0, false) !== 0xffd8) {
    // Not a standard JPEG
    const copy = new Uint8Array(view.byteLength);
    copy.set(new Uint8Array(view.buffer, view.byteOffset, view.byteLength));
    return { extracted, cleanedBuffer: copy.buffer };
  }

  let offset = 2;
  const segmentsToKeep: Array<{ start: number; end: number }> = [{ start: 0, end: 2 }];

  while (offset < length - 4) {
    if (view.getUint8(offset) !== 0xff) {
      break;
    }

    const marker = view.getUint8(offset + 1);

    // SOS (Start of Scan) - all remaining bytes are compressed image data
    if (marker === 0xda) {
      segmentsToKeep.push({ start: offset, end: length });
      break;
    }

    const segLen = view.getUint16(offset + 2, false);
    const segEnd = offset + 2 + segLen;

    // APP1 marker (EXIF)
    if (marker === 0xe1) {
      extracted.hasExif = true;
      try {
        parseApp1(view, offset + 4, segLen - 2, extracted);
      } catch {
        // Continue parsing even if corrupt tags
      }
      // DO NOT keep APP1 segment in cleaned buffer!
    } else if (marker === 0xfe || marker === 0xe2) {
      // COM (Comment) or APP2 (XMP/ICC metadata) - strip for privacy
    } else {
      segmentsToKeep.push({ start: offset, end: segEnd });
    }

    offset = segEnd;
  }

  // Assemble cleaned buffer
  let totalCleanedBytes = 0;
  segmentsToKeep.forEach((s) => (totalCleanedBytes += s.end - s.start));
  const cleanedBytes = new Uint8Array(totalCleanedBytes);
  const srcBytes = new Uint8Array(view.buffer);

  let destOffset = 0;
  for (const s of segmentsToKeep) {
    const chunk = srcBytes.subarray(s.start, s.end);
    cleanedBytes.set(chunk, destOffset);
    destOffset += chunk.length;
  }

  return {
    extracted,
    cleanedBuffer: cleanedBytes.buffer,
  };
}

function parseApp1(
  view: DataView,
  offset: number,
  _length: number,
  extracted: ExifExtractedData
) {
  // Check "Exif\0\0" header
  const isExif =
    view.getUint8(offset) === 0x45 &&
    view.getUint8(offset + 1) === 0x78 &&
    view.getUint8(offset + 2) === 0x69 &&
    view.getUint8(offset + 3) === 0x66 &&
    view.getUint8(offset + 4) === 0x00 &&
    view.getUint8(offset + 5) === 0x00;

  if (!isExif) return;

  const tiffOffset = offset + 6;
  const endianMarker = view.getUint16(tiffOffset, false);
  const isLittleEndian = endianMarker === 0x4949; // "II"

  if (view.getUint16(tiffOffset + 2, isLittleEndian) !== 0x002a) {
    return; // Invalid TIFF header
  }

  const ifd0Offset = tiffOffset + view.getUint32(tiffOffset + 4, isLittleEndian);
  const numEntries = view.getUint16(ifd0Offset, isLittleEndian);

  let gpsOffset = 0;

  for (let i = 0; i < numEntries; i++) {
    const entryOffset = ifd0Offset + 2 + i * 12;
    if (entryOffset + 12 > view.byteLength) break;

    const tag = view.getUint16(entryOffset, isLittleEndian);
    const type = view.getUint16(entryOffset + 2, isLittleEndian);
    const count = view.getUint32(entryOffset + 4, isLittleEndian);

    const valOffset =
      count * (type === 1 || type === 2 ? 1 : type === 3 ? 2 : 4) > 4
        ? tiffOffset + view.getUint32(entryOffset + 8, isLittleEndian)
        : entryOffset + 8;

    if (tag === 0x010f && type === 2) {
      extracted.make = readString(view, valOffset, count);
    } else if (tag === 0x0110 && type === 2) {
      extracted.model = readString(view, valOffset, count);
    } else if (tag === 0x0131 && type === 2) {
      extracted.software = readString(view, valOffset, count);
    } else if (tag === 0x0132 && type === 2) {
      extracted.dateTime = readString(view, valOffset, count);
    } else if (tag === 0x8825 && type === 4) {
      gpsOffset = tiffOffset + view.getUint32(entryOffset + 8, isLittleEndian);
    }
  }

  // Parse GPS IFD if present
  if (gpsOffset > 0 && gpsOffset + 2 < view.byteLength) {
    const numGpsEntries = view.getUint16(gpsOffset, isLittleEndian);
    let latRef = 'N';
    let lonRef = 'E';
    let latParts: number[] = [];
    let lonParts: number[] = [];

    for (let i = 0; i < numGpsEntries; i++) {
      const entryOffset = gpsOffset + 2 + i * 12;
      if (entryOffset + 12 > view.byteLength) break;

      const tag = view.getUint16(entryOffset, isLittleEndian);
      const valOffset = tiffOffset + view.getUint32(entryOffset + 8, isLittleEndian);

      if (tag === 0x0001) {
        latRef = String.fromCharCode(view.getUint8(entryOffset + 8));
      } else if (tag === 0x0002) {
        latParts = readRationals(view, valOffset, 3, isLittleEndian);
      } else if (tag === 0x0003) {
        lonRef = String.fromCharCode(view.getUint8(entryOffset + 8));
      } else if (tag === 0x0004) {
        lonParts = readRationals(view, valOffset, 3, isLittleEndian);
      }
    }

    if (latParts.length === 3 && lonParts.length === 3) {
      let lat = latParts[0] + latParts[1] / 60 + latParts[2] / 3600;
      if (latRef === 'S') lat = -lat;
      let lon = lonParts[0] + lonParts[1] / 60 + lonParts[2] / 3600;
      if (lonRef === 'W') lon = -lon;

      extracted.gps = {
        latitude: parseFloat(lat.toFixed(6)),
        longitude: parseFloat(lon.toFixed(6)),
        mapUrl: `https://www.openstreetmap.org/?mlat=${lat}&mlon=${lon}#map=16/${lat}/${lon}`,
      };
    }
  }
}

function readString(view: DataView, offset: number, count: number): string {
  let str = '';
  for (let i = 0; i < count; i++) {
    const byte = view.getUint8(offset + i);
    if (byte === 0) break;
    str += String.fromCharCode(byte);
  }
  return str.trim();
}

function readRationals(view: DataView, offset: number, count: number, isLittleEndian: boolean): number[] {
  const result: number[] = [];
  for (let i = 0; i < count; i++) {
    const num = view.getUint32(offset + i * 8, isLittleEndian);
    const den = view.getUint32(offset + i * 8 + 4, isLittleEndian);
    result.push(den === 0 ? 0 : num / den);
  }
  return result;
}

export function executeExifScrubber(input: ExifScrubberInput): ExifScrubberOutput {
  const buffer = input?.fileBuffer;

  if (!buffer || buffer.byteLength === 0) {
    return {
      isValid: true,
      extracted: { hasExif: false },
      originalByteSize: 0,
      cleanedByteSize: 0,
      bytesSaved: 0,
    };
  }

  const originalByteSize = buffer.byteLength;
  const view = new DataView(buffer);

  try {
    const { extracted, cleanedBuffer } = parseJpegExif(view);
    const cleanedByteSize = cleanedBuffer.byteLength;
    const bytesSaved = Math.max(0, originalByteSize - cleanedByteSize);

    return {
      isValid: true,
      extracted,
      cleanedBuffer,
      originalByteSize,
      cleanedByteSize,
      bytesSaved,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: `Failed to process image metadata: ${err?.message || 'Unsupported format'}`,
      extracted: { hasExif: false },
      cleanedBuffer: buffer,
      originalByteSize,
      cleanedByteSize: originalByteSize,
      bytesSaved: 0,
    };
  }
}
