import { describe, it, expect } from 'vitest';
import { registry } from './registry';
import '../tools'; // Ensures all tools are registered

describe('Regulatory & Business Logic Compliance Audit', () => {
  it('registers all 34 tools', () => {
    const allTools = registry.getAll();
    expect(allTools.length).toBe(34);
  });

  it('guarantees every registered tool defines a valid reviewPolicy', () => {
    const allTools = registry.getAll();

    for (const tool of allTools) {
      const policy = tool.metadata.reviewPolicy;
      expect(policy, `Tool "${tool.metadata.id}" missing reviewPolicy`).toBeDefined();
      expect(policy?.governingBodyOrStandard).toBeTruthy();
      expect(policy?.lastReviewedDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(['high', 'medium', 'low', 'none']).toContain(policy?.changeRisk);

      if (policy?.cadence !== 'immutable') {
        expect(
          policy?.nextReviewDate,
          `Tool "${tool.metadata.id}" requires nextReviewDate because cadence is ${policy?.cadence}`
        ).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        expect(
          policy?.reviewTrigger,
          `Tool "${tool.metadata.id}" requires reviewTrigger`
        ).toBeTruthy();
      }
    }
  });

  it('correctly classifies immutable vs periodically reviewed tools', () => {
    const immutable = registry.getImmutableTools();
    const periodic = registry.getToolsRequiringPeriodicReview();

    // Sum must equal total registered tools
    expect(immutable.length + periodic.length).toBe(34);

    // Key regulatory tools must require periodic review
    const periodicIds = periodic.map((t) => t.metadata.id);
    expect(periodicIds).toContain('salary-tax-calculator');
    expect(periodicIds).toContain('fd-calculator');
    expect(periodicIds).toContain('retirement-calculator');
    expect(periodicIds).toContain('inflation-calculator');
    expect(periodicIds).toContain('debt-payoff-calculator');
    expect(periodicIds).toContain('color-contrast-checker');
    expect(periodicIds).toContain('svg-sanitizer');
    expect(periodicIds).toContain('jwt-inspector');
    expect(periodicIds).toContain('passphrase-generator');
    expect(periodicIds).toContain('exif-scrubber');
    expect(periodicIds).toContain('markdown-preview');

    // Key algorithmic tools must be classified as immutable
    const immutableIds = immutable.map((t) => t.metadata.id);
    expect(immutableIds).toContain('diff-checker');
    expect(immutableIds).toContain('hash-generator');
    expect(immutableIds).toContain('base64-converter');
    expect(immutableIds).toContain('case-converter');
    expect(immutableIds).toContain('list-deduplicator');
    expect(immutableIds).toContain('cron-parser');
    expect(immutableIds).toContain('csv-json-converter');
    expect(immutableIds).toContain('qr-code-tool');
    expect(immutableIds).toContain('pdf-manipulator');
    expect(immutableIds).toContain('image-compressor');
    expect(immutableIds).toContain('loan-calculator');
    expect(immutableIds).toContain('sip-calculator');
    expect(immutableIds).toContain('compound-interest-calculator');
  });

  it('generates an accurate review schedule summary', () => {
    const summary = registry.getReviewScheduleSummary('2026-11-03');
    expect(summary.total).toBe(34);
    expect(summary.unassignedCount).toBe(0);
    expect(summary.periodicReviewCount).toBe(13);
    expect(summary.immutableCount).toBe(21);
    expect(summary.highRiskCount).toBeGreaterThanOrEqual(2); // salary-tax-calculator, svg-sanitizer
  });

  it('correctly calculates upcoming reviews', () => {
    // Check upcoming reviews within 180 days from 2026-11-03
    const upcoming = registry.getUpcomingReviews(180, '2026-11-03');
    expect(upcoming.length).toBeGreaterThan(0);
    for (const item of upcoming) {
      expect(item.daysRemaining).toBeGreaterThanOrEqual(0);
      expect(item.daysRemaining).toBeLessThanOrEqual(180);
    }
  });
});
