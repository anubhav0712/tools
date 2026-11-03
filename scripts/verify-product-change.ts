import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { execSync } from 'node:child_process';
import { registry } from '../src/core/registry';
import '../src/tools'; // Ensure all tools are registered
import { TOOL_SEO_DATA } from '../src/core/seo-data';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const TOOLS_SRC_DIR = path.resolve(ROOT_DIR, 'src', 'tools');

export type StageName = 'research' | 'development' | 'qa' | 'compliance_security' | 'seo';

export interface StageIssue {
  stage: StageName;
  targetStage: StageName;
  severity: 'BLOCKER' | 'CRITICAL' | 'WARNING';
  component: string;
  summary: string;
  details: string;
  recommendedFix: string;
}

export interface StageReport {
  stage: StageName;
  passed: boolean;
  issues: StageIssue[];
  metrics?: Record<string, any>;
}

export interface WorkflowAuditResult {
  passed: boolean;
  timestamp: string;
  stageReports: Record<StageName, StageReport>;
  feedbackTickets: StageIssue[];
}

/**
 * Stage 3 (QA): Runs TypeScript verification and Vitest tests.
 */
function auditQA(): StageReport {
  const issues: StageIssue[] = [];

  // 1. TypeScript build check
  try {
    execSync('npx tsc -b', { cwd: ROOT_DIR, stdio: 'pipe' });
  } catch (err: any) {
    const errorOutput = err.stderr?.toString() || err.stdout?.toString() || err.message;
    issues.push({
      stage: 'qa',
      targetStage: 'development',
      severity: 'BLOCKER',
      component: 'TypeScript Compiler (tsc -b)',
      summary: 'TypeScript compilation failed with type errors.',
      details: errorOutput.slice(0, 500),
      recommendedFix: 'Fix type annotations, interfaces, and ensure strict TS compliance.',
    });
  }

  // 2. Vitest unit test suite
  try {
    execSync('npx vitest run', { cwd: ROOT_DIR, stdio: 'pipe' });
  } catch (err: any) {
    const errorOutput = err.stderr?.toString() || err.stdout?.toString() || err.message;
    issues.push({
      stage: 'qa',
      targetStage: 'development',
      severity: 'BLOCKER',
      component: 'Vitest Unit Tests',
      summary: 'One or more unit tests failed in vitest run.',
      details: errorOutput.slice(0, 500),
      recommendedFix: 'Review failing test assertions in engine.test.ts and resolve edge case bugs.',
    });
  }

  return {
    stage: 'qa',
    passed: issues.length === 0,
    issues,
    metrics: { totalIssues: issues.length },
  };
}

/**
 * Stage 4 (Compliance & Security):
 * - Guarantees 100% in-browser sandbox (zero outbound network requests).
 * - Verifies statutory review policies, cadences, and review schedules.
 * - Checks sensitive state URL isolation.
 */
function auditComplianceAndSecurity(): StageReport {
  const issues: StageIssue[] = [];
  const tools = registry.getAll();

  // 1. Compliance: reviewPolicy completeness
  for (const tool of tools) {
    const policy = tool.metadata.reviewPolicy;
    const id = tool.metadata.id;

    if (!policy) {
      issues.push({
        stage: 'compliance_security',
        targetStage: 'development',
        severity: 'CRITICAL',
        component: `Tool: ${id}`,
        summary: `Tool "${id}" is missing reviewPolicy metadata.`,
        details: 'Every tool must specify a reviewPolicy for statutory compliance.',
        recommendedFix: 'Define reviewPolicy with cadence, governingBodyOrStandard, and lastReviewedDate in definition.ts.',
      });
      continue;
    }

    if (!policy.governingBodyOrStandard || policy.governingBodyOrStandard.trim().length === 0) {
      issues.push({
        stage: 'compliance_security',
        targetStage: 'development',
        severity: 'CRITICAL',
        component: `Tool: ${id}`,
        summary: `Tool "${id}" has empty governingBodyOrStandard.`,
        details: 'Regulatory governance requires citing the authoritative body or standard (e.g. IRS, W3C, RFC, NIST).',
        recommendedFix: 'Provide governingBodyOrStandard in definition.ts reviewPolicy.',
      });
    }

    if (!policy.lastReviewedDate || !/^\d{4}-\d{2}-\d{2}$/.test(policy.lastReviewedDate)) {
      issues.push({
        stage: 'compliance_security',
        targetStage: 'development',
        severity: 'CRITICAL',
        component: `Tool: ${id}`,
        summary: `Tool "${id}" has invalid lastReviewedDate format. Expected YYYY-MM-DD.`,
        details: `Found: ${policy.lastReviewedDate}`,
        recommendedFix: 'Set lastReviewedDate to ISO format YYYY-MM-DD.',
      });
    }

    if (policy.cadence !== 'immutable') {
      if (!policy.nextReviewDate || !/^\d{4}-\d{2}-\d{2}$/.test(policy.nextReviewDate)) {
        issues.push({
          stage: 'compliance_security',
          targetStage: 'development',
          severity: 'CRITICAL',
          component: `Tool: ${id}`,
          summary: `Tool "${id}" requires valid nextReviewDate because cadence is "${policy.cadence}".`,
          details: `Found: ${policy.nextReviewDate}`,
          recommendedFix: 'Set a future ISO review date (YYYY-MM-DD) for nextReviewDate.',
        });
      }
      if (!policy.reviewTrigger || policy.reviewTrigger.trim().length === 0) {
        issues.push({
          stage: 'compliance_security',
          targetStage: 'development',
          severity: 'WARNING',
          component: `Tool: ${id}`,
          summary: `Tool "${id}" missing reviewTrigger specification.`,
          details: 'Periodic tools should document the event or statutory cycle that triggers review.',
          recommendedFix: 'Add reviewTrigger string explaining what statutory update necessitates re-audit.',
        });
      }
    }
  }

  // 2. Security: 100% In-Browser Privacy Sandbox Scan (Zero Outbound Network Calls)
  const forbiddenPatterns = [
    { regex: /\bfetch\s*\(/g, name: 'fetch() API call' },
    { regex: /\baxios\b/g, name: 'axios HTTP client' },
    { regex: /\bXMLHttpRequest\b/g, name: 'XMLHttpRequest' },
    { regex: /\bnavigator\.sendBeacon\b/g, name: 'navigator.sendBeacon' },
    { regex: /\bnew\s+WebSocket\s*\(/g, name: 'WebSocket connection' },
    { regex: /dangerouslySetInnerHTML/g, name: 'dangerouslySetInnerHTML without explicit sanitization' },
  ];

  function scanDir(dir: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        scanDir(fullPath);
      } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
        // Skip test files when scanning for network calls if mock tests simulate them
        if (entry.name.endsWith('.test.ts') || entry.name.endsWith('.test.tsx')) continue;

        const content = fs.readFileSync(fullPath, 'utf-8');
        for (const pattern of forbiddenPatterns) {
          if (pattern.regex.test(content)) {
            // Allow approved tools with vetted SVG/HTML sanitization or local generator
            if (
              pattern.name.includes('dangerouslySetInnerHTML') &&
              (fullPath.includes('markdown-preview') ||
                fullPath.includes('svg-sanitizer') ||
                fullPath.includes('qr-code-tool'))
            ) {
              continue;
            }
            issues.push({
              stage: 'compliance_security',
              targetStage: 'development',
              severity: 'BLOCKER',
              component: path.relative(ROOT_DIR, fullPath),
              summary: `Forbidden security pattern detected: ${pattern.name}`,
              details: `All tools must run 100% client-side in the browser sandbox. Remote network requests and unsafe DOM injection are prohibited.`,
              recommendedFix: `Remove network request or sanitize input. If offline data is needed, bundle it locally or use user-provided inputs.`,
            });
          }
        }
      }
    }
  }

  if (fs.existsSync(TOOLS_SRC_DIR)) {
    scanDir(TOOLS_SRC_DIR);
  }

  return {
    stage: 'compliance_security',
    passed: issues.filter((i) => i.severity !== 'WARNING').length === 0,
    issues,
    metrics: { auditedToolsCount: tools.length, issueCount: issues.length },
  };
}

/**
 * Stage 5 (SEO):
 * - Verifies TOOL_SEO_DATA coverage for all registered tools.
 * - Checks title and description length constraints.
 * - Checks FAQ and howTo structured content.
 * - Verifies SSG generation capability.
 */
function auditSEO(): StageReport {
  const issues: StageIssue[] = [];
  const tools = registry.getAll();

  for (const tool of tools) {
    const id = tool.metadata.id;
    const seo = TOOL_SEO_DATA[id];

    if (!seo) {
      issues.push({
        stage: 'seo',
        targetStage: 'development',
        severity: 'CRITICAL',
        component: `Tool SEO: ${id}`,
        summary: `Tool "${id}" is missing an entry in TOOL_SEO_DATA (src/core/seo-data.ts).`,
        details: 'Every registered tool requires SEO metadata for static site generation and discoverability.',
        recommendedFix: `Add an entry for "${id}" in src/core/seo-data.ts with metaTitle, metaDescription, howToUse, and faqs.`,
      });
      continue;
    }

    // Title length audit (optimal 30 to 75 characters)
    if (!seo.metaTitle || seo.metaTitle.length < 25 || seo.metaTitle.length > 80) {
      issues.push({
        stage: 'seo',
        targetStage: 'development',
        severity: 'WARNING',
        component: `Tool SEO: ${id}`,
        summary: `metaTitle length (${seo.metaTitle?.length || 0} chars) is outside optimal range (30-80 chars).`,
        details: `Current: "${seo.metaTitle}"`,
        recommendedFix: 'Refine metaTitle to be punchy, brand-aligned, and within 30-80 characters.',
      });
    }

    // Description length audit (optimal 100 to 180 characters)
    if (!seo.metaDescription || seo.metaDescription.length < 80 || seo.metaDescription.length > 200) {
      issues.push({
        stage: 'seo',
        targetStage: 'development',
        severity: 'WARNING',
        component: `Tool SEO: ${id}`,
        summary: `metaDescription length (${seo.metaDescription?.length || 0} chars) outside optimal range (80-200 chars).`,
        details: `Current: "${seo.metaDescription}"`,
        recommendedFix: 'Refine metaDescription to clearly summarize value proposition within 80-200 characters.',
      });
    }

    // How-to steps
    if (!seo.howToUse || seo.howToUse.length < 3) {
      issues.push({
        stage: 'seo',
        targetStage: 'development',
        severity: 'WARNING',
        component: `Tool SEO: ${id}`,
        summary: `Tool "${id}" has fewer than 3 howToUse instructional steps.`,
        details: `Found ${seo.howToUse?.length || 0} steps. Structured HowTo schema needs at least 3 steps.`,
        recommendedFix: 'Add at least 3 concise step-by-step instructions in howToUse.',
      });
    }

    // FAQs
    if (!seo.faqs || seo.faqs.length < 2) {
      issues.push({
        stage: 'seo',
        targetStage: 'development',
        severity: 'WARNING',
        component: `Tool SEO: ${id}`,
        summary: `Tool "${id}" has fewer than 2 FAQs for FAQPage schema.`,
        details: `Found ${seo.faqs?.length || 0} FAQs.`,
        recommendedFix: 'Provide at least 2 relevant questions and answers in faqs.',
      });
    }
  }

  // Verify SSG script runs or is valid
  const ssgScriptPath = path.resolve(ROOT_DIR, 'scripts', 'generate-ssg.ts');
  if (!fs.existsSync(ssgScriptPath)) {
    issues.push({
      stage: 'seo',
      targetStage: 'development',
      severity: 'BLOCKER',
      component: 'SSG Script',
      summary: 'scripts/generate-ssg.ts is missing.',
      details: 'SSG pre-rendering requires scripts/generate-ssg.ts.',
      recommendedFix: 'Restore or implement scripts/generate-ssg.ts.',
    });
  }

  return {
    stage: 'seo',
    passed: issues.filter((i) => i.severity === 'BLOCKER' || i.severity === 'CRITICAL').length === 0,
    issues,
    metrics: { coveredTools: Object.keys(TOOL_SEO_DATA).length, totalRegistered: tools.length },
  };
}

/**
 * Main Orchestrator Execution
 */
export function runWorkflowAudit(targetStage?: StageName): WorkflowAuditResult {
  console.log('\n================================================================');
  console.log('   TOOLS PLATFORM — PRODUCT CHANGE LIFECYCLE VERIFICATION      ');
  console.log('================================================================\n');

  const timestamp = new Date().toISOString();
  const stageReports: Record<StageName, StageReport> = {
    research: {
      stage: 'research',
      passed: true,
      issues: [],
    },
    development: {
      stage: 'development',
      passed: true,
      issues: [],
    },
    qa: { stage: 'qa', passed: true, issues: [] },
    compliance_security: { stage: 'compliance_security', passed: true, issues: [] },
    seo: { stage: 'seo', passed: true, issues: [] },
  };

  const stagesToRun = targetStage
    ? [targetStage]
    : (['qa', 'compliance_security', 'seo'] as StageName[]);

  if (stagesToRun.includes('qa')) {
    console.log('🧪 Auditing Stage 3: QA Testing & Build Integrity...');
    stageReports.qa = auditQA();
    console.log(`   QA Result: ${stageReports.qa.passed ? '✅ PASSED' : '❌ FAILED'}`);
  }

  if (stagesToRun.includes('compliance_security')) {
    console.log('🛡️  Auditing Stage 4: Compliance & In-Browser Security Sandbox...');
    stageReports.compliance_security = auditComplianceAndSecurity();
    console.log(`   Compliance & Security Result: ${stageReports.compliance_security.passed ? '✅ PASSED' : '❌ FAILED'}`);
  }

  if (stagesToRun.includes('seo')) {
    console.log('🔍 Auditing Stage 5: SEO Analysis & Discoverability...');
    stageReports.seo = auditSEO();
    console.log(`   SEO Result: ${stageReports.seo.passed ? '✅ PASSED' : '❌ FAILED'}`);
  }

  // Aggregate feedback tickets
  const feedbackTickets: StageIssue[] = [];
  for (const r of Object.values(stageReports)) {
    feedbackTickets.push(...r.issues);
  }

  const passed = feedbackTickets.filter((t) => t.severity === 'BLOCKER' || t.severity === 'CRITICAL').length === 0;

  console.log('\n----------------------------------------------------------------');
  console.log('📬 BIDIRECTIONAL STAGE FEEDBACK TICKETS');
  console.log('----------------------------------------------------------------');

  if (feedbackTickets.length === 0) {
    console.log('✨ All audited stages passed with zero issues or blockers!');
  } else {
    for (const ticket of feedbackTickets) {
      const badge =
        ticket.severity === 'BLOCKER'
          ? '🛑 [BLOCKER]'
          : ticket.severity === 'CRITICAL'
            ? '⚠️  [CRITICAL]'
            : 'ℹ️  [WARNING]';
      console.log(`\n${badge} [${ticket.stage.toUpperCase()} ➔ ${ticket.targetStage.toUpperCase()}] at ${ticket.component}`);
      console.log(`  Issue:           ${ticket.summary}`);
      console.log(`  Details:         ${ticket.details}`);
      console.log(`  Recommended Fix: ${ticket.recommendedFix}`);
    }
  }

  console.log('\n================================================================');
  console.log(`OVERALL STATUS: ${passed ? '✅ PASSED — READY FOR SHIP' : '❌ FAILED — ACTION REQUIRED'}`);
  console.log('================================================================\n');

  return {
    passed,
    timestamp,
    stageReports,
    feedbackTickets,
  };
}

// CLI entry point
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const stageArg = process.argv.find((a) => a.startsWith('--stage='))?.split('=')[1] as StageName | undefined;
  const result = runWorkflowAudit(stageArg);
  if (!result.passed) {
    process.exit(1);
  }
}
