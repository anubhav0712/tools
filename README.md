# Tools

> **Privacy-first, 100% client-side, agent-ready developer & data utility suite.**

All tools run **entirely in your browser sandbox**. Zero backend servers, zero cloud API calls, zero tracking, and complete data privacy. Every tool is built with a typed contract (Zod schemas) so it can be used seamlessly by both human engineers and AI agents via Model Context Protocol (MCP).

---

## Key Features

- 🔒 **100% Client-Side**: All parsing, formatting, transformations, and compute run in-browser via pure TypeScript and Web Workers.
- 🤖 **Agent & MCP Ready**: Tools with `agent: { mcp: true }` are automatically validated, exported into `/mcp-manifest.json`, and expose structured context copy actions for LLM agents.
- 🎨 **Unified Design System**: Cohesive design tokens built with Tailwind CSS v4 and modern semantic CSS variables (`color-scheme: dark`).
- ⚡ **Instant Deep-Linking**: Share exact tool states via URL hashes (`#tool=json-formatter&input=...`) without server-side routing issues on GitHub Pages.
- 🚀 **GitHub Pages Ready**: Out-of-the-box GitHub Actions workflow (`.github/workflows/deploy.yml`) for continuous deployment.
- 🛠️ **CLI Scaffolding**: Add a new tool in 5 seconds with `npm run new-tool <tool-id>`.

---

## Quick Start

### Installation & Local Development

```bash
# Install dependencies
npm install

# Start local development server with Vite HMR
npm run dev

# Run unit tests with Vitest
npm test

# Build static bundle & export MCP manifest for production
npm run build

# Preview production build locally
npm run preview
```

---

## Developing & Adding New Tools

The platform makes adding new tools frictionless through standardized plugins.

### Step 1: Scaffold with the CLI

```bash
npm run new-tool <tool-id>
# Example: npm run new-tool jwt-decoder
```

The interactive prompt asks:
1. **Name**: Human-readable title
2. **Category**: `developer` | `data` | `crypto` | `text` | `converter` | `visual`
3. **Description**: Concise tool summary
4. **Is this tool MCP / Agent ready? (y/n)**:
   - **`y`**: Generates typed Zod `inputSchema`, `outputSchema`, headless `engine.ts`, and Vitest unit tests.
   - **`n`**: Generates an interactive GUI-only tool definition.

### Step 2: Anatomy of a Tool

Each tool lives in its own self-contained directory under `src/tools/<tool-id>/`:

```
src/tools/<tool-id>/
├── definition.ts    # Metadata, category, agent config, and Zod schemas
├── engine.ts        # Pure, deterministic headless execution logic
├── engine.test.ts   # Unit tests verifying edge cases
└── ui.tsx           # React UI wrapped in <ToolShell>
```

#### Example Tool Definition (`definition.ts`):

```typescript
import { z } from 'zod';
import type { ToolDefinition } from '../../core/types';
import { executeJsonFormatter } from './engine';
import { JsonFormatterUI } from './ui';

export const JsonFormatterInputSchema = z.object({
  rawJson: z.string().describe('The raw JSON string to format'),
  indent: z.number().default(2),
});

export const JsonFormatterOutputSchema = z.object({
  formatted: z.string(),
  isValid: z.boolean(),
});

export const jsonFormatterTool: ToolDefinition = {
  metadata: {
    id: 'json-formatter',
    name: 'JSON Formatter & Validator',
    category: 'developer',
    description: 'Format, validate, or minify JSON data locally.',
    keywords: ['json', 'format', 'minify'],
    version: '1.0.0',
    icon: 'Braces',
  },
  agent: {
    mcp: true,
    deepLink: true,
  },
  inputSchema: JsonFormatterInputSchema,
  outputSchema: JsonFormatterOutputSchema,
  execute: executeJsonFormatter,
  Component: JsonFormatterUI,
};
```

---

## Project Structure

```
tools/
├── .github/workflows/deploy.yml # Automated GitHub Pages deployment
├── index.html                   # HTML entry point
├── package.json
├── tsconfig.json
├── vite.config.ts
├── scripts/
│   ├── new-tool.ts              # Interactive scaffolding CLI
│   └── export-mcp.ts            # MCP manifest exporter
└── src/
    ├── main.tsx                 # React DOM mount point
    ├── app.tsx                  # Shell coordinator & hash router
    ├── core/
    │   ├── types.ts             # ToolDefinition, Metadata, AgentConfig
    │   ├── registry.ts          # Central tool registry
    │   ├── url-state.ts         # Hash-based deep link serializer
    │   └── mcp-generator.ts     # Generates MCP JSON definitions
    ├── design-system/
    │   ├── theme.css            # Tailwind CSS v4 & theme tokens
    │   ├── tool-shell.tsx       # Standard tool container wrapper
    │   ├── button.tsx           # Accessible button variants
    │   ├── badge.tsx            # Status & capability pills
    │   └── code-editor.tsx      # Monaco/code style editor
    ├── shell/
    │   ├── header.tsx           # Global navigation & status
    │   ├── catalog-grid.tsx     # Homepage tool gallery
    │   └── command-palette.tsx  # Cmd+K search modal
    └── tools/
        ├── index.ts             # Tool auto-registration index
        └── json-formatter/      # Gold-standard reference tool
            ├── definition.ts
            ├── engine.ts
            ├── engine.test.ts
            └── ui.tsx
```

---

## Deployment to GitHub Pages

1. In your GitHub repository, navigate to **Settings > Pages**.
2. Under **Build and deployment > Source**, select **GitHub Actions**.
3. Push to `main`. The `.github/workflows/deploy.yml` pipeline will automatically build the static site, export `/mcp-manifest.json`, and publish to GitHub Pages.

---

## License

MIT
