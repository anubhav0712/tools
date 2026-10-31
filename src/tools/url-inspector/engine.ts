import type {
  UrlInspectorInput,
  UrlInspectorOutput,
  QueryParamItem,
} from './definition';

export function executeUrlInspector(input: UrlInspectorInput): UrlInspectorOutput {
  const raw = (input?.rawUrl || '').trim();

  if (!raw) {
    return {
      isValid: true,
      protocol: '',
      host: '',
      port: '',
      pathname: '',
      hash: '',
      queryParams: [],
      utmTags: {},
      encodedUrl: '',
      decodedUrl: '',
    };
  }

  let parsed: URL;
  let isDummyBase = false;

  try {
    if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(raw)) {
      parsed = new URL(raw);
    } else {
      isDummyBase = true;
      parsed = new URL(raw.startsWith('/') ? `http://localhost${raw}` : `http://localhost/${raw}`);
    }
  } catch (err: any) {
    return {
      isValid: false,
      error: `Invalid URL format: ${err?.message || 'Unable to parse string as URL'}`,
      protocol: '',
      host: '',
      port: '',
      pathname: '',
      hash: '',
      queryParams: [],
      utmTags: {},
      encodedUrl: encodeURI(raw),
      decodedUrl: decodeURI(raw),
    };
  }

  const queryParams: QueryParamItem[] = [];
  const utmTags: Record<string, string> = {};

  const searchStr = parsed.search.startsWith('?') ? parsed.search.slice(1) : parsed.search;
  if (searchStr) {
    const pairs = searchStr.split('&');
    for (const pair of pairs) {
      if (!pair) continue;
      const eqIdx = pair.indexOf('=');
      const rawKey = eqIdx >= 0 ? pair.slice(0, eqIdx) : pair;
      const rawVal = eqIdx >= 0 ? pair.slice(eqIdx + 1) : '';

      let decodedKey = rawKey;
      let decodedVal = rawVal;
      try {
        decodedKey = decodeURIComponent(rawKey);
      } catch {}
      try {
        decodedVal = decodeURIComponent(rawVal);
      } catch {}

      queryParams.push({
        key: decodedKey,
        rawValue: rawVal,
        decodedValue: decodedVal,
      });

      if (decodedKey.startsWith('utm_')) {
        utmTags[decodedKey] = decodedVal;
      }
    }
  }

  let encodedUrl = '';
  let decodedUrl = '';
  try {
    encodedUrl = encodeURI(raw);
  } catch {
    encodedUrl = raw;
  }

  try {
    decodedUrl = decodeURIComponent(raw);
  } catch {
    decodedUrl = raw;
  }

  return {
    isValid: true,
    protocol: isDummyBase ? '' : parsed.protocol,
    host: isDummyBase ? '' : parsed.host,
    port: isDummyBase ? '' : parsed.port,
    pathname: isDummyBase ? parsed.pathname.replace(/^\/http:\/\/localhost\/?/, '/') : parsed.pathname,
    hash: parsed.hash,
    queryParams,
    utmTags,
    encodedUrl,
    decodedUrl,
  };
}
