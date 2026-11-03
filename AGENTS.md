# Tools Platform — Product Change Governance & Lifecycle Rules

Whenever a user requests a new tool, feature enhancement, bug fix, or product change in this repository, the agent MUST execute the **6-Stage Product Change Lifecycle** with full bidirectional feedback loops:

## The 6 Mandatory Stages

1. **Feature Research**:
   - Verify the 100% in-browser sandbox constraint (zero backend calls, zero telemetry).
   - Document governing standards, mathematical formulas (RFCs, IRS, NIST, W3C), and citations.
   - Define parameter schemas and user search intent.

2. **Code Development**:
   - Implement modular code: `definition.ts`, pure `engine.ts`, accessible light-theme `ui.tsx`.
   - Register the tool in `src/tools/index.ts`.
   - Ensure clean TypeScript typing (`npx tsc -b`).
   - **Update README.md if necessary**: When adding a new tool or modifying capabilities, add the tool entry to the Tools Catalog in `README.md` with `#tool=<id>` deep links, update total tool counts, and document any new developer commands.

3. **Code & Architecture Review**:
   - Conduct an industry-grade, staff-architect level code and architectural review.
   - **Interrogate design choices**: Ask *why* specific patterns, data structures, or algorithms were chosen in a particular fashion instead of simpler or native Web API alternatives.
   - **Evaluate complexity**: Reject overengineering (unnecessary abstractions, premature indirection) and underengineering (fragile assumptions, unbounded memory, blocking main-thread computations).
   - **Verify architectural boundaries**: Enforce pure engine isolation (zero React/DOM dependencies in `engine.ts`) and single-responsibility component design.
   - Demand architectural justifications or refactor requests back to Development.

4. **QA Testing**:
   - Author thorough unit tests in `engine.test.ts` covering benchmark values and edge cases.
   - Run `npm test` to verify 100% pass rate and zero regression across all tools.

5. **Compliance & Security**:
   - Ensure complete `reviewPolicy` in `definition.ts` with valid cadence, governing body, and review dates.
   - Enforce 100% privacy sandbox (no `fetch`, `axios`, `XMLHttpRequest`, `WebSocket`, or unauthorized tracking).
   - Prevent secret exposure in URL hash states.

6. **SEO & Discoverability**:
   - Add structured metadata in `src/core/seo-data.ts` (`metaTitle`, `metaDescription`, `howToUse`, `faqs`, `relatedToolIds`).
   - Validate pre-rendering build via `npm run build` / SSG generator.

## Bidirectional Issue Communication Rules

- If any stage discovers a defect, ambiguity, architectural concern, security violation, or metadata gap, it **must** raise an issue ticket back to the responsible upstream stage (e.g., Review ➔ Dev, Review ➔ Research, QA ➔ Dev, Security ➔ Dev, SEO ➔ Dev, QA ➔ Research, Security ➔ Research).
- No code change may be considered complete or ready to ship until all 6 stages pass and all feedback tickets are verified and closed.
- Use `npm run verify:change` to execute automated validation across all lifecycle gates.
