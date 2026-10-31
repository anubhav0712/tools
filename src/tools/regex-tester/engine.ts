import type {
  RegexTesterInput,
  RegexTesterOutput,
  RegexMatchItem,
  RegexMatchGroup,
} from './definition';

export function executeRegexTester(input: RegexTesterInput): RegexTesterOutput {
  const pattern = input?.pattern ?? '';
  let flags = input?.flags ?? 'g';
  const testText = input?.testText ?? '';

  if (!pattern) {
    return {
      isValid: true,
      matches: [],
      matchCount: 0,
      highlightedSegments: testText ? [{ text: testText, isMatch: false }] : [],
    };
  }

  // Sanitize flags: allow only g, i, m, s, u
  flags = flags.replace(/[^gimsu]/g, '');

  let regex: RegExp;
  try {
    regex = new RegExp(pattern, flags);
  } catch (err: any) {
    return {
      isValid: false,
      error: err?.message || 'Invalid Regular Expression syntax',
      matches: [],
      matchCount: 0,
      highlightedSegments: testText ? [{ text: testText, isMatch: false }] : [],
    };
  }

  const matches: RegexMatchItem[] = [];
  const maxMatches = 1000;

  try {
    if (flags.includes('g')) {
      let match: RegExpExecArray | null;
      let matchCount = 0;

      while ((match = regex.exec(testText)) !== null && matchCount < maxMatches) {
        matchCount++;
        const groups: RegexMatchGroup[] = [];

        // Check numbered groups
        for (let g = 1; g < match.length; g++) {
          groups.push({
            index: g,
            value: match[g] ?? '',
          });
        }

        // Check named groups
        if (match.groups) {
          for (const [key, val] of Object.entries(match.groups)) {
            const existing = groups.find((grp) => grp.value === val);
            if (existing) {
              existing.name = key;
            } else {
              groups.push({
                name: key,
                index: groups.length + 1,
                value: val ?? '',
              });
            }
          }
        }

        matches.push({
          match: match[0],
          index: match.index,
          groups,
        });

        // Prevent infinite loop on zero-width match (e.g. pattern "")
        if (match.index === regex.lastIndex) {
          regex.lastIndex++;
        }
      }
    } else {
      const match = regex.exec(testText);
      if (match) {
        const groups: RegexMatchGroup[] = [];
        for (let g = 1; g < match.length; g++) {
          groups.push({ index: g, value: match[g] ?? '' });
        }
        if (match.groups) {
          for (const [key, val] of Object.entries(match.groups)) {
            const existing = groups.find((grp) => grp.value === val);
            if (existing) existing.name = key;
            else groups.push({ name: key, index: groups.length + 1, value: val ?? '' });
          }
        }
        matches.push({
          match: match[0],
          index: match.index,
          groups,
        });
      }
    }
  } catch (err: any) {
    return {
      isValid: false,
      error: `Execution error: ${err?.message || 'Regex execution failed'}`,
      matches: [],
      matchCount: 0,
      highlightedSegments: testText ? [{ text: testText, isMatch: false }] : [],
    };
  }

  // Build highlightedSegments
  const highlightedSegments: Array<{ text: string; isMatch: boolean; matchIndex?: number }> = [];
  let cursor = 0;

  for (let m = 0; m < matches.length; m++) {
    const match = matches[m];
    if (match.index > cursor) {
      highlightedSegments.push({
        text: testText.slice(cursor, match.index),
        isMatch: false,
      });
    }

    if (match.match.length > 0) {
      highlightedSegments.push({
        text: match.match,
        isMatch: true,
        matchIndex: m + 1,
      });
      cursor = match.index + match.match.length;
    }
  }

  if (cursor < testText.length) {
    highlightedSegments.push({
      text: testText.slice(cursor),
      isMatch: false,
    });
  }

  return {
    isValid: true,
    matches,
    matchCount: matches.length,
    highlightedSegments,
  };
}
