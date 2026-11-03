import { describe, it, expect } from 'vitest';
import { registry } from '../core/registry';
import '../tools';
import { TOOL_SEO_DATA } from '../core/seo-data';

describe('Tool Page Layout & Tab Structure', () => {
  it('guarantees every registered tool has valid SEO data and FAQs for tabs', () => {
    const allTools = registry.getAll();
    expect(allTools.length).toBe(34);

    for (const tool of allTools) {
      const seo = TOOL_SEO_DATA[tool.metadata.id];
      expect(seo, `Tool ${tool.metadata.id} missing TOOL_SEO_DATA`).toBeDefined();

      // How to Use tab requirements
      expect(seo.howToUse.length, `Tool ${tool.metadata.id} must have how-to steps`).toBeGreaterThanOrEqual(3);

      // FAQ tab requirements
      expect(seo.faqs.length, `Tool ${tool.metadata.id} must have FAQs`).toBeGreaterThanOrEqual(2);
      for (const faq of seo.faqs) {
        expect(faq.question).toBeTruthy();
        expect(faq.answer).toBeTruthy();
      }

      // Related tools requirements
      expect(seo.relatedToolIds.length, `Tool ${tool.metadata.id} must have related tools`).toBeGreaterThanOrEqual(2);
      for (const relId of seo.relatedToolIds) {
        expect(registry.get(relId), `Related tool "${relId}" for "${tool.metadata.id}" must exist in registry`).toBeDefined();
      }
    }
  });

  it('verifies tab labeling conventions based on tool category', () => {
    const financeTool = registry.get('salary-tax-calculator');
    expect(financeTool?.metadata.category).toBe('finance');

    const cryptoTool = registry.get('jwt-inspector');
    expect(cryptoTool?.metadata.category).toBe('crypto');

    const converterTool = registry.get('csv-json-converter');
    expect(converterTool?.metadata.category).toBe('converter');

    const textTool = registry.get('case-converter');
    expect(textTool?.metadata.category).toBe('text');
  });
});
