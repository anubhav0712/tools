# Stage Checklists & Audit Criteria

Each stage of the Product Change Lifecycle has mandatory criteria that must be satisfied before progressing.

---

## Stage 1: Feature Research & Feasibility

### Lead Role: Feature Researcher
- [ ] **User Intent & Problem Statement**: Clear articulation of what problem the feature solves for end users.
- [ ] **100% In-Browser Privacy Feasibility**:
  - Zero external server calls or backend APIs.
  - Can all computations run deterministically in modern browser sandboxes using Web APIs (Web Crypto, Canvas, WebAssembly, standard DOM)?
- [ ] **Mathematical / Algorithmic Rigor**:
  - Authoritative formulas or standards identified (RFCs, IRS Publication, W3C standards, NIST specifications).
  - Formula citations documented for inclusion in `definition.ts`.
- [ ] **UI/UX Paradigm Alignment**:
  - Clean light-theme consistency using Tailwind CSS and Lucide icons.
  - Mobile responsiveness and accessible inputs.
- [ ] **Initial SEO & Category Taxonomy**:
  - Target category: `finance` | `text` | `converter` | `developer` | `crypto` | `everyday` | `visual`.
  - Target primary keyword and 3-5 secondary search terms.

---

## Stage 2: Code Development & Architecture

### Lead Role: Code Developer
- [ ] **Modular Directory Structure**:
  - `src/tools/<tool-id>/definition.ts`
  - `src/tools/<tool-id>/engine.ts`
  - `src/tools/<tool-id>/engine.test.ts`
  - `src/tools/<tool-id>/ui.tsx`
- [ ] **Pure Engine Implementation (`engine.ts`)**:
  - Pure TypeScript functions with zero side effects.
  - Robust boundary validation (empty values, zero division, extreme integers).
  - Explicit parameter and return interfaces.
- [ ] **Tool Definition & Metadata (`definition.ts`)**:
  - Complete `ToolMetadata` with `id`, `name`, `category`, `description`, `icon`.
  - Parameter schema definitions (`parameters` array) with min, max, step, defaultValue.
  - Formula citations (`formulaCitations` array).
  - Valid `reviewPolicy` (cadence, governing body, change risk, review trigger).
- [ ] **Accessible & Responsive UI (`ui.tsx`)**:
  - Clean light-theme controls adhering to project design system (`ToolShell`, `MetricCard`, `ResultBadge`).
  - Inputs with explicit `<label>` associations and accessible keyboard navigation.
  - Non-blocking computations (wrap intense operations or use Web Workers if heavy).
- [ ] **Registry Integration**:
  - Register tool in `src/tools/index.ts`.
  - Export definition from `src/tools/<tool-id>/index.ts` if applicable.

---

## Stage 3: QA & Automated Testing

### Lead Role: QA Tester
- [ ] **Test Coverage in `engine.test.ts`**:
  - Baseline/happy path calculations against published benchmark values.
  - Boundary conditions (empty strings, zero, negative numbers, max safe integers, null/undefined handling).
  - Error state handling (invalid inputs, malformed syntax).
- [ ] **Vitest Suite Execution**:
  - `npm test` passes 100% with zero failing or skipped assertions.
- [ ] **TypeScript Build Check**:
  - `npx tsc -b` succeeds with 0 errors across the entire repository.
- [ ] **Regression Assurance**:
  - Existing 31+ tools continue passing all unit tests without degradation.

---

## Stage 4: Compliance & Security Auditing

### Lead Role: Compliance & Security Officer
- [ ] **Statutory & Regulatory Review Policy**:
  - `reviewPolicy.cadence` is valid (`immutable`, `annual`, `semi-annual`, `quarterly`, `standards-track`, `event-driven`).
  - `reviewPolicy.governingBodyOrStandard` is explicitly specified (e.g., IRS IRC §121, W3C WCAG 2.1, RFC 7519, NIST SP 800-63B).
  - `reviewPolicy.lastReviewedDate` is a valid ISO date `YYYY-MM-DD`.
  - If non-immutable, `nextReviewDate` is set to a future ISO date and `reviewTrigger` explains the statutory cycle.
- [ ] **100% Client-Side Privacy Guarantee**:
  - Zero outbound HTTP/WebSocket requests: no `fetch()`, `axios`, `XMLHttpRequest`, `navigator.sendBeacon`.
  - Zero third-party trackers, telemetry, or remote analytics.
- [ ] **State & Secret Security**:
  - Sensitive inputs (passwords, JWTs, private keys, financial balances) MUST NOT be persisted in plain URL hash query parameters without explicit opt-in or mask.
- [ ] **XSS & Injection Defenses**:
  - No unvetted `dangerouslySetInnerHTML`.
  - SVG or HTML rendering must utilize vetted sanitization (e.g. DOMPurify in `svg-sanitizer` or `markdown-preview`).
  - Input parsing avoids RegEx catastrophic backtracking (ReDoS).

---

## Stage 5: SEO & Discoverability Analysis

### Lead Role: SEO Specialist
- [ ] **SEO Configuration in `src/core/seo-data.ts`**:
  - Entry added to `TOOL_SEO_DATA[toolId]`.
  - `metaTitle`: 30-75 characters, brand format: `[Tool Name] — [Primary Benefit] | Tools`.
  - `metaDescription`: 100-180 characters highlighting zero-tracking privacy and key functionality.
  - `howToUse`: Array of at least 3 clear, actionable steps for Schema.org `HowTo` markup.
  - `faqs`: Array of at least 2 relevant questions and comprehensive answers for Schema.org `FAQPage` markup.
  - `relatedToolIds`: Array of 2-4 contextually relevant tool IDs for internal cross-linking.
- [ ] **SSG Pre-rendering Verification**:
  - `npm run ssg` (or `tsx scripts/generate-ssg.ts`) runs successfully.
  - Pre-rendered static HTML generated in `dist/` contains valid metadata, OpenGraph tags, and JSON-LD structured data.
- [ ] **Search Intent & Readability**:
  - High-intent keywords included naturally in tool title, summary, and FAQs without keyword stuffing.
