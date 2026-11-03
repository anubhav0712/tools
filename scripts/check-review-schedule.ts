import { registry } from '../src/core/registry';
import '../src/tools'; // Register all tools

function runAudit() {
  console.log('\n================================================================');
  console.log('   TOOLS PLATFORM — BUSINESS LOGIC & STATUTORY COMPLIANCE AUDIT  ');
  console.log('================================================================\n');

  const todayStr = new Date().toISOString().split('T')[0];
  const summary = registry.getReviewScheduleSummary(todayStr);
  const periodicTools = registry.getToolsRequiringPeriodicReview();
  const immutableTools = registry.getImmutableTools();
  const overdue = registry.getOverdueReviews(todayStr);
  const upcoming90 = registry.getUpcomingReviews(90, todayStr);

  console.log(`Audited at: ${todayStr}`);
  console.log(`Total Registered Tools:         ${summary.total}`);
  console.log(`- Algorithmically Immutable:    ${summary.immutableCount} (no drift over time)`);
  console.log(`- Requiring Periodic Review:    ${summary.periodicReviewCount} (tax, laws, web standards)`);
  console.log(`- High Financial/Security Risk: ${summary.highRiskCount}`);
  console.log(`- Overdue Reviews:              ${summary.overdueCount}\n`);

  if (summary.unassignedCount > 0) {
    console.error(`⚠️  WARNING: ${summary.unassignedCount} tools are missing reviewPolicy in metadata!\n`);
  }

  console.log('----------------------------------------------------------------');
  console.log('📋 TOOLS REQUIRING PERIODIC BUSINESS LOGIC AUDIT');
  console.log('----------------------------------------------------------------');
  console.log(
    'ID'.padEnd(28) +
    'CADENCE'.padEnd(16) +
    'RISK'.padEnd(10) +
    'LAST REVIEW'.padEnd(14) +
    'NEXT REVIEW'.padEnd(14) +
    'GOVERNING BODY / STANDARD'
  );
  console.log('-'.repeat(100));

  for (const tool of periodicTools) {
    const p = tool.metadata.reviewPolicy!;
    console.log(
      tool.metadata.id.padEnd(28) +
      p.cadence.padEnd(16) +
      p.changeRisk.toUpperCase().padEnd(10) +
      p.lastReviewedDate.padEnd(14) +
      (p.nextReviewDate || 'TBD').padEnd(14) +
      p.governingBodyOrStandard.slice(0, 40)
    );
  }

  console.log('\n----------------------------------------------------------------');
  console.log('⏳ UPCOMING AUDITS (NEXT 90 DAYS)');
  console.log('----------------------------------------------------------------');
  if (upcoming90.length === 0) {
    console.log('No reviews scheduled within the next 90 days. All tools up to date.');
  } else {
    for (const item of upcoming90) {
      console.log(
        `• [${item.daysRemaining} days remaining] ${item.tool.metadata.name} (${item.tool.metadata.id})`
      );
      console.log(`  Trigger: ${item.tool.metadata.reviewPolicy?.reviewTrigger}`);
    }
  }

  if (overdue.length > 0) {
    console.log('\n----------------------------------------------------------------');
    console.log('🚨 OVERDUE REVIEWS (ACTION REQUIRED)');
    console.log('----------------------------------------------------------------');
    for (const item of overdue) {
      console.log(
        `❌ [${item.daysOverdue} days overdue] ${item.tool.metadata.name} (${item.tool.metadata.id})`
      );
    }
  }

  console.log('\n----------------------------------------------------------------');
  console.log(`🔒 IMMUTABLE SPECIFICATION TOOLS (${immutableTools.length})`);
  console.log('----------------------------------------------------------------');
  const immutableNames = immutableTools.map((t) => t.metadata.id).join(', ');
  console.log(immutableNames);
  console.log('\n================================================================\n');
}

runAudit();
