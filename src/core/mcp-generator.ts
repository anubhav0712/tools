import { registry } from './registry';

export interface McpToolManifestItem {
  name: string;
  description: string;
  inputSchema?: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  metadata: {
    category: string;
    version: string;
    keywords: string[];
    deepLinkSupported: boolean;
  };
}

export function generateMcpManifest(): {
  server: {
    name: string;
    version: string;
    description: string;
  };
  tools: McpToolManifestItem[];
} {
  const mcpTools = registry.getMcpReady();

  return {
    server: {
      name: 'tools-client-suite',
      version: '0.1.0',
      description: 'Privacy-first, 100% local client-side tool execution suite.',
    },
    tools: mcpTools.map((tool) => ({
      name: tool.metadata.id,
      description: tool.metadata.description,
      inputSchema: tool.inputSchema ? (tool.inputSchema as any)._def : undefined,
      outputSchema: tool.outputSchema ? (tool.outputSchema as any)._def : undefined,
      metadata: {
        category: tool.metadata.category,
        version: tool.metadata.version,
        keywords: tool.metadata.keywords,
        deepLinkSupported: tool.agent.deepLink !== false,
      },
    })),
  };
}
