import type { JsonFormatterInput, JsonFormatterOutput } from './definition';

function sortObjectKeys(obj: unknown): unknown {
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  if (obj !== null && typeof obj === 'object') {
    return Object.keys(obj as Record<string, unknown>)
      .sort()
      .reduce((acc, key) => {
        acc[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
        return acc;
      }, {} as Record<string, unknown>);
  }
  return obj;
}

export function executeJsonFormatter(input: JsonFormatterInput): JsonFormatterOutput {
  const { rawJson, indent = 2, sortKeys = false } = input;

  if (!rawJson.trim()) {
    return {
      formatted: '',
      isValid: true,
      lineCount: 0,
      byteSize: 0,
    };
  }

  try {
    let parsed = JSON.parse(rawJson);

    if (sortKeys) {
      parsed = sortObjectKeys(parsed);
    }

    const formatted = JSON.stringify(parsed, null, indent);
    const lineCount = formatted ? formatted.split('\n').length : 0;
    const byteSize = new Blob([formatted]).size;

    return {
      formatted,
      isValid: true,
      lineCount,
      byteSize,
    };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Invalid JSON format';
    return {
      formatted: rawJson,
      isValid: false,
      error: errorMsg,
      lineCount: rawJson.split('\n').length,
      byteSize: new Blob([rawJson]).size,
    };
  }
}
