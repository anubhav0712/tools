import type { ToolDefinition, ToolCategory } from './types';

class ToolRegistry {
  private tools = new Map<string, ToolDefinition<any, any>>();

  public register(tool: ToolDefinition<any, any>): void {
    if (this.tools.has(tool.metadata.id)) {
      console.warn(`Tool with id "${tool.metadata.id}" is already registered. Overwriting.`);
    }
    this.tools.set(tool.metadata.id, tool);
  }

  public get(id: string): ToolDefinition<any, any> | undefined {
    return this.tools.get(id);
  }

  public getAll(): ToolDefinition<any, any>[] {
    return Array.from(this.tools.values());
  }

  public getByCategory(category: ToolCategory): ToolDefinition<any, any>[] {
    return this.getAll().filter((tool) => tool.metadata.category === category);
  }

  public getMcpReady(): ToolDefinition<any, any>[] {
    return this.getAll().filter((tool) => tool.agent.mcp);
  }

  public search(query: string): ToolDefinition<any, any>[] {
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
