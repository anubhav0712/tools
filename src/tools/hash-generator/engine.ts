import type {
  HashGeneratorInput,
  HashGeneratorOutput,
} from './definition';

/**
 * Pure JavaScript MD5 implementation (RFC 1321) for local execution without external deps
 */
function md5(bytes: Uint8Array): Uint8Array {
  function safeAdd(x: number, y: number): number {
    const lsw = (x & 0xffff) + (y & 0xffff);
    const msw = (x >> 16) + (y >> 16) + (lsw >> 16);
    return (msw << 16) | (lsw & 0xffff);
  }

  function bitRotateLeft(num: number, cnt: number): number {
    return (num << cnt) | (num >>> (32 - cnt));
  }

  function cmn(q: number, a: number, b: number, x: number, s: number, t: number): number {
    return safeAdd(bitRotateLeft(safeAdd(safeAdd(a, q), safeAdd(x, t)), s), b);
  }

  function ff(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn((b & c) | (~b & d), a, b, x, s, t);
  }
  function gg(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn((b & d) | (c & ~d), a, b, x, s, t);
  }
  function hh(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn(b ^ c ^ d, a, b, x, s, t);
  }
  function ii(a: number, b: number, c: number, d: number, x: number, s: number, t: number): number {
    return cmn(c ^ (b | ~d), a, b, x, s, t);
  }

  const n = bytes.length;
  const wordCount = (((n + 8) >> 6) + 1) * 16;
  const x = new Int32Array(wordCount);

  for (let i = 0; i < n; i++) {
    x[i >> 2] |= bytes[i] << ((i % 4) * 8);
  }
  x[n >> 2] |= 0x80 << ((n % 4) * 8);
  x[wordCount - 2] = (n * 8) & 0xffffffff;
  x[wordCount - 1] = Math.floor((n * 8) / 0x100000000);

  let a = 1732584193;
  let b = -271733879;
  let c = -1732584194;
  let d = 271733878;

  for (let k = 0; k < wordCount; k += 16) {
    const olda = a;
    const oldb = b;
    const oldc = c;
    const oldd = d;

    a = ff(a, b, c, d, x[k + 0], 7, -680876936);
    d = ff(d, a, b, c, x[k + 1], 12, -389564586);
    c = ff(c, d, a, b, x[k + 2], 17, 606105819);
    b = ff(b, c, d, a, x[k + 3], 22, -1044525330);
    a = ff(a, b, c, d, x[k + 4], 7, -176418897);
    d = ff(d, a, b, c, x[k + 5], 12, 1200080426);
    c = ff(c, d, a, b, x[k + 6], 17, -1473231341);
    b = ff(b, c, d, a, x[k + 7], 22, -45705983);
    a = ff(a, b, c, d, x[k + 8], 7, 1770035416);
    d = ff(d, a, b, c, x[k + 9], 12, -1958414417);
    c = ff(c, d, a, b, x[k + 10], 17, -42063);
    b = ff(b, c, d, a, x[k + 11], 22, -1990404162);
    a = ff(a, b, c, d, x[k + 12], 7, 1804603682);
    d = ff(d, a, b, c, x[k + 13], 12, -40341101);
    c = ff(c, d, a, b, x[k + 14], 17, -1502002290);
    b = ff(b, c, d, a, x[k + 15], 22, 1236535329);

    a = gg(a, b, c, d, x[k + 1], 5, -165796510);
    d = gg(d, a, b, c, x[k + 6], 9, -1069501632);
    c = gg(c, d, a, b, x[k + 11], 14, 643717713);
    b = gg(b, c, d, a, x[k + 0], 20, -373897302);
    a = gg(a, b, c, d, x[k + 5], 5, -701558691);
    d = gg(d, a, b, c, x[k + 10], 9, 38016083);
    c = gg(c, d, a, b, x[k + 15], 14, -660478335);
    b = gg(b, c, d, a, x[k + 4], 20, -405537848);
    a = gg(a, b, c, d, x[k + 9], 5, 568446438);
    d = gg(d, a, b, c, x[k + 14], 9, -1019803690);
    c = gg(c, d, a, b, x[k + 3], 14, -187363961);
    b = gg(b, c, d, a, x[k + 8], 20, 1163531501);
    a = gg(a, b, c, d, x[k + 13], 5, -1444681467);
    d = gg(d, a, b, c, x[k + 2], 9, -51403784);
    c = gg(c, d, a, b, x[k + 7], 14, 1735328473);
    b = gg(b, c, d, a, x[k + 12], 20, -1926607734);

    a = hh(a, b, c, d, x[k + 5], 4, -378558);
    d = hh(d, a, b, c, x[k + 8], 11, -2022574463);
    c = hh(c, d, a, b, x[k + 11], 16, 1839030562);
    b = hh(b, c, d, a, x[k + 14], 23, -35309556);
    a = hh(a, b, c, d, x[k + 1], 4, -1530992060);
    d = hh(d, a, b, c, x[k + 4], 11, 1272893353);
    c = hh(c, d, a, b, x[k + 7], 16, -155497632);
    b = hh(b, c, d, a, x[k + 10], 23, -1094730640);
    a = hh(a, b, c, d, x[k + 13], 4, 681279174);
    d = hh(d, a, b, c, x[k + 0], 11, -358537222);
    c = hh(c, d, a, b, x[k + 3], 16, -722521979);
    b = hh(b, c, d, a, x[k + 6], 23, 76029189);
    a = hh(a, b, c, d, x[k + 9], 4, -640364487);
    d = hh(d, a, b, c, x[k + 12], 11, -421815835);
    c = hh(c, d, a, b, x[k + 15], 16, 530742520);
    b = hh(b, c, d, a, x[k + 2], 23, -995338651);

    a = ii(a, b, c, d, x[k + 0], 6, -198630844);
    d = ii(d, a, b, c, x[k + 7], 10, 1126891415);
    c = ii(c, d, a, b, x[k + 14], 15, -1416354905);
    b = ii(b, c, d, a, x[k + 5], 21, -57434055);
    a = ii(a, b, c, d, x[k + 12], 6, 1700485571);
    d = ii(d, a, b, c, x[k + 3], 10, -1894986606);
    c = ii(c, d, a, b, x[k + 10], 15, -1051523);
    b = ii(b, c, d, a, x[k + 1], 21, -2054922799);
    a = ii(a, b, c, d, x[k + 8], 6, 1873313359);
    d = ii(d, a, b, c, x[k + 15], 10, -30611744);
    c = ii(c, d, a, b, x[k + 6], 15, -1560198380);
    b = ii(b, c, d, a, x[k + 13], 21, 1309151649);
    a = ii(a, b, c, d, x[k + 4], 6, -145523070);
    d = ii(d, a, b, c, x[k + 11], 10, -1120210379);
    c = ii(c, d, a, b, x[k + 2], 15, 718787259);
    b = ii(b, c, d, a, x[k + 9], 21, -343485551);

    a = safeAdd(a, olda);
    b = safeAdd(b, oldb);
    c = safeAdd(c, oldc);
    d = safeAdd(d, oldd);
  }

  const result = new Uint8Array(16);
  const words = [a, b, c, d];
  for (let i = 0; i < 16; i++) {
    result[i] = (words[i >> 2] >> ((i % 4) * 8)) & 0xff;
  }
  return result;
}

function bufferToHex(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function bufferToBase64(buffer: ArrayBuffer | Uint8Array): string {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function executeHashGenerator(
  input: HashGeneratorInput
): Promise<HashGeneratorOutput> {
  const algorithm = input.algorithm || 'SHA-256';
  let dataBytes: Uint8Array;

  if (input.fileBuffer) {
    dataBytes = new Uint8Array(input.fileBuffer);
  } else {
    dataBytes = new TextEncoder().encode(input.text ?? '');
  }

  try {
    let digestBytes: Uint8Array;

    // Handle MD5
    if (algorithm === 'MD5') {
      if (input.hmacKey) {
        // MD5 HMAC
        const keyBytes = new TextEncoder().encode(input.hmacKey);
        const blockSize = 64;
        let key: any = keyBytes;
        if (key.length > blockSize) {
          key = md5(key);
        }
        const paddedKey = new Uint8Array(blockSize);
        paddedKey.set(key);

        const oKeyPad = new Uint8Array(blockSize);
        const iKeyPad = new Uint8Array(blockSize);
        for (let i = 0; i < blockSize; i++) {
          oKeyPad[i] = paddedKey[i] ^ 0x5c;
          iKeyPad[i] = paddedKey[i] ^ 0x36;
        }

        const innerData = new Uint8Array(blockSize + dataBytes.length);
        innerData.set(iKeyPad);
        innerData.set(dataBytes, blockSize);
        const innerHash = md5(innerData);

        const outerData = new Uint8Array(blockSize + innerHash.length);
        outerData.set(oKeyPad);
        outerData.set(innerHash, blockSize);
        digestBytes = md5(outerData);
      } else {
        digestBytes = md5(dataBytes);
      }
    } else {
      // SHA family (SHA-1, SHA-256, SHA-384, SHA-512)
      if (input.hmacKey) {
        const keyData = new TextEncoder().encode(input.hmacKey);
        const cryptoKey = await crypto.subtle.importKey(
          'raw',
          keyData,
          { name: 'HMAC', hash: { name: algorithm } },
          false,
          ['sign']
        );
        const signature = await crypto.subtle.sign('HMAC', cryptoKey, dataBytes as any);
        digestBytes = new Uint8Array(signature);
      } else {
        const hashBuffer = await crypto.subtle.digest(algorithm, dataBytes as any);
        digestBytes = new Uint8Array(hashBuffer);
      }
    }

    const hexDigest = bufferToHex(digestBytes);
    const base64Digest = bufferToBase64(digestBytes);

    let isMatch: boolean | undefined = undefined;
    if (input.expectedHash) {
      const cleanExpected = input.expectedHash.trim().toLowerCase();
      isMatch =
        cleanExpected === hexDigest.toLowerCase() ||
        cleanExpected === base64Digest;
    }

    return {
      isValid: true,
      algorithm,
      hexDigest,
      base64Digest,
      inputByteLength: dataBytes.length,
      isMatch,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: `Failed to compute hash: ${err?.message || 'Unknown cryptographic error'}`,
      algorithm,
      hexDigest: '',
      base64Digest: '',
      inputByteLength: dataBytes.length,
    };
  }
}
