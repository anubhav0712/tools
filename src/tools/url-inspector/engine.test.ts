import { describe, it, expect } from 'vitest';
import { executeUrlInspector } from './engine';

describe('URL Inspector Engine', () => {
  it('correctly deconstructs a full URL with query and UTM params', () => {
    const raw =
      'https://example.com:8080/path/to/page?utm_source=twitter&utm_campaign=launch&user_id=42#section-2';
    const result = executeUrlInspector({ rawUrl: raw });

    expect(result.isValid).toBe(true);
    expect(result.protocol).toBe('https:');
    expect(result.host).toBe('example.com:8080');
    expect(result.port).toBe('8080');
    expect(result.pathname).toBe('/path/to/page');
    expect(result.hash).toBe('#section-2');
    expect(result.queryParams.length).toBe(3);
    expect(result.utmTags.utm_source).toBe('twitter');
    expect(result.utmTags.utm_campaign).toBe('launch');
  });

  it('correctly decodes nested URL parameters', () => {
    const raw =
      'https://auth.company.io/callback?redirect_uri=https%3A%2F%2Fapp.company.io%2Fdashboard&code=auth_123';
    const result = executeUrlInspector({ rawUrl: raw });

    expect(result.isValid).toBe(true);
    const redirectParam = result.queryParams.find((p) => p.key === 'redirect_uri');
    expect(redirectParam?.rawValue).toBe('https%3A%2F%2Fapp.company.io%2Fdashboard');
    expect(redirectParam?.decodedValue).toBe('https://app.company.io/dashboard');
  });

  it('handles relative paths and query strings', () => {
    const raw = '/search?q=typescript&category=tools';
    const result = executeUrlInspector({ rawUrl: raw });

    expect(result.isValid).toBe(true);
    expect(result.queryParams.length).toBe(2);
    expect(result.queryParams[0].key).toBe('q');
    expect(result.queryParams[0].decodedValue).toBe('typescript');
  });

  it('handles empty input gracefully', () => {
    const result = executeUrlInspector({ rawUrl: '' });
    expect(result.isValid).toBe(true);
    expect(result.queryParams).toEqual([]);
  });
});
