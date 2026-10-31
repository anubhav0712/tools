import { describe, it, expect } from 'vitest';
import { executeQrCodeTool } from './engine';

describe('QR Code Tool Engine', () => {
  it('generates valid SVG markup for text payload', () => {
    const result = executeQrCodeTool({
      payloadType: 'text',
      content: 'https://example.com',
      foregroundHex: '#000000',
      backgroundHex: '#FFFFFF',
    });

    expect(result.isValid).toBe(true);
    expect(result.svgMarkup).toContain('<svg');
    expect(result.svgMarkup).toContain('viewBox');
    expect(result.matrixSize).toBeGreaterThanOrEqual(21);
  });

  it('generates QR code for Wi-Fi credentials', () => {
    const wifiPayload = 'WIFI:S:MyHomeWifi;T:WPA;P:SuperSecret123;;';
    const result = executeQrCodeTool({
      payloadType: 'wifi',
      content: wifiPayload,
    });

    expect(result.isValid).toBe(true);
    expect(result.payloadString).toBe(wifiPayload);
    expect(result.svgMarkup).toContain('<path');
  });

  it('applies custom foreground and background colors', () => {
    const result = executeQrCodeTool({
      payloadType: 'text',
      content: 'Hello World',
      foregroundHex: '#4F46E5',
      backgroundHex: '#F8FAFC',
    });

    expect(result.isValid).toBe(true);
    expect(result.svgMarkup).toContain('fill="#F8FAFC"');
    expect(result.svgMarkup).toContain('fill="#4F46E5"');
  });

  it('handles payloads that exceed capacity gracefully with error', () => {
    const hugePayload = 'A'.repeat(500);
    const result = executeQrCodeTool({ payloadType: 'text', content: hugePayload });
    expect(result.isValid).toBe(false);
    expect(result.error).toContain('exceeds maximum supported capacity');
  });

  it('handles empty content gracefully', () => {
    const result = executeQrCodeTool({ payloadType: 'text', content: '' });
    expect(result.isValid).toBe(true);
    expect(result.svgMarkup).toBe('');
    expect(result.matrixSize).toBe(0);
  });
});
