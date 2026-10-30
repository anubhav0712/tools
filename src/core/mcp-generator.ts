import { zodToJsonSchema } from 'zod-to-json-schema';
import { registry } from './registry';

export interface McpToolManifestItem {
  name: string;
  description: string;
  inputSchema: Record<string, unknown>;
  outputSchema?: Record<string, unknown>;
  metadata: {
    category: string;
    version: string;
    keywords: string[];
    deepLinkSupported: boolean;
    agentPrompt?: string;
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
    tools: mcpTools.map((tool) => {
      let inputSchemaJson: Record<string, unknown> = { type: 'object', properties: {} };
      let outputSchemaJson: Record<string, unknown> | undefined = undefined;

      if (tool.inputSchema) {
        inputSchemaJson = zodToJsonSchema(tool.inputSchema, {
          target: 'openApi3',
          $refStrategy: 'none',
        }) as Record<string, unknown>;
      }

      if (tool.outputSchema) {
        outputSchemaJson = zodToJsonSchema(tool.outputSchema, {
          target: 'openApi3',
          $refStrategy: 'none',
        }) as Record<string, unknown>;
      }

      return {
        name: tool.metadata.id,
        description: tool.metadata.description,
        inputSchema: inputSchemaJson,
        outputSchema: outputSchemaJson,
        metadata: {
          category: tool.metadata.category,
          version: tool.metadata.version,
          keywords: tool.metadata.keywords,
          deepLinkSupported: tool.agent.deepLink !== false,
          agentPrompt: tool.agent.agentPrompt,
        },
      };
    }),
  };
}
