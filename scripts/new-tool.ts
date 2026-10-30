import fs from 'fs';
import path from 'path';
import readline from 'readline';

function parseArgs() {
  const args = process.argv.slice(2);
  let id = '';
  let name = '';
  let category = '';
  let description = '';

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--name' && args[i + 1]) name = args[++i];
    else if (arg === '--category' && args[i + 1]) category = args[++i];
    else if (arg === '--description' && args[i + 1]) description = args[++i];
    else if (!arg.startsWith('-') && !id) id = arg;
  }

  return { id, name, category, description };
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
    toolId = await ask('Enter tool ID (kebab-case, e.g. "case-converter")');
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
  const category = parsed.category || (await ask('Category (text | converter | developer | crypto | everyday)', 'everyday'));
  const description = parsed.description || (await ask('Brief Description', `Fast and private ${toolName} running 100% in your browser.`));

  if (rl) {
    (rl as readline.Interface).close();
  }

  const pascalName = toPascalCase(toolId);
  const camelName = toolId.replace(/-([a-z])/g, (_, g) => g.toUpperCase());

  fs.mkdirSync(toolDir, { recursive: true });

  // 1. Generate definition.ts
  const definitionContent = `import type { ToolDefinition } from '../../core/types';
import { execute${pascalName} } from './engine';
import { ${pascalName}UI } from './ui';

export interface ${pascalName}Input {
  input: string;
}

export interface ${pascalName}Output {
  result: string;
}

export const ${camelName}Tool: ToolDefinition<${pascalName}Input, ${pascalName}Output> = {
  metadata: {
    id: '${toolId}',
    name: '${toolName}',
    category: '${category}' as any,
    description: '${description}',
    keywords: ['${toolId}', '${category}'],
    version: '1.0.0',
    icon: 'Wrench',
  },
  examples: [
    {
      title: 'Default Example',
      description: 'Sample input',
      input: {
        input: 'Sample text',
      },
    },
  ],
  execute: execute${pascalName},
  Component: ${pascalName}UI,
};
`;
  fs.writeFileSync(path.join(toolDir, 'definition.ts'), definitionContent, 'utf-8');

  // 2. Generate engine.ts & engine.test.ts
  const engineContent = `import type { ${pascalName}Input, ${pascalName}Output } from './definition';

export function execute${pascalName}(input: ${pascalName}Input): ${pascalName}Output {
  return {
    result: (input.input || '').toUpperCase(),
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

  // 3. Generate ui.tsx
  const uiContent = `import React, { useState } from 'react';
import { ToolShell } from '../../design-system/tool-shell';
import { CodeEditor } from '../../design-system/code-editor';
import type { ToolComponentProps } from '../../core/types';
import { execute${pascalName} } from './engine';
import type { ${pascalName}Input, ${pascalName}Output } from './definition';

export const ${pascalName}UI: React.FC<ToolComponentProps<${pascalName}Input, ${pascalName}Output>> = ({ tool, initialInput }) => {
  const [inputVal, setInputVal] = useState<string>(initialInput?.input || 'Hello World');
  const [outputVal, setOutputVal] = useState<string>('HELLO WORLD');
  const [execTime, setExecTime] = useState<number>(0);

  const handleRun = (text: string) => {
    const start = performance.now();
    const res = execute${pascalName}({ input: text });
    const end = performance.now();
    setExecTime(end - start);
    setOutputVal(res.result);
  };

  return (
    <ToolShell
      tool={tool}
      executionTimeMs={execTime}
      inputData={{ input: inputVal }}
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
  console.log(`   - src/tools/${toolId}/engine.ts`);
  console.log(`   - src/tools/${toolId}/engine.test.ts`);
  console.log(`   - src/tools/${toolId}/ui.tsx`);
  console.log(`   - Registered in src/tools/index.ts\n`);
  console.log(`Run 'npm test' to verify your new tool's test suite!\n`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
