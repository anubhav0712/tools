import type { SqlFormatterInput, SqlFormatterOutput } from './definition';

const MAJOR_KEYWORDS = [
  'SELECT', 'FROM', 'WHERE', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN',
  'FULL JOIN', 'CROSS JOIN', 'JOIN', 'GROUP BY', 'ORDER BY', 'HAVING', 'LIMIT',
  'OFFSET', 'UNION ALL', 'UNION', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET',
  'DELETE FROM', 'DELETE', 'CREATE TABLE', 'ALTER TABLE', 'DROP TABLE',
];

const ALL_KEYWORDS = [
  ...MAJOR_KEYWORDS,
  'AND', 'OR', 'AS', 'ON', 'IN', 'NOT IN', 'EXISTS', 'NOT EXISTS', 'BETWEEN',
  'LIKE', 'ILIKE', 'IS NULL', 'IS NOT NULL', 'DISTINCT', 'CASE', 'WHEN',
  'THEN', 'ELSE', 'END', 'ASC', 'DESC', 'NULLS FIRST', 'NULLS LAST',
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'COALESCE', 'NOW',
];

export function executeSqlFormatter(input: SqlFormatterInput): SqlFormatterOutput {
  const rawSql = (input?.sql || '').trim();
  const mode = input?.mode || 'beautify';
  const uppercase = input?.uppercaseKeywords !== false;
  const indentSize = input?.indentSpaces ?? 2;
  const indentUnit = ' '.repeat(indentSize);

  if (!rawSql) {
    return {
      isValid: true,
      formattedSql: '',
      statementCount: 0,
      byteSize: 0,
    };
  }

  try {
    // 1. Minify mode
    if (mode === 'minify') {
      // Strip comments
      let clean = rawSql
        .replace(/\/\*[\s\S]*?\*\//g, '') // Multiline comments
        .replace(/--.*$/gm, '')           // Single line comments
        .replace(/\s+/g, ' ')             // Collapse whitespace
        .trim();

      // Uppercase keywords if enabled
      if (uppercase) {
        ALL_KEYWORDS.forEach((kw) => {
          const regex = new RegExp(`\\b${kw}\\b`, 'gi');
          clean = clean.replace(regex, kw);
        });
      }

      const stmtCount = (clean.match(/;/g) || []).length || 1;

      return {
        isValid: true,
        formattedSql: clean,
        statementCount: stmtCount,
        byteSize: new TextEncoder().encode(clean).length,
      };
    }

    // 2. Beautify mode
    // Tokenize strings, comments, words, parentheses
    const tokens: Array<{ type: 'word' | 'string' | 'punct' | 'comment'; val: string }> = [];
    let i = 0;
    while (i < rawSql.length) {
      const char = rawSql[i];
      const nextChar = rawSql[i + 1];

      // String literal '...'
      if (char === "'") {
        let strVal = "'";
        i++;
        while (i < rawSql.length) {
          strVal += rawSql[i];
          if (rawSql[i] === "'" && rawSql[i + 1] === "'") {
            strVal += rawSql[i + 1];
            i += 2;
            continue;
          }
          if (rawSql[i] === "'") {
            i++;
            break;
          }
          i++;
        }
        tokens.push({ type: 'string', val: strVal });
        continue;
      }

      // Identifier literal "..."
      if (char === '"') {
        let strVal = '"';
        i++;
        while (i < rawSql.length && rawSql[i] !== '"') {
          strVal += rawSql[i];
          i++;
        }
        if (i < rawSql.length) {
          strVal += '"';
          i++;
        }
        tokens.push({ type: 'string', val: strVal });
        continue;
      }

      // Single line comment -- ...
      if (char === '-' && nextChar === '-') {
        let comment = '';
        while (i < rawSql.length && rawSql[i] !== '\n') {
          comment += rawSql[i];
          i++;
        }
        tokens.push({ type: 'comment', val: comment });
        continue;
      }

      // Multiline comment /* ... */
      if (char === '/' && nextChar === '*') {
        let comment = '/*';
        i += 2;
        while (i < rawSql.length && !(rawSql[i] === '*' && rawSql[i + 1] === '/')) {
          comment += rawSql[i];
          i++;
        }
        if (i < rawSql.length) {
          comment += '*/';
          i += 2;
        }
        tokens.push({ type: 'comment', val: comment });
        continue;
      }

      // Whitespace
      if (/\s/.test(char)) {
        i++;
        continue;
      }

      // Punctuation
      if (/[(),;]/.test(char)) {
        tokens.push({ type: 'punct', val: char });
        i++;
        continue;
      }

      // Word / identifier / operator
      let word = '';
      while (i < rawSql.length && !/[\s(),;'"/]/.test(rawSql[i])) {
        word += rawSql[i];
        i++;
      }
      tokens.push({ type: 'word', val: word });
    }

    // Combine two-word keywords (e.g. "LEFT", "JOIN" -> "LEFT JOIN", "GROUP", "BY" -> "GROUP BY")
    const combinedTokens: Array<{ type: string; val: string }> = [];
    for (let k = 0; k < tokens.length; k++) {
      const cur = tokens[k];
      const next = tokens[k + 1];
      if (cur.type === 'word' && next && next.type === 'word') {
        const candidate = `${cur.val.toUpperCase()} ${next.val.toUpperCase()}`;
        if (
          MAJOR_KEYWORDS.includes(candidate) ||
          candidate === 'UNION ALL' ||
          candidate === 'NOT IN' ||
          candidate === 'IS NULL' ||
          candidate === 'IS NOT NULL'
        ) {
          combinedTokens.push({ type: 'word', val: candidate });
          k++;
          continue;
        }
      }
      combinedTokens.push(cur);
    }

    // Assemble formatted lines
    const lines: string[] = [];
    let currentLine = '';
    let indentLevel = 0;

    for (let k = 0; k < combinedTokens.length; k++) {
      const tok = combinedTokens[k];
      let val = tok.val;

      if (tok.type === 'word') {
        const upper = val.toUpperCase();
        if (ALL_KEYWORDS.includes(upper) || MAJOR_KEYWORDS.includes(upper)) {
          if (uppercase) val = upper;
        }

        if (MAJOR_KEYWORDS.includes(val.toUpperCase())) {
          if (currentLine.trim()) {
            lines.push(currentLine);
            currentLine = '';
          }
          currentLine = indentUnit.repeat(indentLevel) + val;
          continue;
        }

        if (val.toUpperCase() === 'AND' || val.toUpperCase() === 'OR') {
          if (currentLine.trim()) {
            lines.push(currentLine);
            currentLine = '';
          }
          currentLine = indentUnit.repeat(indentLevel + 1) + (uppercase ? val.toUpperCase() : val);
          continue;
        }
      }

      if (tok.type === 'punct') {
        if (val === '(') {
          indentLevel++;
          currentLine += ' (';
          continue;
        }
        if (val === ')') {
          indentLevel = Math.max(0, indentLevel - 1);
          currentLine += ')';
          continue;
        }
        if (val === ';') {
          currentLine += ';';
          lines.push(currentLine);
          currentLine = '';
          continue;
        }
        if (val === ',') {
          currentLine += ', ';
          continue;
        }
      }

      if (currentLine && !currentLine.endsWith(' ') && !currentLine.endsWith('(')) {
        currentLine += ' ';
      }
      currentLine += val;
    }

    if (currentLine.trim()) {
      lines.push(currentLine);
    }

    const formattedSql = lines.join('\n');
    const statementCount = (formattedSql.match(/;/g) || []).length || 1;

    return {
      isValid: true,
      formattedSql,
      statementCount,
      byteSize: new TextEncoder().encode(formattedSql).length,
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: err?.message || 'Failed to format SQL',
      formattedSql: rawSql,
      statementCount: 1,
      byteSize: new TextEncoder().encode(rawSql).length,
    };
  }
}
