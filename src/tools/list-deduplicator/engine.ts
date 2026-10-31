import type {
  ListDeduplicatorInput,
  ListDeduplicatorOutput,
  SetOperation,
} from './definition';

function tokenizeList(str: string, trimWhitespace: boolean): string[] {
  if (!str) return [];
  const lines = str.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  return lines
    .map((l) => (trimWhitespace ? l.trim() : l))
    .filter((l) => (trimWhitespace ? l !== '' : true));
}

export function executeListDeduplicator(
  input: ListDeduplicatorInput
): ListDeduplicatorOutput {
  const operation: SetOperation = input.operation || 'dedupe';
  const trimWhitespace = input.trimWhitespace !== false;
  const caseSensitive = Boolean(input.caseSensitive);
  const sortOrder = input.sortOrder || 'none';

  const itemsA = tokenizeList(input.listA || '', trimWhitespace);
  const itemsB = tokenizeList(input.listB || '', trimWhitespace);

  const getCanonicalKey = (item: string) => (caseSensitive ? item : item.toLowerCase());

  let rawResultSet: string[] = [];
  let originalCount = itemsA.length;

  if (operation === 'dedupe') {
    const seen = new Set<string>();
    for (const item of itemsA) {
      const key = getCanonicalKey(item);
      if (!seen.has(key)) {
        seen.add(key);
        rawResultSet.push(item);
      }
    }
  } else if (operation === 'union') {
    originalCount = itemsA.length + itemsB.length;
    const seen = new Set<string>();
    for (const item of [...itemsA, ...itemsB]) {
      const key = getCanonicalKey(item);
      if (!seen.has(key)) {
        seen.add(key);
        rawResultSet.push(item);
      }
    }
  } else if (operation === 'intersection') {
    const setB = new Set(itemsB.map(getCanonicalKey));
    const seenA = new Set<string>();
    for (const item of itemsA) {
      const key = getCanonicalKey(item);
      if (setB.has(key) && !seenA.has(key)) {
        seenA.add(key);
        rawResultSet.push(item);
      }
    }
  } else if (operation === 'difference') {
    const setB = new Set(itemsB.map(getCanonicalKey));
    const seenA = new Set<string>();
    for (const item of itemsA) {
      const key = getCanonicalKey(item);
      if (!setB.has(key) && !seenA.has(key)) {
        seenA.add(key);
        rawResultSet.push(item);
      }
    }
  }

  // Sorting
  if (sortOrder === 'asc') {
    rawResultSet.sort((a, b) => a.localeCompare(b, undefined, { sensitivity: caseSensitive ? 'variant' : 'base' }));
  } else if (sortOrder === 'desc') {
    rawResultSet.sort((a, b) => b.localeCompare(a, undefined, { sensitivity: caseSensitive ? 'variant' : 'base' }));
  } else if (sortOrder === 'numeric') {
    rawResultSet.sort((a, b) => {
      const numA = parseFloat(a);
      const numB = parseFloat(b);
      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
      return a.localeCompare(b);
    });
  }

  const duplicatesRemoved = Math.max(0, originalCount - rawResultSet.length);

  return {
    isValid: true,
    resultList: rawResultSet,
    resultText: rawResultSet.join('\n'),
    originalCount,
    uniqueCount: rawResultSet.length,
    duplicatesRemoved,
  };
}
