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

## Tools Catalog (31 In-Browser Tools)

Every tool runs 100% locally on your machine with zero server requests.

### 🛡️ Security & Cryptography
- **[JWT Inspector](#tool=jwt-inspector)**: Decode Base64URL JWT headers and payloads, inspect RFC 7519 standard claims, calculate real-time expiration countdowns, and format Unix timestamps. *(Guaranteed non-persistable in URLs for secret safety).*
- **[Passphrase & Key Generator](#tool=passphrase-generator)**: Cryptographically secure random password generation with EFF Diceware wordlists, CSPRNG alphanumeric strings, 128/256/512-bit hex keys, UUID v4, and Shannon entropy rating.
- **[Hash & Checksum Generator](#tool=hash-generator)**: Web Crypto SHA-1/256/384/512 digests, pure JS MD5, HMAC generation, and instant drag-and-drop file checksum verification.
- **[Diff Checker](#tool=diff-checker)**: Myers / Longest Common Subsequence (LCS) text difference engine with inline character-level diffs, split/unified view, and similarity percentage.

### 💻 Developer & Data Utilities
- **[Cron Schedule Parser](#tool=cron-parser)**: 5-field standard cron expressions (`min hour dom month dow`) translated into plain human English, complete with the next 5-10 upcoming scheduled run times.
- **[CSV ⇄ JSON ⇄ Markdown Converter](#tool=csv-json-converter)**: RFC 4180 bidirectional CSV, JSON array, and GitHub-flavored Markdown table converter with automatic delimiter detection and sensitive column masking.
- **[SQL Query Formatter](#tool=sql-formatter)**: SQL beautifier and minifier with standard clause indentation, subquery depth formatting, and keyword capitalization.
- **[Regular Expression Tester](#tool=regex-tester)**: Real-time regex matching engine with flag toggles (`g`, `i`, `m`, `s`), capture group & named group tables, and safe match highlight segmentation.
- **[URL & Query Inspector](#tool=url-inspector)**: RFC 3986 URL parser breaking down protocol, hostname, path, hash, query parameter key-value editors, and automatic UTM marketing tag extraction.
- **[JSON Formatter & Validator](#tool=json-formatter)**: Validates, formats (2/4 spaces, tabs), and minifies JSON structures with detailed syntax error reporting.
- **[Base64 Text & File Converter](#tool=base64-converter)**: Encode and decode UTF-8 strings or binary files to and from Base64 data with zero data loss.

### 📝 Text & Productivity
- **[Text Case Converter](#tool=case-converter)**: Transform text across camelCase, PascalCase, snake_case, kebab-case, CONSTANT_CASE, Title Case, sentence case, and SEO URL slugs with diacritic normalization.
- **[List Deduplicator & Set Operations](#tool=list-deduplicator)**: Remove duplicate lines, perform mathematical set operations ($A \cap B$, $A \setminus B$, $B \setminus A$, $A \cup B$), sort, and clean whitespace.
- **[Live Markdown Previewer](#tool=markdown-preview)**: Real-time GitHub Flavored Markdown (GFM) renderer with code highlighting, table rendering, automated Table of Contents extraction, and HTML export.
- **[Text & Word Analyzer](#tool=text-analyzer)**: Accurate character, word, sentence, line, and paragraph counts, reading/speaking time estimates, and top keyword frequencies.

### 🎨 Media, Visual & Documents
- **[Color Contrast Checker (WCAG 2.1)](#tool=color-contrast-checker)**: Calculate relative luminance and contrast ratios between text and background, check AA/AAA compliance for normal and large text, and auto-generate 50-900 color palettes.
- **[SVG Sanitizer & Cleaner](#tool=svg-sanitizer)**: Strip dangerous `<script>` tags, inline `on*` event handlers, `javascript:` hyperlinks, and bloated Adobe Illustrator / Figma metadata.
- **[Offline QR Code Generator](#tool=qr-code-tool)**: Pure TypeScript ISO/IEC 18004 QR code matrix generator for Wi-Fi configurations, 2FA OTPauth URIs, vCards, emails, and URLs. Exports to scalable SVG and PNG.
- **[Image EXIF & GPS Metadata Scrubber](#tool=exif-scrubber)**: Inspect and permanently strip EXIF tags, GPS coordinates, device models, and camera parameters from JPEG images before sharing.
- **[In-Browser Image Compressor](#tool=image-compressor)**: Lossy and lossless image compression using HTML5 Canvas / OffscreenCanvas with real-time resolution scaling, quality sliders, and WebP/JPEG/PNG format conversion.
- **[Client-Side PDF Manipulator](#tool=pdf-manipulator)**: Merge multiple PDF documents and extract custom page ranges using a pure browser-based binary PDF object assembler.

### 💰 Personal Finance Calculators
- **Loan & EMI Calculator**: Fixed-rate amortization schedules with monthly interest vs. principal breakdown.
- **SIP Calculator**: Systematic Investment Plan future value projection with compound growth charts.
- **Compound Interest Calculator**: Calculate compound returns with regular deposits and custom compounding frequencies.
- **Salary & Tax Estimator**: Net pay breakdown with tax slabs, deductions, and take-home calculations.
- **Retirement Planner**: FIRE nest egg calculation and safe withdrawal rate forecasting.
- **Debt Payoff Planner**: Avalanche vs. Snowball payoff timeline comparison.
- **Inflation Impact Calculator**: Purchasing power erosion across 5, 10, 20, and 30-year horizons.
- **Emergency Fund Calculator**: Essential expense buffer calculator with liquid allocation guidance.
- **Fixed Deposit (FD) Calculator**: Fixed deposit maturity values across cumulative and non-cumulative options.
- **Auto Loan Calculator**: Total vehicle loan cost including down payment, interest, taxes, and trade-in value.

---

## Zero-Egress Privacy Architecture

We built this suite on an uncompromising security model:

1. **No External Network Calls**: The application contains no API gateways, no external telemetry or tracking scripts (no Google Analytics, no Mixpanel, no Sentry).
2. **Selective URL Persistence (`persistableInUrl: false`)**: Sensitive tools (JWT Inspector, Passphrase Generator, EXIF Scrubber, PDF Manipulator) explicitly forbid saving state to URL hashes, preventing accidental leakage in browser history or copy-pasted URLs.
3. **Pure Deterministic Engines**: Every tool separates pure engine logic (`engine.ts`) from presentation (`ui.tsx`). Engines execute synchronously or via standard browser Web APIs (`SubtleCrypto`, `Canvas`, `Blob`, `FileReader`) without reliance on heavy, opaque third-party npm packages.
4. **Offline Resilience**: The entire application compiles to a static bundle deployable on any static web server or CDN (GitHub Pages, Cloudflare Pages, S3) and functions entirely offline once loaded.

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
