import type { ToolDefinition } from '../../core/types';
import { executeUrlInspector } from './engine';
import { UrlInspectorUI } from './ui';

export interface QueryParamItem {
  key: string;
  rawValue: string;
  decodedValue: string;
}

export interface UrlInspectorInput {
  rawUrl: string;
}

export interface UrlInspectorOutput {
  isValid: boolean;
  error?: string;
  protocol: string;
  host: string;
  port: string;
  pathname: string;
  hash: string;
  queryParams: QueryParamItem[];
  utmTags: Record<string, string>;
  encodedUrl: string;
  decodedUrl: string;
}

export const urlInspectorTool: ToolDefinition<UrlInspectorInput, UrlInspectorOutput> = {
  metadata: {
    id: 'url-inspector',
    name: 'URL & Query Inspector',
    category: 'converter',
    description: 'Inspect, decode, and parse complex URLs, nested query parameters, and UTM tracking tags.',
    keywords: ['url', 'query', 'encode', 'decode', 'uri', 'utm', 'params', 'developer'],
    version: '1.0.0',
    icon: 'Link2',
  },
  examples: [
    {
      title: 'Marketing Campaign Link',
      description: 'URL with nested UTM parameters',
      input: {
        rawUrl: 'https://example.com/checkout?plan=pro&ref=twitter&utm_source=spring_sale&utm_medium=social&utm_campaign=launch_2026#pricing',
      },
    },
    {
      title: 'OAuth Redirect URL',
      description: 'Encoded nested redirect URI',
      input: {
        rawUrl: 'https://auth.company.io/oauth/authorize?client_id=app_987&redirect_uri=https%3A%2F%2Fapp.company.io%2Fcallback&response_type=code&scope=read%20write',
      },
    },
  ],
  execute: executeUrlInspector,
  Component: UrlInspectorUI,
};
