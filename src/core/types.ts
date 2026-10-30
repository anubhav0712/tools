import type { ComponentType } from 'react';

export type ToolCategory =
  | 'text'
  | 'converter'
  | 'developer'
  | 'crypto'
  | 'everyday'
  | 'visual';

export interface ToolMetadata {
  id: string;               // Unique slug (e.g. "json-formatter")
  name: string;             // Human-readable title
  category: ToolCategory;
  description: string;      // Concise tool summary
  keywords: string[];
  version: string;
  icon: string;             // Lucide icon identifier
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

export interface ToolDefinition<TInput = any, TOutput = any> {
  metadata: ToolMetadata;
  examples?: Array<ToolExample<TInput>>;
  /** Optional pure headless execution logic for testability */
  execute?: (input: TInput) => Promise<TOutput> | TOutput;
  /** React UI Component for human interaction */
  Component: ComponentType<ToolComponentProps<TInput, TOutput>>;
}
