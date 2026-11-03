import type { ToolDefinition } from '../../core/types';
import { executeJwtInspector } from './engine';
import { JwtInspectorUI } from './ui';

export interface JwtInspectorInput {
  token: string;
}

export interface JwtClaimRow {
  key: string;
  value: unknown;
  description: string;
}

export interface JwtInspectorOutput {
  isValid: boolean;
  error?: string;
  header: Record<string, unknown>;
  payload: Record<string, unknown>;
  signatureHex: string;
  algorithm?: string;
  isExpired: boolean;
  issuedAt?: string;
  expiresAt?: string;
  notBefore?: string;
  timeUntilExpiry?: string;
  claimsTable: JwtClaimRow[];
}

export const jwtInspectorTool: ToolDefinition<JwtInspectorInput, JwtInspectorOutput> = {
  metadata: {
    id: 'jwt-inspector',
    name: 'JWT Inspector',
    category: 'crypto',
    description: 'Inspect, decode, and validate JSON Web Tokens safely with zero server communication.',
    keywords: ['jwt', 'token', 'bearer', 'decode', 'claims', 'auth', 'oauth', 'json web token'],
    version: '1.0.0',
    icon: 'KeyRound',
    persistableInUrl: false, // Do NOT serialize sensitive auth tokens into URL hash!
    reviewPolicy: {
      cadence: 'standards-track',
      regulatoryCategory: 'security-standards',
      governingBodyOrStandard: 'IETF RFC 7519 (JWT), RFC 7515 (JWS), RFC 8725 (JWT Best Current Practices)',
      lastReviewedDate: '2026-10-31',
      nextReviewDate: '2027-10-31',
      reviewTrigger: 'IETF OAuth WG / JOSE WG publications or new standard claim registrations',
      changeRisk: 'medium',
      notes: 'Inspect for new RFC standard claims, deprecated signature algorithms, or updated security recommendations.',
    },
  },
  examples: [
    {
      title: 'Valid Active Token',
      description: 'Standard JWT with 1 hour expiration from now',
      input: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkFuZHLDqSBEZXZlbG9wZXIiLCJlbWFpbCI6ImFuZHJlQGV4YW1wbGUuY29tIiwicm9sZXMiOlsidXNlciIsImFkbWluIl0sImlhdCI6MTc2MTgwMDAwMCwiZXhwIjoyNTIwMDAwMDAwfQ.signature_placeholder_sample',
      },
    },
    {
      title: 'Expired Token',
      description: 'JWT with past expiration timestamp',
      input: {
        token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c2VyXzk4NzY1IiwibmFtZSI6IkphbmUgRG9lIiwiZXhwIjoxNTExNTcyMDEyfQ.dummy_signature_expired',
      },
    },
  ],
  execute: executeJwtInspector,
  Component: JwtInspectorUI,
};
