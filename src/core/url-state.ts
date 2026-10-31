export interface ParsedUrlState {
  toolId?: string;
  initialInput?: unknown;
}

/**
 * Returns the base path of the site (e.g. '/tools/' on GitHub Pages or '/' on root/custom domains).
 */
export function getBaseBasePath(): string {
  if (typeof window === 'undefined') return '/';
  const pathname = window.location.pathname;
  if (pathname.startsWith('/tools/') || pathname === '/tools') {
    return '/tools/';
  }
  return '/';
}

/**
 * Returns the clean, canonical relative or absolute URL for a given tool.
 */
export function getToolUrl(toolId: string): string {
  const base = getBaseBasePath();
  return `${base}${toolId}/`;
}

/**
 * Parses current URL to extract the active tool ID and optional initial state.
 * Supports:
 *  1. Clean path routes: /tools/<tool-id>/ or /<tool-id>/
 *  2. Hash routes: #tool=<tool-id>&input=...
 *  3. Query params: ?tool=<tool-id>&input=...
 */
export function parseUrlState(knownToolIds?: string[]): ParsedUrlState {
  if (typeof window === 'undefined') return {};

  try {
    // 1. Check path segments first
    const pathname = window.location.pathname;
    const segments = pathname.split('/').filter(Boolean);
    let pathToolId: string | undefined = undefined;

    if (segments.length > 0) {
      const lastSegment = segments[segments.length - 1];
      if (lastSegment !== 'tools' && lastSegment !== 'index.html' && lastSegment !== '404.html') {
        if (!knownToolIds || knownToolIds.includes(lastSegment)) {
          pathToolId = lastSegment;
        }
      }
    }

    // 2. Check query params & hash
    const searchParams = new URLSearchParams(window.location.search);
    const hash = window.location.hash.replace(/^#\/?/, '');
    const hashParams = new URLSearchParams(hash);

    const toolId = hashParams.get('tool') || searchParams.get('tool') || pathToolId;
    const rawInput = hashParams.get('input') || searchParams.get('input');

    let initialInput: unknown = undefined;
    if (rawInput) {
      try {
        initialInput = JSON.parse(decodeURIComponent(rawInput));
      } catch {
        try {
          initialInput = JSON.parse(rawInput);
        } catch {
          initialInput = rawInput;
        }
      }
    }

    return { toolId, initialInput };
  } catch (err) {
    console.error('Failed to parse URL state:', err);
    return {};
  }
}

/**
 * Updates browser history to point to a tool URL or homepage.
 */
export function setUrlTool(toolId: string | null, input?: unknown): void {
  if (typeof window === 'undefined') return;

  const base = getBaseBasePath();

  if (!toolId) {
    window.history.pushState(null, '', base);
    return;
  }

  const toolUrl = getToolUrl(toolId);

  if (input !== undefined && input !== null) {
    const serialized = encodeURIComponent(typeof input === 'string' ? input : JSON.stringify(input));
    // For sensitive or stateful input, attach as query param or hash
    window.history.pushState(null, '', `${toolUrl}?input=${serialized}`);
  } else {
    window.history.pushState(null, '', toolUrl);
  }
}
