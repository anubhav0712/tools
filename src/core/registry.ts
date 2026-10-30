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
}

export const registry = new ToolRegistry();
