import type { ToolDefinition } from '../../core/types';
import { executeCsvJsonConverter } from './engine';
import { CsvJsonConverterUI } from './ui';

export type ConversionDirection =
  | 'csv_to_json'
  | 'json_to_csv'
  | 'csv_to_markdown'
  | 'markdown_to_csv';

export interface CsvJsonConverterInput {
  direction: ConversionDirection;
  data: string;
  delimiter?: string;
  hasHeader?: boolean;
  indent?: number;
  anonymizeColumns?: string[];
  anonymizeMode?: 'hash' | 'mask';
}

export interface CsvJsonConverterOutput {
  isValid: boolean;
  error?: string;
  converted: string;
  rowCount: number;
  columnCount: number;
  headers: string[];
}

export const csvJsonConverterTool: ToolDefinition<
  CsvJsonConverterInput,
  CsvJsonConverterOutput
> = {
  metadata: {
    id: 'csv-json-converter',
    name: 'CSV ↔ JSON Converter',
    category: 'converter',
    description: 'Transform tabular data between CSV, JSON, and Markdown tables with local column anonymization.',
    keywords: ['csv', 'json', 'table', 'markdown', 'excel', 'convert', 'anonymize', 'data'],
    version: '1.0.0',
    icon: 'FileSpreadsheet',
    reviewPolicy: {
      cadence: 'immutable',
      regulatoryCategory: 'algorithmic-standard',
      governingBodyOrStandard: 'IETF RFC 4180 (CSV) / RFC 8259 (JSON)',
      lastReviewedDate: '2026-10-31',
      changeRisk: 'none',
      notes: 'RFC 4180 comma-separated value grammar and RFC 8259 JSON grammar are finalized.',
    },
  },
  examples: [
    {
      title: 'CSV to JSON Array',
      description: 'Employee directory with header',
      input: {
        direction: 'csv_to_json',
        data: 'id,name,role,department\n101,Alice Smith,Engineer,Platform\n102,Bob Jones,Product Manager,Core\n103,Charlie Brown,Designer,Brand',
        delimiter: ',',
        hasHeader: true,
        indent: 2,
      },
    },
    {
      title: 'CSV to Markdown Table',
      description: 'Tabular format for documentation and GitHub READMEs',
      input: {
        direction: 'csv_to_markdown',
        data: 'Feature,Supported,Browser Only\nZero Egress,Yes,Yes\nFast Latency,Yes,Yes\nOffline,Yes,Yes',
        delimiter: ',',
        hasHeader: true,
      },
    },
    {
      title: 'JSON to CSV',
      description: 'Array of records converted to comma-delimited rows',
      input: {
        direction: 'json_to_csv',
        data: '[\n  {"sku": "A10", "item": "Keyboard", "price": 49.99},\n  {"sku": "B20", "item": "Mouse", "price": 24.50}\n]',
        delimiter: ',',
        hasHeader: true,
      },
    },
  ],
  execute: executeCsvJsonConverter,
  Component: CsvJsonConverterUI,
};
