import type {
  CsvJsonConverterInput,
  CsvJsonConverterOutput,
} from './definition';

/**
 * Robust RFC 4180 compliant CSV line tokenizer
 */
function parseCsvRows(text: string, delimiter: string = ','): string[][] {
  const clean = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = '';
  let insideQuotes = false;

  for (let i = 0; i < clean.length; i++) {
    const char = clean[i];
    const nextChar = clean[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentField += '"';
        i++; // skip next quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentField);
      currentField = '';
    } else if (char === '\n' && !insideQuotes) {
      currentRow.push(currentField);
      rows.push(currentRow);
      currentRow = [];
      currentField = '';
    } else {
      currentField += char;
    }
  }

  if (currentField !== '' || currentRow.length > 0) {
    currentRow.push(currentField);
    rows.push(currentRow);
  }

  // Filter out completely blank trailing rows
  return rows.filter((r) => r.length > 1 || (r.length === 1 && r[0].trim() !== ''));
}

function escapeCsvField(val: string, delimiter: string = ','): string {
  if (val.includes('"') || val.includes(delimiter) || val.includes('\n')) {
    return `"${val.replace(/"/g, '""')}"`;
  }
  return val;
}

function simpleHash(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 'anon_' + Math.abs(hash).toString(16);
}

export function executeCsvJsonConverter(
  input: CsvJsonConverterInput
): CsvJsonConverterOutput {
  const direction = input.direction || 'csv_to_json';
  const data = (input.data || '').trim();
  const delimiter = input.delimiter || ',';
  const hasHeader = input.hasHeader !== false;
  const indent = input.indent ?? 2;
  const anonymizeCols = (input.anonymizeColumns || []).map((c) => c.trim().toLowerCase());
  const anonymizeMode = input.anonymizeMode || 'mask';

  if (!data) {
    return {
      isValid: true,
      converted: '',
      rowCount: 0,
      columnCount: 0,
      headers: [],
    };
  }

  try {
    if (direction === 'csv_to_json') {
      const rows = parseCsvRows(data, delimiter);
      if (rows.length === 0) {
        return { isValid: true, converted: '[]', rowCount: 0, columnCount: 0, headers: [] };
      }

      let headers: string[] = [];
      let dataRows: string[][] = [];

      if (hasHeader) {
        headers = rows[0].map((h) => h.trim());
        dataRows = rows.slice(1);
      } else {
        headers = rows[0].map((_, idx) => `col_${idx + 1}`);
        dataRows = rows;
      }

      const jsonRecords = dataRows.map((row) => {
        const obj: Record<string, unknown> = {};
        headers.forEach((h, idx) => {
          let val = row[idx] ?? '';
          if (anonymizeCols.includes(h.toLowerCase()) && val !== '') {
            val = anonymizeMode === 'mask' ? '[REDACTED]' : simpleHash(val);
          } else {
            // Auto parse numbers and booleans
            if (val === 'true') {
              (val as any) = true;
            } else if (val === 'false') {
              (val as any) = false;
            } else {
              const trimmed = val.trim();
              const isLeadingZero =
                (trimmed.length > 1 && trimmed.startsWith('0') && !trimmed.startsWith('0.')) ||
                (trimmed.length > 2 && (trimmed.startsWith('+0') || trimmed.startsWith('-0')) && !trimmed.startsWith('+0.') && !trimmed.startsWith('-0.'));

              if (!isNaN(Number(val)) && trimmed !== '' && !isLeadingZero) {
                (val as any) = Number(val);
              }
            }
          }
          obj[h] = val;
        });
        return obj;
      });

      return {
        isValid: true,
        converted: JSON.stringify(jsonRecords, null, indent),
        rowCount: jsonRecords.length,
        columnCount: headers.length,
        headers,
      };
    }

    if (direction === 'json_to_csv') {
      const parsed = JSON.parse(data);
      if (!Array.isArray(parsed) || parsed.length === 0) {
        throw new Error('Input must be a non-empty JSON array of objects.');
      }

      const headers = Array.from(
        new Set(parsed.flatMap((item) => (typeof item === 'object' && item !== null ? Object.keys(item) : [])))
      );

      const csvLines: string[] = [];
      if (hasHeader) {
        csvLines.push(headers.map((h) => escapeCsvField(h, delimiter)).join(delimiter));
      }

      parsed.forEach((item) => {
        const row = headers.map((h) => {
          let val = item?.[h];
          if (val === undefined || val === null) return '';
          let strVal = typeof val === 'object' ? JSON.stringify(val) : String(val);
          if (anonymizeCols.includes(h.toLowerCase()) && strVal !== '') {
            strVal = anonymizeMode === 'mask' ? '[REDACTED]' : simpleHash(strVal);
          }
          return escapeCsvField(strVal, delimiter);
        });
        csvLines.push(row.join(delimiter));
      });

      return {
        isValid: true,
        converted: csvLines.join('\n'),
        rowCount: parsed.length,
        columnCount: headers.length,
        headers,
      };
    }

    if (direction === 'csv_to_markdown') {
      const rows = parseCsvRows(data, delimiter);
      if (rows.length === 0) {
        return { isValid: true, converted: '', rowCount: 0, columnCount: 0, headers: [] };
      }

      const headers = hasHeader
        ? rows[0].map((h) => h.trim())
        : rows[0].map((_, idx) => `Column ${idx + 1}`);

      const dataRows = hasHeader ? rows.slice(1) : rows;

      const headerLine = `| ${headers.join(' | ')} |`;
      const separatorLine = `| ${headers.map(() => '---').join(' | ')} |`;
      const bodyLines = dataRows.map(
        (row) =>
          `| ${headers
            .map((h, idx) => {
              let val = (row[idx] ?? '').trim();
              if (anonymizeCols.includes(h.toLowerCase()) && val !== '') {
                val = anonymizeMode === 'mask' ? '[REDACTED]' : simpleHash(val);
              }
              return val;
            })
            .join(' | ')} |`
      );

      const markdown = [headerLine, separatorLine, ...bodyLines].join('\n');

      return {
        isValid: true,
        converted: markdown,
        rowCount: dataRows.length,
        columnCount: headers.length,
        headers,
      };
    }

    if (direction === 'markdown_to_csv') {
      const lines = data
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => l.startsWith('|') && l.endsWith('|'));

      if (lines.length < 2) {
        throw new Error('Invalid Markdown table. Needs header row and separator.');
      }

      // Filter out separator line | --- | --- |
      const contentLines = lines.filter((l) => !/^\|[\s\-:|]+\|$/.test(l));

      const rows = contentLines.map((l) =>
        l
          .slice(1, -1)
          .split('|')
          .map((cell) => cell.trim())
      );

      const headers = rows[0];
      const csvLines = rows.map((r) =>
        r.map((cell) => escapeCsvField(cell, delimiter)).join(delimiter)
      );

      return {
        isValid: true,
        converted: csvLines.join('\n'),
        rowCount: rows.length - 1,
        columnCount: headers.length,
        headers,
      };
    }

    throw new Error(`Unsupported conversion direction: ${direction}`);
  } catch (err: any) {
    return {
      isValid: false,
      error: err?.message || 'Failed to parse and convert data',
      converted: '',
      rowCount: 0,
      columnCount: 0,
      headers: [],
    };
  }
}
