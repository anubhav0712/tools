import type { SvgSanitizerInput, SvgSanitizerOutput } from './definition';

const DANGEROUS_TAGS = ['script', 'iframe', 'object', 'embed', 'foreignobject', 'metadata'];

export function executeSvgSanitizer(input: SvgSanitizerInput): SvgSanitizerOutput {
  const raw = (input?.rawSvg || '').trim();
  const stripDimensions = Boolean(input?.stripDimensions);

  if (!raw) {
    return {
      isValid: true,
      sanitizedSvg: '',
      removedElementsCount: 0,
      originalByteSize: 0,
      cleanedByteSize: 0,
      bytesSaved: 0,
    };
  }

  const originalByteSize = new TextEncoder().encode(raw).length;
  let removedCount = 0;
  let cleaned = raw;

  // 1. Remove XML declarations and DOCTYPEs
  if (/<\?xml[\s\S]*?\?>/i.test(cleaned)) {
    cleaned = cleaned.replace(/<\?xml[\s\S]*?\?>/gi, '');
    removedCount++;
  }
  if (/<!DOCTYPE[\s\S]*?>/i.test(cleaned)) {
    cleaned = cleaned.replace(/<!DOCTYPE[\s\S]*?>/gi, '');
    removedCount++;
  }

  // 2. Remove comments
  const commentMatches = cleaned.match(/<!--[\s\S]*?-->/g);
  if (commentMatches) {
    removedCount += commentMatches.length;
    cleaned = cleaned.replace(/<!--[\s\S]*?-->/g, '');
  }

  // 3. Remove dangerous / bloated tags
  for (const tag of DANGEROUS_TAGS) {
    const pairedRegex = new RegExp(`<${tag}[^>]*>[\\s\\S]*?<\\/${tag}>`, 'gi');
    const matches = cleaned.match(pairedRegex);
    if (matches) {
      removedCount += matches.length;
      cleaned = cleaned.replace(pairedRegex, '');
    }

    const selfClosingRegex = new RegExp(`<${tag}[^>]*\\/?>`, 'gi');
    const selfMatches = cleaned.match(selfClosingRegex);
    if (selfMatches) {
      removedCount += selfMatches.length;
      cleaned = cleaned.replace(selfClosingRegex, '');
    }
  }

  // 4. Remove dangerous event handlers: on* (onload, onclick, onerror, etc.) - quoted or unquoted
  const onEventRegex = /\s+on[a-zA-Z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
  const eventMatches = cleaned.match(onEventRegex);
  if (eventMatches) {
    removedCount += eventMatches.length;
    cleaned = cleaned.replace(onEventRegex, '');
  }

  // 5. Remove javascript: and script-bearing URIs in href and xlink:href (quoted or unquoted)
  const jsHrefRegex = /\s+(?:xlink:)?href\s*=\s*(?:"\s*(?:javascript|vbscript|data:text\/html):[^"]*"|'\s*(?:javascript|vbscript|data:text\/html):[^']*'|(?:javascript|vbscript|data:text\/html):[^\s>]+)/gi;
  const jsMatches = cleaned.match(jsHrefRegex);
  if (jsMatches) {
    removedCount += jsMatches.length;
    cleaned = cleaned.replace(jsHrefRegex, '');
  }

  // 6. Optional: Strip width and height on root <svg> if requested
  if (stripDimensions) {
    cleaned = cleaned.replace(/(<svg\b[^>]*?)\s+width\s*=\s*(['"]).*?\2/i, '$1');
    cleaned = cleaned.replace(/(<svg\b[^>]*?)\s+height\s*=\s*(['"]).*?\2/i, '$1');
  }

  // 7. Cleanup extra whitespace
  cleaned = cleaned.trim().replace(/\n\s*\n/g, '\n');

  // Verify that it still looks like an SVG
  if (!/<svg\b[^>]*>/i.test(cleaned)) {
    return {
      isValid: false,
      error: 'Invalid SVG structure: Root <svg> element not found.',
      sanitizedSvg: raw,
      removedElementsCount: 0,
      originalByteSize,
      cleanedByteSize: originalByteSize,
      bytesSaved: 0,
    };
  }

  const cleanedByteSize = new TextEncoder().encode(cleaned).length;
  const bytesSaved = Math.max(0, originalByteSize - cleanedByteSize);

  return {
    isValid: true,
    sanitizedSvg: cleaned,
    removedElementsCount: removedCount,
    originalByteSize,
    cleanedByteSize,
    bytesSaved,
  };
}
