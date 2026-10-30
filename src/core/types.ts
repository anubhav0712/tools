import { z } from 'zod';
import type { ComponentType } from 'react';

export type ToolCategory =
  | 'developer'
  | 'data'
  | 'crypto'
  | 'text'
  | 'converter'
  | 'visual';

export interface ToolMetadata {
  id: string;               // Unique slug (e.g. "json-formatter")
  name: string;             // Human-readable title
  category: ToolCategory;
  description: string;      // Clear description used for UI & agent prompts
  keywords: string[];
  version: string;
  icon: string;             // Lucide icon name
}

export interface ToolAgentConfig {
  /**
   * Whether this tool can be invoked programmatically via Model Context Protocol (MCP)
   * and exported into the platform's MCP server / tool manifest.
   */
  mcp: boolean;
  /**
   * Whether this tool supports URL query/hash parameter state initialization.
   * Default: true
   */
  deepLink?: boolean;
  /**
   * Special instructions for AI agents when invoking this tool.
   * Only applicable when mcp is true.
   */
  agentPrompt?: string;
}

export interface ToolComponentProps<TInput = unknown, TOutput = unknown> {
  tool: ToolDefinition;
  initialInput?: TInput;
  onExecute?: (input: TInput) => Promise<TOutput> | TOutput;
}

export interface ToolExample<TInput = unknown> {
  title: string;
  description?: string;
  input: TInput;
}

export interface ToolDefinition<
  TInputSchema extends z.ZodTypeAny = any,
  TOutputSchema extends z.ZodTypeAny = any
> {
  metadata: ToolMetadata;
  agent: ToolAgentConfig;
  
  /** Required when agent.mcp === true; defines input validation for agents & forms */
  inputSchema?: TInputSchema;
  /** Required when agent.mcp === true; defines output structure */
  outputSchema?: TOutputSchema;

  examples?: Array<ToolExample<z.infer<TInputSchema>>>;

  /**
   * Headless deterministic engine.
   * Required when agent.mcp === true. Optional for purely visual tools.
   */
  execute?: (input: z.infer<TInputSchema>) => Promise<z.infer<TOutputSchema>> | z.infer<TOutputSchema>;

  /** React UI Component for human interaction */
  Component: ComponentType<ToolComponentProps<z.infer<TInputSchema>, z.infer<TOutputSchema>>>;
}

export interface ToolExecutionResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  executionTimeMs: number;
}
