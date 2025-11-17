# Updated Workflow Order - Revise & Extend Integration

## Current Workflow (v3.1)

```
1. Generate PowerPoint
2. Generate Book Chapter (multi-pass)
3. Generate Exercises (multi-pass)
4. Generate Q&A
5. Generate Quiz
6. Generate Topics
7. Check/Edit Workflow ← Quality checks here
8. Polish/Format Workflow ← But no fixes applied
9. Instructor Materials
10. Export Formats
```

**Problem:** Polish tries to "improve" incomplete content instead of completing it first.

---

## NEW Workflow (v3.2 - Revise & Extend)

```
1. Generate PowerPoint
2. Generate Book Chapter (multi-pass)
3. Generate Exercises (multi-pass)
4. Generate Q&A
5. Generate Quiz
6. Generate Topics
7. Check/Edit Workflow ← Quality checks
8. 🆕 REVISE & EXTEND WORKFLOW ← NEW: Complete incomplete content
9. Polish/Format Workflow ← Only polish COMPLETE content
10. Instructor Materials (multi-pass)
11. Export Formats
```

---

## Integration Points

### 1. After Check/Edit, Before Polish

The check/edit workflow already detects issues:
```
Found 3 issues:
  - [medium] exercises.txt: Incomplete schema definition (truncated with ellipsis)
  - [low] book-chapter.txt: Introduction lacks specific technical context
```

**NEW STEP:** Use these findings to trigger Revise & Extend

### 2. Polish Pre-Flight Check

Before polish starts, verify content is complete:
```javascript
// In polish-format.js - BEFORE any polishing

console.log(`\n──────────────────────────────────────────────────────────────────────`);
console.log(`POLISH/FORMAT PRE-FLIGHT CHECK`);
console.log(`──────────────────────────────────────────────────────────────────────\n`);

const needsEnhancement = [];

for (const component of componentsToPolish) {
  const content = await fs.readFile(path.join(outputDir, component.file), 'utf-8');

  // Quick quality checks
  const hasEllipsis = (content.match(/```[\s\S]*?\.\.\.[\s\S]*?```/g) || []).length > 0;
  const isTooSmall = component.file === 'instructor-keys.txt' && content.length < 6000;
  const hasPlaceholders = /\/\/\s*\.\.\.|\/\*\s*\.\.\.|\.\.\.[\s]*implementation/i.test(content);

  if (hasEllipsis || isTooSmall || hasPlaceholders) {
    needsEnhancement.push({
      file: component.file,
      issues: [
        hasEllipsis && 'Code blocks with ellipsis',
        isTooSmall && `Only ${(content.length / 1024).toFixed(1)}KB`,
        hasPlaceholders && 'Implementation placeholders'
      ].filter(Boolean)
    });
  }
}

if (needsEnhancement.length > 0) {
  console.log(`  ⚠️  ${needsEnhancement.length} component(s) need enhancement before polish:`);
  needsEnhancement.forEach(item => {
    console.log(`     ${item.file}: ${item.issues.join(', ')}`);
  });
  console.log(`\n  Triggering Revise & Extend workflow...\n`);

  // TRIGGER REVISE & EXTEND
  await reviseAndExtendWorkflow(outputDir, chapter, needsEnhancement);

  console.log(`  ✅ Enhancement complete. Ready for polish.\n`);
} else {
  console.log(`  ✅ All content complete. Proceeding with polish.\n`);
}
```

---

## File Changes Required

### 1. Create `workflows/revise-and-extend.js`

```javascript
/**
 * Revise & Extend Workflow
 * =========================
 * Intelligently enhances incomplete content before polish
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { trackAPICall } from '../utils/cost-tracker.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Quality Analyzer
 */
export function analyzeQuality(component, content) {
  const issues = [];

  // Check 1: Code block ellipsis (HIGH priority)
  const codeBlockEllipsis = Array.from(content.matchAll(/```[\s\S]*?\.\.\.[\s\S]*?```/g));
  if (codeBlockEllipsis.length > 0) {
    issues.push({
      type: 'code_ellipsis',
      priority: 'high',
      count: codeBlockEllipsis.length,
      locations: codeBlockEllipsis.map(m => ({
        start: m.index,
        snippet: m[0].substring(0, 100)
      }))
    });
  }

  // Check 2: Implementation placeholders
  const placeholders = Array.from(content.matchAll(/\/\/\s*\.\.\.|\/\*\s*\.\.\.|\.\.\.[\s]*implementation/gi));
  if (placeholders.length > 0) {
    issues.push({
      type: 'placeholders',
      priority: 'high',
      count: placeholders.length
    });
  }

  // Check 3: Size threshold
  const minSizes = {
    'instructor-keys.txt': 6000,
    'exercises.txt': 10000
  };

  if (minSizes[component] && content.length < minSizes[component]) {
    issues.push({
      type: 'size',
      priority: 'medium',
      actual: content.length,
      expected: minSizes[component],
      deficit: minSizes[component] - content.length
    });
  }

  // Check 4: Truncation indicators
  if (/\n#{2,}\s+\w+[^\n]*\n{2,}$/m.test(content)) {
    issues.push({
      type: 'truncation',
      priority: 'high',
      indicator: 'Empty section heading at end'
    });
  }

  return {
    needsEnhancement: issues.length > 0,
    issues,
    highPriority: issues.filter(i => i.priority === 'high').length,
    mediumPriority: issues.filter(i => i.priority === 'medium').length
  };
}

/**
 * Expand Code Placeholders
 */
async function expandCodePlaceholders(content, filename) {
  console.log(`    🔧 Expanding code placeholders in ${filename}...`);

  // Extract incomplete code blocks
  const incompleteBlocks = [];
  const regex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;

  while ((match = regex.exec(content)) !== null) {
    const code = match[2];
    if (/\.\.\.|\*\s*\.\.\.|implementation/i.test(code)) {
      incompleteBlocks.push({
        full: match[0],
        language: match[1] || 'text',
        code: code,
        start: match.index
      });
    }
  }

  if (incompleteBlocks.length === 0) return content;

  const prompt = `You are completing code examples that have placeholders.

CRITICAL RULES:
1. ONLY expand sections with "..." or "// implementation" or "/* ... */"
2. Keep ALL existing code exactly as-is
3. Write COMPLETE implementations (no new placeholders)
4. Match the coding style of existing code
5. Return ONLY the completed code blocks

INCOMPLETE CODE BLOCKS (${incompleteBlocks.length}):

${incompleteBlocks.map((block, i) => `
### Block ${i + 1} (${block.language}):
\`\`\`${block.language}
${block.code}
\`\`\`
`).join('\n')}

YOUR TASK:
For each block, provide the COMPLETE version with all placeholders fully implemented.
Return each block in order, starting with "### Block N:".`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 4000,
    temperature: 0.5,
    messages: [{ role: 'user', content: prompt }]
  });

  trackAPICall('claude-3-5-haiku-20241022',
    response.usage?.input_tokens || 0,
    response.usage?.output_tokens || 0);

  const completions = response.content[0].text;

  // Parse completions and replace in original content
  let enhanced = content;
  const completionBlocks = completions.matchAll(/```(\w+)?\n([\s\S]*?)```/g);

  let completionIndex = 0;
  for (const completion of completionBlocks) {
    if (completionIndex < incompleteBlocks.length) {
      const original = incompleteBlocks[completionIndex];
      const completed = `\`\`\`${completion[1] || original.language}\n${completion[2]}\`\`\``;
      enhanced = enhanced.replace(original.full, completed);
      completionIndex++;
    }
  }

  console.log(`       ✅ Completed ${completionIndex} code block(s)`);
  return enhanced;
}

/**
 * Add Missing Content (Size Enhancement)
 */
async function addMissingContent(content, filename, deficit) {
  console.log(`    📝 Adding content to ${filename} (need +${(deficit / 1024).toFixed(1)}KB)...`);

  const suggestions = [];

  if (filename === 'instructor-keys.txt') {
    if (!content.includes('Common Student Mistakes')) {
      suggestions.push('Common Student Mistakes section (5-7 items with examples)');
    }
    if (!content.includes('Extension Challenges')) {
      suggestions.push('Extension Challenges section (3-5 bonus activities)');
    }
    if (!content.includes('Red Flags')) {
      suggestions.push('Red Flags section (signs of incomplete understanding)');
    }
  }

  if (suggestions.length === 0) {
    suggestions.push('Additional examples and explanations');
  }

  const prompt = `You are extending educational materials to make them more comprehensive.

EXISTING CONTENT (${(content.length / 1024).toFixed(1)}KB):
This content is good and complete as-is. DO NOT modify or regenerate it.

YOUR TASK:
Add the following NEW sections to complement existing content:
${suggestions.map(s => `- ${s}`).join('\n')}

REQUIREMENTS:
1. Write complete sections (no placeholders)
2. Match the tone/style of existing content
3. Provide detailed, practical information
4. Target: ~${(deficit / 1024).toFixed(1)}KB of new content

OUTPUT:
Return ONLY the new sections (markdown format). They will be appended.

DO NOT include any preamble like "Here are the sections..." - start directly with the content.`;

  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: Math.min(deficit / 2, 4000), // Estimate tokens needed
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }]
  });

  trackAPICall('claude-3-5-haiku-20241022',
    response.usage?.input_tokens || 0,
    response.usage?.output_tokens || 0);

  const additions = response.content[0].text.trim();

  // Append new content
  const enhanced = `${content}\n\n---\n\n${additions}`;

  console.log(`       ✅ Added ${suggestions.length} section(s) (+${(additions.length / 1024).toFixed(1)}KB)`);
  return enhanced;
}

/**
 * Main Revise & Extend Function
 */
export async function reviseAndExtend(outputDir, component, chapter) {
  const filepath = path.join(outputDir, component);
  let content = await fs.readFile(filepath, 'utf-8');
  const originalSize = content.length;

  const analysis = analyzeQuality(component, content);

  if (!analysis.needsEnhancement) {
    return { enhanced: false, reason: 'No enhancement needed' };
  }

  console.log(`  📦 ${component}:`);
  console.log(`     Issues: ${analysis.highPriority} high, ${analysis.mediumPriority} medium`);

  let enhanced = content;

  // Fix high priority issues first
  for (const issue of analysis.issues.filter(i => i.priority === 'high')) {
    switch (issue.type) {
      case 'code_ellipsis':
      case 'placeholders':
        enhanced = await expandCodePlaceholders(enhanced, component);
        break;

      case 'truncation':
        // Could implement truncation completion here
        console.log(`     ⚠️  Truncation detected (skipping for now)`);
        break;
    }
  }

  // Fix medium priority issues
  for (const issue of analysis.issues.filter(i => i.priority === 'medium')) {
    switch (issue.type) {
      case 'size':
        enhanced = await addMissingContent(enhanced, component, issue.deficit);
        break;
    }
  }

  // Save enhanced version
  await fs.writeFile(filepath, enhanced, 'utf-8');

  const improvement = enhanced.length - originalSize;
  console.log(`     💾 Saved: ${(enhanced.length / 1024).toFixed(1)}KB (+${(improvement / 1024).toFixed(1)}KB)\n`);

  return {
    enhanced: true,
    originalSize,
    newSize: enhanced.length,
    improvement,
    issuesFixed: analysis.issues.length
  };
}

/**
 * Workflow Entry Point
 */
export async function reviseAndExtendWorkflow(outputDir, chapter, componentsToEnhance) {
  console.log(`──────────────────────────────────────────────────────────────────────`);
  console.log(`REVISE & EXTEND WORKFLOW`);
  console.log(`──────────────────────────────────────────────────────────────────────\n`);

  const results = [];

  for (const item of componentsToEnhance) {
    try {
      const result = await reviseAndExtend(outputDir, item.file, chapter);
      results.push({ file: item.file, ...result });
    } catch (error) {
      console.error(`  ❌ Error enhancing ${item.file}:`, error.message);
      results.push({ file: item.file, enhanced: false, error: error.message });
    }
  }

  const successCount = results.filter(r => r.enhanced).length;
  const totalImprovement = results.reduce((sum, r) => sum + (r.improvement || 0), 0);

  console.log(`✓ Revise & Extend completed`);
  console.log(`  Enhanced: ${successCount}/${results.length} components`);
  console.log(`  Total improvement: +${(totalImprovement / 1024).toFixed(1)}KB\n`);

  return results;
}
```

### 2. Update `workflows/polish-format.js`

Add this at the top, before the existing polish logic:

```javascript
// At the top of the file
import { reviseAndExtendWorkflow, analyzeQuality } from './revise-and-extend.js';

// ... existing imports ...

export async function polishAndFormat(outputDir, chapter, config) {
  console.log(`\n──────────────────────────────────────────────────────────────────────`);
  console.log(`POLISH/FORMAT PRE-FLIGHT CHECK`);
  console.log(`──────────────────────────────────────────────────────────────────────\n`);

  // Pre-flight quality check
  const componentsToPolish = [
    { file: 'powerpoint.txt', type: 'PowerPoint outline' },
    { file: 'book-chapter.txt', type: 'book chapter' },
    { file: 'exercises.txt', type: 'exercises' },
    { file: 'qa.txt', type: 'Q&A' },
    { file: 'quiz.txt', type: 'quiz' },
    { file: 'topics.txt', type: 'topics summary' }
  ];

  const needsEnhancement = [];

  for (const component of componentsToPolish) {
    const filepath = path.join(outputDir, component.file);

    try {
      const content = await fs.readFile(filepath, 'utf-8');
      const analysis = analyzeQuality(component.file, content);

      if (analysis.needsEnhancement) {
        needsEnhancement.push({
          file: component.file,
          analysis
        });
      }
    } catch (error) {
      console.warn(`  ⚠️  Could not check ${component.file}: ${error.message}`);
    }
  }

  // Trigger Revise & Extend if needed
  if (needsEnhancement.length > 0) {
    console.log(`  ⚠️  ${needsEnhancement.length} component(s) need enhancement:`);
    needsEnhancement.forEach(item => {
      console.log(`     ${item.file}: ${item.analysis.highPriority} high + ${item.analysis.mediumPriority} medium priority issues`);
    });
    console.log(`\n  🔧 Triggering Revise & Extend...\n`);

    await reviseAndExtendWorkflow(outputDir, chapter, needsEnhancement);
  } else {
    console.log(`  ✅ All content complete and ready for polish\n`);
  }

  // NOW proceed with existing polish logic
  console.log(`──────────────────────────────────────────────────────────────────────`);
  console.log(`POLISH/FORMAT WORKFLOW`);
  console.log(`──────────────────────────────────────────────────────────────────────\n`);

  // ... rest of existing polish code ...
}
```

---

## Expected Output

```
──────────────────────────────────────────────────────────────────────
POLISH/FORMAT PRE-FLIGHT CHECK
──────────────────────────────────────────────────────────────────────

  ⚠️  2 component(s) need enhancement:
     exercises.txt: 3 high + 0 medium priority issues
     instructor-keys.txt: 0 high + 1 medium priority issues

  🔧 Triggering Revise & Extend...

──────────────────────────────────────────────────────────────────────
REVISE & EXTEND WORKFLOW
──────────────────────────────────────────────────────────────────────

  📦 exercises.txt:
     Issues: 3 high, 0 medium
    🔧 Expanding code placeholders in exercises.txt...
       ✅ Completed 3 code block(s)
     💾 Saved: 12.4KB (+2.8KB)

  📦 instructor-keys.txt:
     Issues: 0 high, 1 medium
    📝 Adding content to instructor-keys.txt (need +2.1KB)...
       ✅ Added 3 section(s) (+2.3KB)
     💾 Saved: 8.2KB (+2.3KB)

✓ Revise & Extend completed
  Enhanced: 2/2 components
  Total improvement: +5.1KB

  ✅ All content complete and ready for polish

──────────────────────────────────────────────────────────────────────
POLISH/FORMAT WORKFLOW
──────────────────────────────────────────────────────────────────────

  Applying final polish and formatting...
  ...
```

---

## Summary

**Changes Required:**
1. ✅ Create `workflows/revise-and-extend.js`
2. ✅ Update `workflows/polish-format.js` - add pre-flight check
3. ✅ Import and call `reviseAndExtendWorkflow()` before polish

**Benefits:**
- Polish only works on complete content
- Automatic quality enhancement
- No manual intervention needed
- Clean workflow progression

**Estimated Implementation Time:** 1-2 hours
