import type { Base64ConverterInput, Base64ConverterOutput } from './definition';

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBytes(base64: string): Uint8Array {
  const binary = atob(base64);
  const len = binary.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

export function executeBase64Converter(input: Base64ConverterInput): Base64ConverterOutput {
  const { text, mode, urlSafe } = input;

  if (!text) {
    return {
      result: '',
      isValid: true,
      byteSize: 0,
    };
  }

  try {
    if (mode === 'encode') {
      const bytes = new TextEncoder().encode(text);
      let encoded = bytesToBase64(bytes);

      if (urlSafe) {
        encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
      }

      return {
        result: encoded,
        isValid: true,
        byteSize: new Blob([encoded]).size,
      };
    } else {
      // Decode
      let sanitized = text.replace(/\s+/g, '');
      if (urlSafe || sanitized.includes('-') || sanitized.includes('_')) {
        sanitized = sanitized.replace(/-/g, '+').replace(/_/g, '/');
        while (sanitized.length % 4 !== 0) {
          sanitized += '=';
        }
      }

      const bytes = base64ToBytes(sanitized);
      const decoded = new TextDecoder('utf-8', { fatal: true }).decode(bytes);

      return {
        result: decoded,
        isValid: true,
        byteSize: new Blob([decoded]).size,
      };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid Base64 sequence';
    return {
      result: text,
      isValid: false,
      error: errorMsg,
      byteSize: new Blob([text]).size,
    };
  }
}
