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

export type ReviewCadence =
  | 'immutable'       // Pure algorithms / mathematical identities / fixed RFCs (no logic changes over time)
  | 'annual'          // Annual statutory cycles (e.g., Union Budget / IRS tax bracket revisions / contribution limits)
  | 'semi-annual'     // Bi-annual economic updates (e.g., benchmark interest rates, credit caps)
  | 'quarterly'       // Quarterly fiscal / corporate tax disclosures
  | 'standards-track' // W3C, NIST, OWASP, IETF security & accessibility specifications
  | 'event-driven';   // Triggered by specific legal / security events (e.g. Finance Bill enactment, CVE vector)

export type RegulatoryCategory =
  | 'tax-law'              // Direct & indirect tax codes (IRS IRC, Indian Income Tax Act 1961, HMRC)
  | 'financial-regulation' // Banking & lending disclosures, interest rate caps, retirement laws (RBI, CFPB TILA, ERISA)
  | 'accessibility-std'    // W3C WCAG accessibility standards & Section 508
  | 'security-standards'   // NIST, OWASP, IETF RFC security practices
  | 'data-privacy-law'     // GDPR, CCPA, metadata privacy standards (CIPA Exif)
  | 'algorithmic-standard' // Immutable computer science & mathematical standards (IEEE, IETF, ISO, ECMA)
  | 'none';

export type BusinessLogicChangeRisk = 'high' | 'medium' | 'low' | 'none';

export interface BusinessLogicReview {
  /** How frequently this tool's business logic must be reviewed for correctness */
  cadence: ReviewCadence;
  /** Primary regulatory or technical domain governing the calculation */
  regulatoryCategory: RegulatoryCategory;
  /** Governing legal act, regulatory authority, or standards body */
  governingBodyOrStandard: string;
  /** Date when this tool's business logic was last verified (YYYY-MM-DD) */
  lastReviewedDate: string;
  /** Next scheduled review date (YYYY-MM-DD) - undefined if immutable */
  nextReviewDate?: string;
  /** Concrete event or milestone that mandates a review */
  reviewTrigger?: string;
  /** Impact/severity if the calculation logic becomes outdated or misaligned with current law */
  changeRisk: BusinessLogicChangeRisk;
  /** Operational guidance or compliance notes for the maintainer */
  notes?: string;
}

export interface ToolMetadata {
  id: string;               // Unique slug (e.g. "json-formatter")
  name: string;             // Human-readable title
  category: ToolCategory;
  description: string;      // Concise tool summary
  keywords: string[];
  version: string;
  icon: string;             // Lucide icon identifier
  persistableInUrl?: boolean; // Set false for sensitive tools (JWT, passwords, etc.) to prevent URL leaks
  reviewPolicy?: BusinessLogicReview; // Regulatory, legal & standards review schedule
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
