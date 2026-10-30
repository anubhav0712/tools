export interface ParsedUrlState {
  toolId?: string;
  initialInput?: unknown;
}

export function parseUrlState(): ParsedUrlState {
  if (typeof window === 'undefined') return {};

  try {
    const hash = window.location.hash.replace(/^#\/?/, '');
    if (!hash) return {};

    const params = new URLSearchParams(hash);
    const toolId = params.get('tool') || undefined;
    const rawInput = params.get('input');

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
    console.error('Failed to parse URL state hash:', err);
    return {};
  }
}

export function setUrlTool(toolId: string | null, input?: unknown): void {
  if (typeof window === 'undefined') return;

  if (!toolId) {
    window.history.pushState(null, '', window.location.pathname);
    return;
  }

  const params = new URLSearchParams();
  params.set('tool', toolId);
  if (input !== undefined && input !== null) {
    params.set('input', encodeURIComponent(typeof input === 'string' ? input : JSON.stringify(input)));
  }

  window.history.pushState(null, '', `#${params.toString()}`);
}
