/**
 * Cost Tracker
 * ============
 * Real-time API cost tracking with budget limits
 */

// Pricing for Claude 3.5 Haiku (as of Nov 2024)
// Source: https://www.anthropic.com/pricing
const PRICING = {
  'claude-3-5-haiku-20241022': {
    input: 0.80 / 1_000_000,   // $0.80 per million input tokens
    output: 4.00 / 1_000_000   // $4.00 per million output tokens
  }
};

let currentCost = 0;
let totalInputTokens = 0;
let totalOutputTokens = 0;
let apiCallCount = 0;

// Default budget limit ($5)
let budgetLimit = 5.00;

/**
 * Set budget limit
 */
export function setBudgetLimit(limit) {
  budgetLimit = limit;
  console.log(`💰 Budget limit set to $${limit.toFixed(2)}`);
}

/**
 * Track an API call and calculate cost
 */
export function trackAPICall(model, inputTokens, outputTokens) {
  const pricing = PRICING[model];

  if (!pricing) {
    console.warn(`⚠️  Unknown model: ${model}, cannot track cost`);
    return currentCost;
  }

  const callCost = (inputTokens * pricing.input) + (outputTokens * pricing.output);
  currentCost += callCost;
  totalInputTokens += inputTokens;
  totalOutputTokens += outputTokens;
  apiCallCount++;

  // Check budget limit
  if (currentCost > budgetLimit) {
    throw new Error(
      `❌ BUDGET EXCEEDED: $${currentCost.toFixed(4)} > $${budgetLimit.toFixed(2)}\n` +
      `   Stop generation to prevent further costs.\n` +
      `   You can increase the limit with setBudgetLimit(newLimit)`
    );
  }

  return currentCost;
}

/**
 * Get current cost summary
 */
export function getCostSummary() {
  return {
    totalCost: currentCost,
    inputTokens: totalInputTokens,
    outputTokens: totalOutputTokens,
    totalTokens: totalInputTokens + totalOutputTokens,
    apiCalls: apiCallCount,
    budgetLimit: budgetLimit,
    budgetRemaining: budgetLimit - currentCost,
    percentUsed: (currentCost / budgetLimit) * 100
  };
}

/**
 * Format cost summary for display
 */
export function formatCostSummary() {
  const summary = getCostSummary();

  return `
╔════════════════════════════════════════════════════════════╗
║                    COST SUMMARY                            ║
╠════════════════════════════════════════════════════════════╣
║  Total Cost:           $${summary.totalCost.toFixed(4).padStart(10)}                   ║
║  Budget Limit:         $${summary.budgetLimit.toFixed(2).padStart(10)}                   ║
║  Budget Remaining:     $${summary.budgetRemaining.toFixed(4).padStart(10)}                   ║
║  Budget Used:          ${summary.percentUsed.toFixed(1).padStart(10)}%                   ║
║                                                            ║
║  Input Tokens:         ${summary.inputTokens.toLocaleString().padStart(10)}                   ║
║  Output Tokens:        ${summary.outputTokens.toLocaleString().padStart(10)}                   ║
║  Total Tokens:         ${summary.totalTokens.toLocaleString().padStart(10)}                   ║
║  API Calls:            ${summary.apiCalls.toString().padStart(10)}                   ║
╚════════════════════════════════════════════════════════════╝
`;
}

/**
 * Reset cost tracking (for new generation session)
 */
export function resetCostTracking() {
  currentCost = 0;
  totalInputTokens = 0;
  totalOutputTokens = 0;
  apiCallCount = 0;
  console.log('🔄 Cost tracking reset');
}

/**
 * Get formatted cost for inline display
 */
export function getInlineCost() {
  return `$${currentCost.toFixed(4)} / $${budgetLimit.toFixed(2)} (${((currentCost / budgetLimit) * 100).toFixed(1)}%)`;
}
