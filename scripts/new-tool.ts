import fs from 'fs';
import path from 'path';
import readline from 'readline';

function parseArgs() {
  const args = process.argv.slice(2);
  let id = '';
  let name = '';
  let category = '';
  let description = '';
  let mcp: boolean | null = null;

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--name' && args[i + 1]) name = args[++i];
    else if (arg === '--category' && args[i + 1]) category = args[++i];
    else if (arg === '--description' && args[i + 1]) description = args[++i];
    else if (arg === '--mcp') mcp = true;
    else if (arg === '--no-mcp') mcp = false;
    else if (!arg.startsWith('-') && !id) id = arg;
  }

  return { id, name, category, description, mcp };
}

function toPascalCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join('');
}

function toTitleCase(str: string): string {
  return str
    .split(/[-_]/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

async function main() {
  console.log('\n🛠️  Tools Platform — New Tool Scaffolding Generator\n');

  const parsed = parseArgs();
  let rl: readline.Interface | null = null;

  const ask = (question: string, defaultVal?: string): Promise<string> => {
    if (!rl) {
      rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
    }
    return new Promise((resolve) => {
      const promptText = defaultVal ? `${question} [${defaultVal}]: ` : `${question}: `;
      rl!.question(promptText, (answer) => {
        resolve(answer.trim() || defaultVal || '');
      });
    });
  };

  let toolId = parsed.id;
  if (!toolId) {
    toolId = await ask('Enter tool ID (kebab-case, e.g. "base64-converter")');
  }

  toolId = toolId.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/--+/g, '-');
  if (!toolId) {
    console.error('❌ Error: Tool ID cannot be empty.');
    process.exit(1);
  }

  const toolDir = path.resolve(process.cwd(), 'src/tools', toolId);
  if (fs.existsSync(toolDir)) {
    console.error(`❌ Error: Tool directory already exists at src/tools/${toolId}`);
    process.exit(1);
  }

  const defaultName = toTitleCase(toolId);
  const toolName = parsed.name || (await ask('Human-readable Name', defaultName));
  const category = parsed.category || (await ask('Category (developer | data | crypto | text | converter | visual)', 'developer'));
  const description = parsed.description || (await ask('Brief Description', `Fast and local ${toolName} running 100% in your browser.`));
  
  let isMcp = parsed.mcp;
  if (isMcp === null) {
    const isMcpAnswer = await ask('Is this tool MCP / Agent ready? (y/n)', 'y');
    isMcp = isMcpAnswer.toLowerCase().startsWith('y');
  }

  if (rl) {
    (rl as readline.Interface).close();
  }

  const pascalName = toPascalCase(toolId);
  const camelName = toolId.replace(/-([a-z])/g, (_, g) => g.toUpperCase());

  fs.mkdirSync(toolDir, { recursive: true });

  // 1. Generate definition.ts
  const definitionContent = isMcp
    ? `import { z } from 'zod';
import type { ToolDefinition } from '../../core/types';
import { execute${pascalName} } from './engine';
import { ${pascalName}UI } from './ui';

export const ${pascalName}InputSchema = z.object({
  input: z.string().describe('Input string to process'),
});

export type ${pascalName}Input = z.infer<typeof ${pascalName}InputSchema>;

export const ${pascalName}OutputSchema = z.object({
  result: z.string().describe('Processed result'),
});

export type ${pascalName}Output = z.infer<typeof ${pascalName}OutputSchema>;

export const ${camelName}Tool: ToolDefinition<
  typeof ${pascalName}InputSchema,
  typeof ${pascalName}OutputSchema
> = {
  metadata: {
    id: '${toolId}',
    name: '${toolName}',
    category: '${category}' as any,
    description: '${description}',
    keywords: ['${toolId}', '${category}'],
    version: '1.0.0',
    icon: 'Wrench',
  },
  agent: {
    mcp: true,
    deepLink: true,
    agentPrompt: 'Use this tool to execute ${toolName} operations locally.',
  },
  inputSchema: ${pascalName}InputSchema,
  outputSchema: ${pascalName}OutputSchema,
  examples: [
    {
      title: 'Default Example',
      description: 'Sample run',
      input: {
        input: 'Sample payload',
      },
    },
  ],
  execute: execute${pascalName},
  Component: ${pascalName}UI,
};
`
    : `import type { ToolDefinition } from '../../core/types';
import { ${pascalName}UI } from './ui';

export const ${camelName}Tool: ToolDefinition = {
  metadata: {
    id: '${toolId}',
    name: '${toolName}',
    category: '${category}' as any,
    description: '${description}',
    keywords: ['${toolId}', '${category}'],
    version: '1.0.0',
    icon: 'Sparkles',
  },
  agent: {
    mcp: false,
    deepLink: true,
  },
  Component: ${pascalName}UI,
};
`;

  fs.writeFileSync(path.join(toolDir, 'definition.ts'), definitionContent, 'utf-8');

  // 2. Generate engine.ts & engine.test.ts (if MCP ready)
  if (isMcp) {
    const engineContent = `import type { ${pascalName}Input, ${pascalName}Output } from './definition';

export function execute${pascalName}(input: ${pascalName}Input): ${pascalName}Output {
  return {
    result: input.input.toUpperCase(),
  };
}
`;
    fs.writeFileSync(path.join(toolDir, 'engine.ts'), engineContent, 'utf-8');

    const testContent = `import { describe, it, expect } from 'vitest';
import { execute${pascalName} } from './engine';

describe('${toolName} Engine', () => {
  it('processes input correctly', () => {
    const result = execute${pascalName}({ input: 'hello' });
    expect(result.result).toBe('HELLO');
  });
});
`;
    fs.writeFileSync(path.join(toolDir, 'engine.test.ts'), testContent, 'utf-8');
  }

  // 3. Generate ui.tsx
  const uiContent = `import React, { useState } from 'react';
import { ToolShell } from '../../design-system/tool-shell';
import { CodeEditor } from '../../design-system/code-editor';
import type { ToolComponentProps } from '../../core/types';
${isMcp ? `import { execute${pascalName} } from './engine';\nimport type { ${pascalName}Input, ${pascalName}Output } from './definition';` : ''}

export const ${pascalName}UI: React.FC<ToolComponentProps<${isMcp ? `${pascalName}Input, ${pascalName}Output` : 'unknown, unknown'}>> = ({ tool, initialInput }) => {
  const [inputVal, setInputVal] = useState<string>(${isMcp ? '(initialInput as any)?.input || "Hello World"' : '""'});
  const [outputVal, setOutputVal] = useState<string>(${isMcp ? '"HELLO WORLD"' : '""'});
  const [execTime, setExecTime] = useState<number>(0);

  const handleRun = (text: string) => {
    ${isMcp ? `const start = performance.now();
    const res = execute${pascalName}({ input: text });
    const end = performance.now();
    setExecTime(end - start);
    setOutputVal(res.result);` : '/* Interactive UI logic */'}
  };

  return (
    <ToolShell
      tool={tool}
      executionTimeMs={execTime}
      inputData={{ input: inputVal }}
      outputData={{ result: outputVal }}
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CodeEditor
          label="Input"
          value={inputVal}
          onChange={(val) => {
            setInputVal(val);
            handleRun(val);
          }}
          placeholder="Enter text..."
        />
        <CodeEditor
          label="Output"
          value={outputVal}
          readOnly
          placeholder="Result will appear here..."
        />
      </div>
    </ToolShell>
  );
};
`;
  fs.writeFileSync(path.join(toolDir, 'ui.tsx'), uiContent, 'utf-8');

  // 4. Update src/tools/index.ts
  const toolsIndexPath = path.resolve(process.cwd(), 'src/tools/index.ts');
  const toolVarName = `${camelName}Tool`;
  const importStatement = `import { ${toolVarName} } from './${toolId}/definition';\n`;
  const registerStatement = `registry.register(${toolVarName});\n`;

  let toolsIndexContent = fs.readFileSync(toolsIndexPath, 'utf-8');
  toolsIndexContent = importStatement + toolsIndexContent;
  toolsIndexContent = toolsIndexContent.replace(
    '// Register all available tools\n',
    `// Register all available tools\n${registerStatement}`
  );
  fs.writeFileSync(toolsIndexPath, toolsIndexContent, 'utf-8');

  console.log(`\n✅ Successfully scaffolded tool "${toolName}" in src/tools/${toolId}!`);
  console.log(`📁 Files created:`);
  console.log(`   - src/tools/${toolId}/definition.ts`);
  if (isMcp) {
    console.log(`   - src/tools/${toolId}/engine.ts`);
    console.log(`   - src/tools/${toolId}/engine.test.ts`);
  }
  console.log(`   - src/tools/${toolId}/ui.tsx`);
  console.log(`   - Registered in src/tools/index.ts\n`);
  console.log(`Run 'npm test' to verify your new tool's test suite!\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
