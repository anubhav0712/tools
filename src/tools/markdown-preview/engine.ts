import type {
  MarkdownPreviewInput,
  MarkdownPreviewOutput,
  TocItem,
} from './definition';

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-');
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function executeMarkdownPreview(
  input: MarkdownPreviewInput
): MarkdownPreviewOutput {
  const raw = input?.markdown || '';

  if (!raw.trim()) {
    return {
      isValid: true,
      html: '',
      tableOfContents: [],
      wordCount: 0,
      characterCount: 0,
      readingTimeMinutes: 0,
    };
  }

  const toc: TocItem[] = [];
  const lines = raw.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
  const htmlLines: string[] = [];

  let inCodeBlock = false;
  let codeBlockLang = '';
  let codeBuffer: string[] = [];

  let inTable = false;
  let tableBuffer: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Fenced Code Block ```
    if (line.trim().startsWith('```')) {
      if (!inCodeBlock) {
        inCodeBlock = true;
        codeBlockLang = line.trim().slice(3).trim();
        codeBuffer = [];
      } else {
        inCodeBlock = false;
        const escapedCode = escapeHtml(codeBuffer.join('\n'));
        htmlLines.push(
          `<pre class="bg-slate-900 text-slate-100 p-4 rounded-xl overflow-x-auto text-xs font-mono my-3"><code class="language-${codeBlockLang}">${escapedCode}</code></pre>`
        );
        codeBuffer = [];
      }
      continue;
    }

    if (inCodeBlock) {
      codeBuffer.push(line);
      continue;
    }

    // Markdown Table Detection
    if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
      if (!inTable) {
        inTable = true;
        tableBuffer = [];
      }
      tableBuffer.push(line.trim());
      continue;
    } else if (inTable) {
      // Process table buffer
      inTable = false;
      if (tableBuffer.length >= 2) {
        const rows = tableBuffer
          .filter((l) => !/^\|[\s\-:|]+\|$/.test(l))
          .map((l) =>
            l
              .slice(1, -1)
              .split('|')
              .map((c) => c.trim())
          );

        if (rows.length > 0) {
          const headerRow = rows[0];
          const dataRows = rows.slice(1);

          let tableHtml = '<div class="overflow-x-auto my-3"><table class="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">';
          tableHtml += '<thead class="bg-slate-50 border-b border-slate-200"><tr>';
          headerRow.forEach((h) => {
            tableHtml += `<th class="py-2 px-3 font-semibold text-slate-700">${escapeHtml(h)}</th>`;
          });
          tableHtml += '</tr></thead><tbody class="divide-y divide-slate-100">';
          dataRows.forEach((r) => {
            tableHtml += '<tr class="hover:bg-slate-50/50">';
            headerRow.forEach((_, cIdx) => {
              tableHtml += `<td class="py-2 px-3 text-slate-700">${escapeHtml(r[cIdx] || '')}</td>`;
            });
            tableHtml += '</tr>';
          });
          tableHtml += '</tbody></table></div>';
          htmlLines.push(tableHtml);
        }
      }
      tableBuffer = [];
    }

    // Headers #, ##, ###
    const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headerMatch) {
      const level = headerMatch[1].length;
      const text = headerMatch[2].trim();
      const id = slugify(text);
      toc.push({ level, text, id });

      const headingClasses = [
        'text-2xl font-extrabold text-slate-900 mt-6 mb-3 border-b border-slate-200 pb-2',
        'text-xl font-bold text-slate-900 mt-5 mb-2.5',
        'text-lg font-bold text-slate-900 mt-4 mb-2',
        'text-base font-semibold text-slate-800 mt-3 mb-1.5',
        'text-sm font-semibold text-slate-800 mt-2 mb-1',
        'text-xs font-semibold text-slate-700 mt-2 mb-1',
      ][level - 1];

      htmlLines.push(`<h${level} id="${id}" class="${headingClasses}">${escapeHtml(text)}</h${level}>`);
      continue;
    }

    // Blockquote >
    if (line.startsWith('>')) {
      const quoteText = line.replace(/^>\s*/, '');
      htmlLines.push(
        `<blockquote class="border-l-4 border-indigo-500 bg-indigo-50/50 py-2 px-3 rounded-r-xl text-slate-700 my-2 italic text-xs leading-relaxed">${escapeHtml(quoteText)}</blockquote>`
      );
      continue;
    }

    // Unordered lists - or *
    if (/^[\*\-]\s+(.+)$/.test(line)) {
      const itemText = line.replace(/^[\*\-]\s+/, '');
      htmlLines.push(`<li class="ml-4 list-disc text-xs text-slate-700 my-0.5">${formatInlineMarkdown(itemText)}</li>`);
      continue;
    }

    // Ordered lists 1.
    if (/^\d+\.\s+(.+)$/.test(line)) {
      const itemText = line.replace(/^\d+\.\s+/, '');
      htmlLines.push(`<li class="ml-4 list-decimal text-xs text-slate-700 my-0.5">${formatInlineMarkdown(itemText)}</li>`);
      continue;
    }

    // Empty lines
    if (!line.trim()) {
      htmlLines.push('<div class="h-2"></div>');
      continue;
    }

    // Regular paragraphs
    htmlLines.push(`<p class="text-xs text-slate-700 leading-relaxed my-1">${formatInlineMarkdown(line)}</p>`);
  }

  // Flush trailing table buffer if table is at end of input
  if (inTable && tableBuffer.length >= 2) {
    const rows = tableBuffer
      .filter((l) => !/^\|[\s\-:|]+\|$/.test(l))
      .map((l) =>
        l
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim())
      );

    if (rows.length > 0) {
      const headerRow = rows[0];
      const dataRows = rows.slice(1);

      let tableHtml = '<div class="overflow-x-auto my-3"><table class="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">';
      tableHtml += '<thead class="bg-slate-50 border-b border-slate-200"><tr>';
      headerRow.forEach((h) => {
        tableHtml += `<th class="py-2 px-3 font-semibold text-slate-700">${escapeHtml(h)}</th>`;
      });
      tableHtml += '</tr></thead><tbody class="divide-y divide-slate-100">';
      dataRows.forEach((r) => {
        tableHtml += '<tr class="hover:bg-slate-50/50">';
        headerRow.forEach((_, cIdx) => {
          tableHtml += `<td class="py-2 px-3 text-slate-700">${escapeHtml(r[cIdx] || '')}</td>`;
        });
        tableHtml += '</tr>';
      });
      tableHtml += '</tbody></table></div>';
      htmlLines.push(tableHtml);
    }
  }

  const words = raw.trim().split(/\s+/).filter(Boolean);
  const wordCount = words.length;
  const characterCount = raw.length;
  const readingTimeMinutes = wordCount === 0 ? 0 : Math.max(1, Math.ceil(wordCount / 200));

  return {
    isValid: true,
    html: htmlLines.join('\n'),
    tableOfContents: toc,
    wordCount,
    characterCount,
    readingTimeMinutes,
  };
}

function formatInlineMarkdown(str: string): string {
  let res = escapeHtml(str);

  // Bold **text**
  res = res.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-slate-900">$1</strong>');
  // Italic *text*
  res = res.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  // Inline code `code`
  res = res.replace(/`(.*?)`/g, '<code class="bg-slate-100 text-indigo-700 px-1 py-0.5 rounded font-mono text-[11px]">$1</code>');
  // Strikethrough ~~text~~
  res = res.replace(/~~(.*?)~~/g, '<del class="line-through text-slate-400">$1</del>');
  // Links [text](url) - sanitized
  res = res.replace(/\[(.*?)\]\((https?:\/\/.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-600 hover:underline font-medium">$1</a>');

  return res;
}
