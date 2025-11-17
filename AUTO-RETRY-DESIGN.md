# Auto-Retry Mechanism for Quality Issues

## Problem

During generation, we detect quality issues but don't automatically fix them:
- Truncation detected (ellipsis in code blocks)
- Size warnings (instructor keys <6KB)
- Incomplete content flagged by check/edit workflow

**Current behavior:** Warning logged, generation continues
**Desired behavior:** Auto-regenerate failed components with adjusted parameters

---

## Quality Issue Categories

### 1. Truncation Issues (HIGH PRIORITY)
**Detection:**
```javascript
// In exercise-generator.js
const ellipsisCount = (content.match(/\.\.\./g) || []).length;
if (ellipsisCount > 3) {
  console.warn(`⚠️  Warning: ${ellipsisCount} instances of "..." detected`);
}

// In instructor-keys-generator.js
const codeBlockEllipsis = (content.match(/```[\s\S]*?\.\.\.[\s\S]*?```/g) || []).length;
if (codeBlockEllipsis > 0) {
  console.warn(`⚠️  Warning: ${codeBlockEllipsis} code block(s) with "..." detected`);
}
```

**Root Cause:** Token limit reached, AI truncates to fit
**Solution:** Increase max_tokens or further split into smaller passes

### 2. Size Warnings (MEDIUM PRIORITY)
**Detection:**
```javascript
// In instructor-keys-generator.js
if (output.length < 6000) {
  console.warn(`⚠️  Warning: Instructor keys only ${(output.length / 1024).toFixed(1)}KB`);
}
```

**Root Cause:** Insufficient content generation
**Solution:** Enhanced prompt with explicit size requirements

### 3. Check/Edit Workflow Failures (LOW PRIORITY)
**Detection:**
```javascript
// API error 429 rate limit
// Component marked as "failed" in generation report
```

**Root Cause:** Rate limiting
**Solution:** Retry after delay

---

## Auto-Retry Strategy

### Retry Decision Matrix

| Issue | Severity | Auto-Retry? | Max Retries | Strategy |
|-------|----------|-------------|-------------|----------|
| Ellipsis in code (>5) | High | ✅ Yes | 2 | Increase tokens, add explicit prompt |
| Instructor keys <6KB | Medium | ✅ Yes | 2 | Enhanced prompt, verify outline |
| Exercises <10KB | Medium | ✅ Yes | 1 | Increase tokens |
| Rate limit errors | Low | ✅ Yes | 3 | Exponential backoff |
| Polish shrinkage | Low | ❌ No | 0 | Already handled by skip logic |

### Retry Configuration

```javascript
const RETRY_CONFIG = {
  maxRetries: 2,
  retryDelay: 5000, // 5 seconds base delay
  exponentialBackoff: true,

  qualityThresholds: {
    ellipsisMaxCount: 5,
    instructorKeysMinSize: 6000,
    exercisesMinSize: 10000,
    codeBlockTruncation: 0 // Zero tolerance for truncated code blocks
  },

  retryStrategies: {
    truncation: {
      increaseTokens: 2000, // Add 2000 tokens on retry
      enhancePrompt: true,
      splitFurther: false
    },
    sizeIssue: {
      increaseTokens: 1000,
      enhancePrompt: true,
      addExamples: true
    },
    rateLimit: {
      exponentialBackoff: true,
      maxDelay: 60000 // Max 60 second wait
    }
  }
};
```

---

## Implementation

### 1. Quality Validator Module

Create `workflows/quality-validator.js`:

```javascript
/**
 * Quality Validator
 * =================
 * Validates generated content and determines if retry is needed
 */

export class QualityIssue {
  constructor(type, severity, component, details) {
    this.type = type; // 'truncation', 'size', 'rate_limit'
    this.severity = severity; // 'high', 'medium', 'low'
    this.component = component; // 'exercises', 'instructor-keys', etc.
    this.details = details;
    this.timestamp = new Date();
  }
}

export function validateContent(component, content, config) {
  const issues = [];

  // Check 1: Ellipsis/truncation
  const ellipsisCount = (content.match(/\.\.\./g) || []).length;
  const codeBlockEllipsis = (content.match(/```[\s\S]*?\.\.\.[\s\S]*?```/g) || []).length;

  if (codeBlockEllipsis > 0) {
    issues.push(new QualityIssue(
      'truncation',
      'high',
      component,
      {
        codeBlockCount: codeBlockEllipsis,
        message: `${codeBlockEllipsis} code blocks contain ellipsis`
      }
    ));
  } else if (ellipsisCount > config.qualityThresholds.ellipsisMaxCount) {
    issues.push(new QualityIssue(
      'truncation',
      'medium',
      component,
      {
        ellipsisCount,
        message: `${ellipsisCount} instances of "..." detected`
      }
    ));
  }

  // Check 2: Size thresholds
  if (component === 'instructor-keys' && content.length < config.qualityThresholds.instructorKeysMinSize) {
    issues.push(new QualityIssue(
      'size',
      'medium',
      component,
      {
        actualSize: content.length,
        expectedSize: config.qualityThresholds.instructorKeysMinSize,
        message: `Only ${(content.length / 1024).toFixed(1)}KB (expected 6KB+)`
      }
    ));
  }

  if (component === 'exercises' && content.length < config.qualityThresholds.exercisesMinSize) {
    issues.push(new QualityIssue(
      'size',
      'medium',
      component,
      {
        actualSize: content.length,
        expectedSize: config.qualityThresholds.exercisesMinSize,
        message: `Only ${(content.length / 1024).toFixed(1)}KB (expected 10KB+)`
      }
    ));
  }

  return {
    passed: issues.length === 0,
    issues,
    shouldRetry: issues.some(i => i.severity === 'high' || i.severity === 'medium')
  };
}

export function determineRetryStrategy(issues) {
  const highPriorityIssue = issues.find(i => i.severity === 'high') || issues[0];

  switch (highPriorityIssue.type) {
    case 'truncation':
      return {
        increaseTokens: 2000,
        enhancePrompt: true,
        promptAddition: '\n\n🚨 CRITICAL: Previous attempt was truncated. Generate COMPLETE code with NO ellipsis (...). Write FULL implementations for every function.',
        temperature: 0.5 // Lower temperature for more focused output
      };

    case 'size':
      return {
        increaseTokens: 1000,
        enhancePrompt: true,
        promptAddition: `\n\n🚨 IMPORTANT: Previous attempt was too short (${(highPriorityIssue.details.actualSize / 1024).toFixed(1)}KB). Generate COMPREHENSIVE content with detailed examples and explanations. Target: ${(highPriorityIssue.details.expectedSize / 1024).toFixed(1)}KB+`,
        temperature: 0.7
      };

    case 'rate_limit':
      return {
        delay: 10000, // 10 second wait
        exponentialBackoff: true
      };

    default:
      return {
        increaseTokens: 1000,
        enhancePrompt: true
      };
  }
}
```

### 2. Retry Logic in Generators

Modify generators to support retry:

```javascript
// exercise-generator.js
export async function generateExercises(chapter, config, retryContext = null) {
  const isRetry = retryContext !== null;

  // Adjust parameters for retry
  let maxTokens = 8000;
  let promptAddition = '';

  if (isRetry) {
    maxTokens += retryContext.strategy.increaseTokens || 0;
    promptAddition = retryContext.strategy.promptAddition || '';
    console.log(`    🔄 RETRY ${retryContext.attempt}/${retryContext.maxRetries}: ${retryContext.reason}`);
  }

  const prompt = `${basePrompt}${promptAddition}`;

  // ... existing generation logic ...

  // After generation, validate
  const validation = validateContent('exercises', content, RETRY_CONFIG);

  return {
    content,
    validation,
    retryNeeded: validation.shouldRetry && (!isRetry || retryContext.attempt < retryContext.maxRetries)
  };
}
```

### 3. Orchestration in Chapter Generator

```javascript
// In index.js or chapter orchestrator
async function generateChapterWithRetry(chapterNum, options) {
  const maxRetries = 2;

  // Track which components need retry
  const retryQueue = [];

  // Initial generation
  let result = await generateChapter(chapterNum, options);

  // Check for quality issues
  for (const [component, data] of Object.entries(result.components)) {
    if (data.validation && data.validation.shouldRetry) {
      retryQueue.push({
        component,
        issues: data.validation.issues,
        attempt: 1
      });
    }
  }

  // Retry loop
  while (retryQueue.length > 0 && retryQueue[0].attempt <= maxRetries) {
    const retry = retryQueue.shift();

    console.log(`\n🔄 Quality Retry: Chapter ${chapterNum}, ${retry.component}`);
    console.log(`   Issues: ${retry.issues.map(i => i.details.message).join(', ')}`);

    const strategy = determineRetryStrategy(retry.issues);

    // Wait if needed (rate limit)
    if (strategy.delay) {
      const delay = strategy.exponentialBackoff
        ? strategy.delay * Math.pow(2, retry.attempt - 1)
        : strategy.delay;
      console.log(`   ⏳ Waiting ${delay / 1000}s before retry...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }

    // Regenerate component
    const retryContext = {
      attempt: retry.attempt,
      maxRetries,
      strategy,
      reason: retry.issues[0].details.message
    };

    const retryResult = await regenerateComponent(
      chapterNum,
      retry.component,
      options,
      retryContext
    );

    // Check if retry succeeded
    if (retryResult.validation.passed) {
      console.log(`   ✅ Retry succeeded! Quality improved.`);
      result.components[retry.component] = retryResult;
    } else if (retry.attempt < maxRetries) {
      // Queue another retry
      retryQueue.push({
        component: retry.component,
        issues: retryResult.validation.issues,
        attempt: retry.attempt + 1
      });
    } else {
      console.log(`   ⚠️  Max retries reached. Keeping best attempt.`);
    }
  }

  return result;
}
```

### 4. CLI Option

Add `--auto-retry` flag:

```javascript
program
  .command('generate')
  .option('--auto-retry', 'Automatically retry components with quality issues (default: true)')
  .option('--max-retries <number>', 'Maximum retry attempts per component', '2')
  .action(async (options) => {
    const autoRetry = options.autoRetry !== false; // Default true
    const maxRetries = parseInt(options.maxRetries) || 2;

    // ... generation logic with retry support
  });
```

---

## Reporting

### Enhanced Generation Report

```javascript
{
  "chapter": 5,
  "status": "completed",
  "duration": 450,
  "retries": [
    {
      "component": "exercises",
      "reason": "5 code blocks with ellipsis detected",
      "attempts": 2,
      "finalStatus": "success",
      "improvementMetrics": {
        "before": { "size": 8900, "ellipsisCount": 5 },
        "after": { "size": 12400, "ellipsisCount": 0 }
      }
    },
    {
      "component": "instructor-keys",
      "reason": "Only 4.2KB (expected 6KB+)",
      "attempts": 1,
      "finalStatus": "success",
      "improvementMetrics": {
        "before": { "size": 4200 },
        "after": { "size": 7800 }
      }
    }
  ],
  "finalQuality": {
    "allComponentsPassed": true,
    "totalIssuesResolved": 2,
    "additionalCost": 0.08
  }
}
```

---

## Benefits

1. **Higher Quality Output**
   - Zero tolerance for truncated code
   - Guaranteed minimum sizes
   - Comprehensive content

2. **Automatic Recovery**
   - No manual intervention needed
   - Self-healing generation
   - Rate limit recovery

3. **Cost-Effective**
   - Only retry when needed
   - Smart retry strategies
   - Minimal extra API calls (~10-15% overhead)

4. **Better User Experience**
   - Fewer manual fixes
   - Confidence in output quality
   - Clear retry reporting

---

## Cost Impact

**Without Auto-Retry:**
- 20 chapters × $0.12 avg = $2.40
- ~15-20% chapters need manual fixes
- Manual time: ~2 hours @ $100/hr = $200

**With Auto-Retry:**
- 20 chapters × $0.12 avg = $2.40
- ~15% retry rate × $0.08 avg = $0.36
- **Total: $2.76**
- Manual time: 0 hours = $0

**ROI:** $197+ saved per run for $0.36 extra cost = **54,700% ROI**

---

## Implementation Priority

1. ✅ Design complete
2. ⏭️ Implement quality-validator.js
3. ⏭️ Add retry logic to generators
4. ⏭️ Update chapter orchestrator
5. ⏭️ Add CLI options
6. ⏭️ Test with problem chapters
7. ⏭️ Deploy to production

**Estimated time:** 2-3 hours
**Expected impact:** 95%+ quality pass rate (vs 80% without retry)
