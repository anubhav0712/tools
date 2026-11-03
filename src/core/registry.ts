import type { ToolDefinition, ToolCategory } from './types';

class ToolRegistry {
  private tools = new Map<string, ToolDefinition>();

  public register(tool: ToolDefinition): void {
    if (this.tools.has(tool.metadata.id)) {
      console.warn(`Tool with id "${tool.metadata.id}" is already registered. Overwriting.`);
    }
    this.tools.set(tool.metadata.id, tool);
  }

  public get(id: string): ToolDefinition | undefined {
    return this.tools.get(id);
  }

  public getAll(): ToolDefinition[] {
    return Array.from(this.tools.values());
  }

  public getByCategory(category: ToolCategory): ToolDefinition[] {
    return this.getAll().filter((tool) => tool.metadata.category === category);
  }

  public search(query: string): ToolDefinition[] {
    const q = query.toLowerCase().trim();
    if (!q) return this.getAll();

    return this.getAll().filter((tool) => {
      const matchName = tool.metadata.name.toLowerCase().includes(q);
      const matchDesc = tool.metadata.description.toLowerCase().includes(q);
      const matchKeywords = tool.metadata.keywords.some((k) => k.toLowerCase().includes(q));
      const matchCategory = tool.metadata.category.toLowerCase().includes(q);
      return matchName || matchDesc || matchKeywords || matchCategory;
    });
  }

  /**
   * Returns all tools that require periodic human review due to changing laws,
   * annual government tax budgets, or evolving web/security standards.
   */
  public getToolsRequiringPeriodicReview(): ToolDefinition[] {
    return this.getAll().filter(
      (tool) => tool.metadata.reviewPolicy && tool.metadata.reviewPolicy.cadence !== 'immutable'
    );
  }

  /**
   * Returns all tools that are mathematically or algorithmically immutable
   * (e.g., standard RFCs, discrete math, hashing algorithms).
   */
  public getImmutableTools(): ToolDefinition[] {
    return this.getAll().filter(
      (tool) => tool.metadata.reviewPolicy?.cadence === 'immutable'
    );
  }

  /**
   * Returns tools with an upcoming scheduled review within the specified number of days.
   */
  public getUpcomingReviews(withinDays = 90, referenceDateStr?: string): Array<{ tool: ToolDefinition; daysRemaining: number }> {
    const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
    const results: Array<{ tool: ToolDefinition; daysRemaining: number }> = [];

    for (const tool of this.getToolsRequiringPeriodicReview()) {
      const nextDateStr = tool.metadata.reviewPolicy?.nextReviewDate;
      if (!nextDateStr) continue;

      const nextDate = new Date(nextDateStr);
      const diffTime = nextDate.getTime() - refDate.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays >= 0 && diffDays <= withinDays) {
        results.push({ tool, daysRemaining: diffDays });
      }
    }

    return results.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }

  /**
   * Returns tools whose review date has passed relative to the reference date.
   */
  public getOverdueReviews(referenceDateStr?: string): Array<{ tool: ToolDefinition; daysOverdue: number }> {
    const refDate = referenceDateStr ? new Date(referenceDateStr) : new Date();
    const results: Array<{ tool: ToolDefinition; daysOverdue: number }> = [];

    for (const tool of this.getToolsRequiringPeriodicReview()) {
      const nextDateStr = tool.metadata.reviewPolicy?.nextReviewDate;
      if (!nextDateStr) continue;

      const nextDate = new Date(nextDateStr);
      const diffTime = refDate.getTime() - nextDate.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays > 0) {
        results.push({ tool, daysOverdue: diffDays });
      }
    }

    return results.sort((a, b) => b.daysOverdue - a.daysOverdue);
  }

  /**
   * Generates a high-level compliance and review summary of all registered tools.
   */
  public getReviewScheduleSummary(referenceDateStr?: string) {
    const all = this.getAll();
    const immutable = this.getImmutableTools();
    const periodic = this.getToolsRequiringPeriodicReview();
    const overdue = this.getOverdueReviews(referenceDateStr);
    const highRisk = periodic.filter((t) => t.metadata.reviewPolicy?.changeRisk === 'high');

    return {
      total: all.length,
      immutableCount: immutable.length,
      periodicReviewCount: periodic.length,
      highRiskCount: highRisk.length,
      overdueCount: overdue.length,
      unassignedCount: all.filter((t) => !t.metadata.reviewPolicy).length,
    };
  }
}

export const registry = new ToolRegistry();
