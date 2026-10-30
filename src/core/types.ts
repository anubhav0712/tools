import type { ComponentType } from 'react';

export type ToolCategory =
  | 'finance'
  | 'text'
  | 'converter'
  | 'developer'
  | 'crypto'
  | 'everyday'
  | 'visual';

export type ParameterDataType = 'number' | 'string' | 'boolean' | 'select' | 'array';

export type ParameterUnit =
  | 'currency'
  | 'percent'
  | 'years'
  | 'months'
  | 'days'
  | 'ratio'
  | 'none';

export interface ToolParameterOption {
  label: string;
  value: string | number;
  description?: string;
}

export interface ToolParameterSchema {
  name: string;
  label: string;
  description: string;
  dataType: ParameterDataType;
  unit?: ParameterUnit;
  required?: boolean;
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: any;
  options?: ToolParameterOption[];
  group?: 'basic' | 'advanced' | 'tax' | 'fees' | 'scenario';
  regulatoryReference?: string;
}

export interface FormulaCitation {
  name: string;
  formula: string;
  description: string;
}

export interface ToolMetadata {
  id: string;               // Unique slug (e.g. "json-formatter")
  name: string;             // Human-readable title
  category: ToolCategory;
  description: string;      // Concise tool summary
  keywords: string[];
  version: string;
  icon: string;             // Lucide icon identifier
  // Enterprise fields
  regulatoryStandards?: string[];
  supportedRegions?: ('IN' | 'US' | 'GLOBAL')[];
  formulaCitations?: FormulaCitation[];
  parameters?: Record<string, ToolParameterSchema>;
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
