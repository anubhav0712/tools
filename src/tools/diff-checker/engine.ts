import type {
  DiffCheckerInput,
  DiffCheckerOutput,
  DiffLine,
  DiffChangeType,
  DiffCharacterChange,
} from './definition';

function normalizeNewlines(str: string): string {
  return (str || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Computes Longest Common Subsequence (LCS) matrix for an array of tokens
 */
function computeLcsMatrix<T>(
  a: T[],
  b: T[],
  equals: (x: T, y: T) => boolean
): number[][] {
  const m = a.length;
  const n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      if (equals(a[i], b[j])) {
        dp[i + 1][j + 1] = dp[i][j] + 1;
      } else {
        dp[i + 1][j + 1] = Math.max(dp[i + 1][j], dp[i][j + 1]);
      }
    }
  }

  return dp;
}

/**
 * Character-level diff for inline highlights on modified lines
 */
function diffCharacters(
  originalStr: string,
  modifiedStr: string
): { originalChars: DiffCharacterChange[]; modifiedChars: DiffCharacterChange[] } {
  const a = Array.from(originalStr);
  const b = Array.from(modifiedStr);
  const dp = computeLcsMatrix(a, b, (x, y) => x === y);

  let i = a.length;
  let j = b.length;
  const origList: DiffCharacterChange[] = [];
  const modList: DiffCharacterChange[] = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && a[i - 1] === b[j - 1]) {
      origList.unshift({ type: 'equal', text: a[i - 1] });
      modList.unshift({ type: 'equal', text: b[j - 1] });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      modList.unshift({ type: 'insert', text: b[j - 1] });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      origList.unshift({ type: 'delete', text: a[i - 1] });
      i--;
    }
  }

  return { originalChars: origList, modifiedChars: modList };
}

export function executeDiffChecker(input: DiffCheckerInput): DiffCheckerOutput {
  const originalRaw = normalizeNewlines(input.originalText ?? '');
  const modifiedRaw = normalizeNewlines(input.modifiedText ?? '');
  const ignoreWhitespace = Boolean(input.ignoreWhitespace);
  const ignoreCase = Boolean(input.ignoreCase);

  const origLines = originalRaw === '' ? [] : originalRaw.split('\n');
  const modLines = modifiedRaw === '' ? [] : modifiedRaw.split('\n');

  if (origLines.length === 0 && modLines.length === 0) {
    return {
      isValid: true,
      lines: [],
      additionsCount: 0,
      deletionsCount: 0,
      unchangedCount: 0,
      similarityPercentage: 100,
    };
  }

  const lineEquals = (x: string, y: string): boolean => {
    let a = x;
    let b = y;
    if (ignoreWhitespace) {
      a = a.trim();
      b = b.trim();
    }
    if (ignoreCase) {
      a = a.toLowerCase();
      b = b.toLowerCase();
    }
    return a === b;
  };

  const dp = computeLcsMatrix(origLines, modLines, lineEquals);

  let i = origLines.length;
  let j = modLines.length;
  const rawDiff: Array<{
    type: DiffChangeType;
    origIdx?: number;
    modIdx?: number;
    text: string;
  }> = [];

  while (i > 0 || j > 0) {
    if (i > 0 && j > 0 && lineEquals(origLines[i - 1], modLines[j - 1])) {
      rawDiff.unshift({
        type: 'equal',
        origIdx: i,
        modIdx: j,
        text: origLines[i - 1],
      });
      i--;
      j--;
    } else if (j > 0 && (i === 0 || dp[i][j - 1] >= dp[i - 1][j])) {
      rawDiff.unshift({
        type: 'insert',
        modIdx: j,
        text: modLines[j - 1],
      });
      j--;
    } else if (i > 0 && (j === 0 || dp[i][j - 1] < dp[i - 1][j])) {
      rawDiff.unshift({
        type: 'delete',
        origIdx: i,
        text: origLines[i - 1],
      });
      i--;
    }
  }

  let additions = 0;
  let deletions = 0;
  let unchanged = 0;

  const resultLines: DiffLine[] = [];

  for (let k = 0; k < rawDiff.length; k++) {
    const item = rawDiff[k];
    if (item.type === 'insert') {
      additions++;
      resultLines.push({
        type: 'insert',
        lineNumberModified: item.modIdx,
        content: item.text,
      });
    } else if (item.type === 'delete') {
      deletions++;
      // Check if next item is an insert to provide word-level character diff
      const nextItem = rawDiff[k + 1];
      if (nextItem && nextItem.type === 'insert') {
        const charDiff = diffCharacters(item.text, nextItem.text);
        resultLines.push({
          type: 'delete',
          lineNumberOriginal: item.origIdx,
          content: item.text,
          characterChanges: charDiff.originalChars,
        });
        resultLines.push({
          type: 'insert',
          lineNumberModified: nextItem.modIdx,
          content: nextItem.text,
          characterChanges: charDiff.modifiedChars,
        });
        additions++;
        k++; // skip next item since handled together
      } else {
        resultLines.push({
          type: 'delete',
          lineNumberOriginal: item.origIdx,
          content: item.text,
        });
      }
    } else {
      unchanged++;
      resultLines.push({
        type: 'equal',
        lineNumberOriginal: item.origIdx,
        lineNumberModified: item.modIdx,
        content: item.text,
      });
    }
  }

  const totalLines = origLines.length + modLines.length;
  const similarityPercentage =
    totalLines === 0
      ? 100
      : Math.round(((2 * unchanged) / totalLines) * 100);

  return {
    isValid: true,
    lines: resultLines,
    additionsCount: additions,
    deletionsCount: deletions,
    unchangedCount: unchanged,
    similarityPercentage: Math.min(100, Math.max(0, similarityPercentage)),
  };
}
