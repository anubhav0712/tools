import { describe, it, expect } from 'vitest';
import { executeMarkdownPreview } from './engine';

describe('Markdown Preview Engine', () => {
  it('correctly parses headers and extracts Table of Contents', () => {
    const md = '# Title\n\n## Subheader A\n\n### Detail 1';
    const result = executeMarkdownPreview({ markdown: md });

    expect(result.isValid).toBe(true);
    expect(result.tableOfContents.length).toBe(3);
    expect(result.tableOfContents[0].text).toBe('Title');
    expect(result.tableOfContents[0].level).toBe(1);
    expect(result.tableOfContents[1].text).toBe('Subheader A');
    expect(result.tableOfContents[1].level).toBe(2);
    expect(result.html).toContain('id="title"');
  });

  it('renders fenced code blocks and inline code safely', () => {
    const md = 'Here is `inline code` and a block:\n\n```javascript\nconsole.log("<script>alert(1)</script>");\n```';
    const result = executeMarkdownPreview({ markdown: md });

    expect(result.isValid).toBe(true);
    expect(result.html).toContain('inline code');
    // Ensure raw script tag is escaped
    expect(result.html).not.toContain('<script>alert(1)</script>');
    expect(result.html).toContain('&lt;script&gt;alert(1)&lt;/script&gt;');
  });

  it('calculates word count and reading time estimate', () => {
    const words = new Array(400).fill('word').join(' ');
    const result = executeMarkdownPreview({ markdown: words });

    expect(result.wordCount).toBe(400);
    expect(result.readingTimeMinutes).toBe(2);
  });

  it('renders markdown tables', () => {
    const md = '| Name | Age |\n| --- | --- |\n| Alice | 30 |\n| Bob | 25 |';
    const result = executeMarkdownPreview({ markdown: md });

    expect(result.isValid).toBe(true);
    expect(result.html).toContain('<table');
    expect(result.html).toContain('Alice');
    expect(result.html).toContain('Bob');
  });

  it('handles empty input gracefully', () => {
    const result = executeMarkdownPreview({ markdown: '' });
    expect(result.isValid).toBe(true);
    expect(result.html).toBe('');
    expect(result.wordCount).toBe(0);
    expect(result.readingTimeMinutes).toBe(0);
  });
});
