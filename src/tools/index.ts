import { base64ConverterTool } from './base64-converter/definition';
import { registry } from '../core/registry';
import { jsonFormatterTool } from './json-formatter/definition';

// Register all available tools
registry.register(base64ConverterTool);
registry.register(jsonFormatterTool);

export { jsonFormatterTool };
