---
name: product-change-lifecycle
description: "Executes the rigorous end-to-end product change lifecycle workflow whenever the user asks for a feature addition, enhancement, or product change. Coordinates 6 collaborative stages: Research, Development, Code & Architecture Review, QA Testing, Compliance & Security, and SEO Analysis, supporting continuous bidirectional issue communication and feedback loops between all stages."
---

# Product Change Lifecycle Workflow

This skill orchestrates product change requests across **6 specialized stages**, ensuring strict privacy, architectural rigor, regulatory compliance, zero-regression code quality, and high search discoverability.

Every stage operates autonomously while maintaining bidirectional communication channels to send feedback packets upstream whenever issues, defects, architectural concerns, or ambiguities arise.

---

## The 6 Collaborative Stages

```
┌─────────────────┐       ┌─────────────────┐       ┌────────────────────────┐
│ 1. Research     │ ────> │ 2. Development  │ ────> │ 3. Code & Architecture │
└─────────────────┘       └─────────────────┘       │        Review          │
         ▲                         ▲                └────────────────────────┘
         │                         │                             │
         │ Feedback Packet         │ Feedback Packet             ▼
         ├─────────────────────────┼─────────────────────── ┌─────────────────┐
         │                         │                        │ 4. QA Testing   │
         │                         │                        └─────────────────┘
         │                         │                                 │
         │                         │ Feedback Packet                 ▼
         ├─────────────────────────┴─────────────────────── ┌─────────────────┐
         │                                                  │ 5. Compliance & │
         │ Feedback Packet                                  │    Security     │
         ├───────────────────────────────────────────────── └─────────────────┘
         ▼                                                           │
┌─────────────────┐                                                  ▼
│ User/Escalate   │ <────────────────────────────────────── ┌─────────────────┐
└─────────────────┘                                         │ 6. SEO Analysis │
                                                            └─────────────────┘
```

See [Stage Checklists](./references/stage-checklists.md) for detailed criteria for each stage.
See [Feedback Protocol](./references/feedback-protocol.md) for communication schemas and matrix.

---

## Workflow Execution Steps

Whenever a user requests a product change or new feature:

### Step 1: Feature Research & Feasibility
1. Analyze user request and define core functional requirements.
2. Confirm architectural constraint: **100% In-Browser & Private Sandbox** (zero backend, zero outbound network calls).
3. Identify governing standards, mathematical formulas (RFCs, IRS, NIST, W3C), or algorithmic benchmarks.
4. Establish preliminary category, primary keywords, and parameter schema.
5. Produce a concise **Feature Architecture Specification**.

### Step 2: Code Development
1. Scaffold tool using `npm run new-tool <tool-id>` or implement modular files in `src/tools/<tool-id>/`:
   - `engine.ts`: Pure calculations, isolated algorithms, rigorous boundary checks.
   - `definition.ts`: Tool metadata, parameter schemas, formula citations, and `reviewPolicy`.
   - `ui.tsx`: Accessible, mobile-responsive light-theme UI using Tailwind CSS and project design system components.
2. Register the tool in `src/tools/index.ts`.
3. Verify basic TypeScript compilation with `npx tsc -b`.
4. **Update README.md if necessary**:
   - When adding a new tool, add an entry to the Tools Catalog in `README.md` with `#tool=<id>` deep links, key features, and privacy guarantees.
   - Update the total tool count in the catalog header (e.g. `(34 In-Browser Tools)`).
   - Document any new developer commands, CLI flags, or architectural guides.

### Step 3: Code & Architecture Review (Industry-Grade)
1. Staff-architect level evaluation of implementation and design choices:
   - **Interrogate "Why"**: Ask why specific algorithms, state patterns, or data structures were chosen in a particular fashion instead of simpler, standard Web API alternatives.
   - **Evaluate Complexity**: Challenge over-engineered abstractions, excessive indirection, or conversely, under-engineered naive implementations prone to race conditions or UI thread lockups.
   - **Enforce Invariants**: Verify pure engine isolation (zero React or DOM imports in `engine.ts`), memory efficiency, and appropriate use of memoization.
   - **Challenge Assumptions**: Check whether error recovery is resilient and if edge cases are handled explicitly rather than implicitly swallowed.
2. **If architectural or design concerns are raised**:
   - Dispatch feedback ticket to **Development** (requesting refactoring or design justification) or **Research** (questioning feature necessity).
   - Await resolution/justification and re-review.

### Step 4: QA Testing & Automated Verification
1. Author comprehensive unit tests in `src/tools/<tool-id>/engine.test.ts`:
   - Benchmark precision tests against authoritative standard values.
   - Edge cases: zero, empty strings, negative numbers, extreme inputs, invalid characters.
2. Run full test suite:
   ```bash
   npm test
   ```
3. **If tests fail or reveal algorithmic gaps**:
   - Dispatch feedback ticket to **Development** (for code bugs) or **Research** (for ambiguous formulas).
   - Await resolution and re-verify.

### Step 5: Compliance & Security Auditing
1. Audit statutory review policy:
   - Cadence, governing body, change risk, and review dates (`lastReviewedDate`, `nextReviewDate`).
   - Run audit script: `npm run check-reviews`.
2. Audit security & privacy sandbox:
   - Scan for forbidden outbound calls (`fetch`, `XMLHttpRequest`, `WebSocket`, `sendBeacon`, `axios`).
   - Audit `dangerouslySetInnerHTML` usage (must use vetted DOMPurify).
   - Ensure sensitive secrets (passwords, JWTs, keys) are not persisted in URL hashes.
3. **If compliance or security issues are detected**:
   - Dispatch feedback ticket to **Development** (for sanitization/metadata fixes) or **Research** (for architectural privacy breaches).
   - Await resolution and re-verify.

### Step 6: SEO & Discoverability Analysis
1. Configure metadata in `src/core/seo-data.ts`:
   - `metaTitle`: 30-75 characters, brand format `[Tool Name] — [Primary Benefit] | Tools`.
   - `metaDescription`: 100-180 characters highlighting client-side privacy.
   - `howToUse`: At least 3 instructional steps for `HowTo` schema.
   - `faqs`: At least 2 targeted questions and answers for `FAQPage` schema.
   - `relatedToolIds`: Internal linking to contextually related tools.
2. Verify Static Site Generation (SSG):
   ```bash
   npm run build
   ```
3. **If SEO metadata is incomplete or SSG fails**:
   - Dispatch feedback ticket to **Development** or **Research**.
   - Await resolution and re-verify.

---

## Automated Lifecycle Verification

Run the unified lifecycle verification tool to validate Code Review, QA, Security, and SEO simultaneously:

```bash
npm run verify:change
```

Target a specific stage audit during iterative development:
```bash
npx tsx scripts/verify-product-change.ts --stage=code_review
npx tsx scripts/verify-product-change.ts --stage=qa
npx tsx scripts/verify-product-change.ts --stage=compliance_security
npx tsx scripts/verify-product-change.ts --stage=seo
```

---

## Multi-Agent Subagent Delegation

When running in multi-agent environments, tasks can be delegated to specialized subagents:
- **`feature-researcher`**: Investigates RFCs, benchmarks, formulas, and drafts specs.
- **`code-developer`**: Implements engine, definition, UI, updates `README.md`, and resolves bug tickets.
- **`code-reviewer`**: Conducts architectural interrogation, challenges design decisions, checks pure engine boundaries, and audits README sync.
- **`qa-tester`**: Authors test suites, executes Vitest, and stress-tests boundaries.
- **`compliance-security-officer`**: Audits sandbox isolation, review schedules, and DOM safety.
- **`seo-specialist`**: Audits discoverability, metadata, structured data, and SSG generation.

The parent agent coordinates tickets between subagents following the [Feedback Protocol](./references/feedback-protocol.md).
