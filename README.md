# Tools

> **Fast, minimal, and 100% in-browser online tools suite. Completely private, free, and offline-ready.**

All tools run **entirely in your browser sandbox**. Zero backend servers, zero cloud API calls, zero tracking, and complete data privacy. Designed with a clean light theme, mobile-friendly responsive layout, and an extensible architecture to add new tools effortlessly.

---

## Key Features

- 🔒 **100% In-Browser & Private**: All parsing, formatting, text analysis, and data conversions execute strictly on your device. Zero data is ever sent to a server.
- ☀️ **Clean Minimal Light Theme**: Polished typography, accessible controls, and soft neutral styling designed for everyday users and professionals alike.
- 📱 **Mobile & Multi-Device Ready**: Fluidly adapts across smartphones, tablets, and desktop displays.
- ⚡ **Instant Deep-Linking**: Share exact tool states via URL hashes (`#tool=text-analyzer&input=...`) with no server routing or 404 errors.
- 🚀 **GitHub Pages CI/CD**: Automatic zero-downtime deployment on every push to `main` via GitHub Actions.
- 🛠️ **CLI Scaffolding**: Add a new tool in seconds with `npm run new-tool <tool-id>`.

---

## Quick Start

### Installation & Local Development

```bash
# Install dependencies
npm install

# Start local development server with instant HMR
npm run dev

# Run unit tests with Vitest
npm test

# Build static production bundle
npm run build

# Preview production build locally
npm run preview
```

---

## Developing & Adding New Tools

Adding a new tool is straightforward and assisted by the built-in generator:

### Step 1: Scaffold with the CLI

```bash
npm run new-tool <tool-id>
# Example: npm run new-tool unit-converter
```

The interactive prompt asks for:
1. **Name**: Human-readable title
2. **Category**: `text` | `converter` | `developer` | `crypto` | `everyday`
3. **Description**: Concise tool summary

### Step 2: Anatomy of a Tool

Each tool lives in its own self-contained directory under `src/tools/<tool-id>/`:

```
src/tools/<tool-id>/
├── definition.ts    # Tool metadata and TypeScript interfaces
├── engine.ts        # Pure, deterministic logic (runnable in Node or browser)
├── engine.test.ts   # Vitest unit tests verifying edge cases
└── ui.tsx           # React UI wrapped in <ToolShell>
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
│   └── new-tool.ts              # Interactive tool scaffolding CLI
└── src/
    ├── main.tsx                 # React DOM mount point
    ├── app.tsx                  # App shell coordinator & hash router
    ├── core/
    │   ├── types.ts             # ToolDefinition, Metadata, Categories
    │   ├── registry.ts          # Central tool registry
    │   └── url-state.ts         # Hash-based deep link serializer
    ├── design-system/
    │   ├── theme.css            # Tailwind CSS v4 & semantic theme tokens
    │   ├── tool-shell.tsx       # Standard tool container wrapper
    │   ├── button.tsx           # Accessible button variants
    │   ├── badge.tsx            # Status pills
    │   └── code-editor.tsx      # Clean editor viewport
    ├── shell/
    │   ├── header.tsx           # Global navigation & status
    │   ├── catalog-grid.tsx     # Homepage tool gallery
    │   └── command-palette.tsx  # Cmd+K search modal
    └── tools/
        ├── index.ts             # Central tool registry index
        ├── text-analyzer/       # Word counter & text statistics
        ├── json-formatter/      # JSON formatter, validator & minifier
        └── base64-converter/    # Base64 encoder/decoder
```

---

## Deployment to GitHub Pages

1. In your GitHub repository, navigate to **Settings > Pages**.
2. Under **Build and deployment > Source**, select **GitHub Actions**.
3. Push your commits to `main`. The `.github/workflows/deploy.yml` pipeline will automatically test, build, and deploy your site to `https://anubhav0712.github.io/tools/`.

---

## License

MIT
