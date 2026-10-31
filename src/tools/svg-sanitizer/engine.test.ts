import { describe, it, expect } from 'vitest';
import { executeSvgSanitizer } from './engine';

describe('SVG Sanitizer Engine', () => {
  it('strips <script> tags and onload handlers', () => {
    const raw =
      '<svg xmlns="http://www.w3.org/2000/svg" onload="alert(1)"><circle cx="50" cy="50" r="40"/><script>alert("XSS")</script></svg>';
    const result = executeSvgSanitizer({ rawSvg: raw });

    expect(result.isValid).toBe(true);
    expect(result.sanitizedSvg).not.toContain('<script');
    expect(result.sanitizedSvg).not.toContain('onload');
    expect(result.sanitizedSvg).toContain('<circle');
    expect(result.removedElementsCount).toBeGreaterThanOrEqual(2);
  });

  it('removes XML declarations, comments, and metadata', () => {
    const raw = `<?xml version="1.0" encoding="utf-8"?>
<!-- Created by Illustrator -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
<metadata><author>DesignTeam</author></metadata>
<rect width="10" height="10"/>
</svg>`;
    const result = executeSvgSanitizer({ rawSvg: raw });

    expect(result.isValid).toBe(true);
    expect(result.sanitizedSvg).not.toContain('<?xml');
    expect(result.sanitizedSvg).not.toContain('<!--');
    expect(result.sanitizedSvg).not.toContain('<metadata>');
    expect(result.bytesSaved).toBeGreaterThan(0);
  });

  it('strips width and height when stripDimensions is enabled', () => {
    const raw =
      '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="300" viewBox="0 0 500 300"><path d="M0 0"/></svg>';
    const result = executeSvgSanitizer({ rawSvg: raw, stripDimensions: true });

    expect(result.isValid).toBe(true);
    expect(result.sanitizedSvg).not.toContain('width="500"');
    expect(result.sanitizedSvg).not.toContain('height="300"');
    expect(result.sanitizedSvg).toContain('viewBox="0 0 500 300"');
  });

  it('neutralizes javascript: URIs in links', () => {
    const raw =
      '<svg xmlns="http://www.w3.org/2000/svg"><a href="javascript:alert(1)"><text>Click</text></a></svg>';
    const result = executeSvgSanitizer({ rawSvg: raw });

    expect(result.isValid).toBe(true);
    expect(result.sanitizedSvg).not.toContain('javascript:alert(1)');
  });

  it('strips unquoted event handlers and unquoted javascript URIs', () => {
    const raw =
      '<svg xmlns="http://www.w3.org/2000/svg"><circle onclick=alert(1) /><a href=javascript:alert(2)>Click</a></svg>';
    const result = executeSvgSanitizer({ rawSvg: raw });

    expect(result.isValid).toBe(true);
    expect(result.sanitizedSvg).not.toContain('onclick');
    expect(result.sanitizedSvg).not.toContain('javascript');
  });

  it('rejects non-SVG content gracefully', () => {
    const raw = '<div>Not an svg file</div>';
    const result = executeSvgSanitizer({ rawSvg: raw });

    expect(result.isValid).toBe(false);
    expect(result.error).toContain('Root <svg> element not found');
  });
});
