import type { JwtInspectorInput, JwtInspectorOutput, JwtClaimRow } from './definition';

const STANDARD_CLAIMS: Record<string, string> = {
  iss: 'Issuer of the token (who created and signed it)',
  sub: 'Subject identifier (usually unique user or client ID)',
  aud: 'Audience intended to receive and accept this token',
  exp: 'Expiration timestamp (when the token ceases to be valid)',
  nbf: 'Not Before timestamp (token is invalid prior to this time)',
  iat: 'Issued At timestamp (when token was minted)',
  jti: 'Unique JWT identifier / nonce (prevents replay attacks)',
  name: 'Full display name of the subject',
  email: 'Email address of the subject',
  roles: 'Assigned access roles and permissions',
  scope: 'OAuth 2.0 authorization scopes granted',
};

function decodeBase64Url(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = base64.length % 4;
  if (pad === 2) {
    base64 += '==';
  } else if (pad === 3) {
    base64 += '=';
  } else if (pad === 1) {
    throw new Error('Illegal Base64URL string length');
  }

  // Use binary decode to correctly support UTF-8 multi-byte characters
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new TextDecoder().decode(bytes);
}

function safeToIsoString(timestampSec: number): string | undefined {
  if (!Number.isFinite(timestampSec)) return undefined;
  const ms = timestampSec * 1000;
  if (ms < -8640000000000000 || ms > 8640000000000000) return undefined;
  try {
    const d = new Date(ms);
    return isNaN(d.getTime()) ? undefined : d.toISOString();
  } catch {
    return undefined;
  }
}

function formatRelativeTime(secondsDiff: number): string {
  const isPast = secondsDiff < 0;
  const absSec = Math.abs(secondsDiff);

  if (absSec < 60) {
    return isPast ? `${Math.floor(absSec)} seconds ago` : `in ${Math.floor(absSec)} seconds`;
  }
  const mins = Math.floor(absSec / 60);
  if (mins < 60) {
    return isPast ? `${mins} minutes ago` : `in ${mins} minutes`;
  }
  const hours = Math.floor(mins / 60);
  const remainingMins = mins % 60;
  if (hours < 24) {
    return isPast
      ? `${hours}h ${remainingMins}m ago`
      : `in ${hours}h ${remainingMins}m`;
  }
  const days = Math.floor(hours / 24);
  return isPast ? `${days} days ago` : `in ${days} days`;
}

export function executeJwtInspector(input: JwtInspectorInput): JwtInspectorOutput {
  const token = (input?.token || '').trim();

  if (!token) {
    return {
      isValid: true,
      header: {},
      payload: {},
      signatureHex: '',
      isExpired: false,
      claimsTable: [],
    };
  }

  const parts = token.split('.');
  if (parts.length !== 3) {
    return {
      isValid: false,
      error: `Invalid JWT structure: Token has ${parts.length} segment(s), but standard JWTs must have exactly 3 dot-separated segments (header.payload.signature).`,
      header: {},
      payload: {},
      signatureHex: '',
      isExpired: false,
      claimsTable: [],
    };
  }

  let header: Record<string, unknown> = {};
  let payload: Record<string, unknown> = {};

  try {
    const decodedHeader = decodeBase64Url(parts[0]);
    header = JSON.parse(decodedHeader);
  } catch (err: any) {
    return {
      isValid: false,
      error: `Failed to decode JWT Header: ${err?.message || 'Invalid Base64URL or malformed JSON'}`,
      header: {},
      payload: {},
      signatureHex: parts[2] || '',
      isExpired: false,
      claimsTable: [],
    };
  }

  try {
    const decodedPayload = decodeBase64Url(parts[1]);
    payload = JSON.parse(decodedPayload);
  } catch (err: any) {
    return {
      isValid: false,
      error: `Failed to decode JWT Payload: ${err?.message || 'Invalid Base64URL or malformed JSON'}`,
      header,
      payload: {},
      signatureHex: parts[2] || '',
      isExpired: false,
      claimsTable: [],
    };
  }

  const nowSec = Math.floor(Date.now() / 1000);
  let isExpired = false;
  let expiresAt: string | undefined = undefined;
  let issuedAt: string | undefined = undefined;
  let notBefore: string | undefined = undefined;
  let timeUntilExpiry: string | undefined = undefined;

  if (typeof payload.exp === 'number' && Number.isFinite(payload.exp)) {
    expiresAt = safeToIsoString(payload.exp);
    const diff = payload.exp - nowSec;
    isExpired = diff <= 0;
    timeUntilExpiry = diff <= 0 ? `Expired ${formatRelativeTime(diff)}` : `Expires ${formatRelativeTime(diff)}`;
  }

  if (typeof payload.iat === 'number' && Number.isFinite(payload.iat)) {
    issuedAt = safeToIsoString(payload.iat);
  }

  if (typeof payload.nbf === 'number' && Number.isFinite(payload.nbf)) {
    notBefore = safeToIsoString(payload.nbf);
  }

  const claimsTable: JwtClaimRow[] = Object.entries(payload).map(([key, value]) => ({
    key,
    value,
    description: STANDARD_CLAIMS[key] || 'Custom user/application claim',
  }));

  return {
    isValid: true,
    header,
    payload,
    signatureHex: parts[2],
    algorithm: typeof header.alg === 'string' ? header.alg : undefined,
    isExpired,
    issuedAt,
    expiresAt,
    notBefore,
    timeUntilExpiry,
    claimsTable,
  };
}
