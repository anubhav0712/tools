import { registry } from '../core/registry';
import { textAnalyzerTool } from './text-analyzer/definition';
import { base64ConverterTool } from './base64-converter/definition';
import { jsonFormatterTool } from './json-formatter/definition';

// Register all available tools
registry.register(textAnalyzerTool);
registry.register(base64ConverterTool);
registry.register(jsonFormatterTool);

export { textAnalyzerTool, base64ConverterTool, jsonFormatterTool };
