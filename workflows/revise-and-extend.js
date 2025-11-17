/**
 * Revise & Extend Workflow
 * =========================
 * Enhances incomplete content rather than regenerating from scratch
 *
 * Philosophy: "The try was probably successful, but incomplete"
 * - NOT a retry mechanism
 * - Builds upon existing good content
 * - Targeted enhancements only
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import { trackAPICall } from '../utils/cost-tracker.js';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Analyze content quality and identify enhancement needs
 */
export function analyzeQuality(filename, content, minSize = null) {
  const enhancements = [];

  // Check 1: Code block ellipsis (HIGH PRIORITY)
  const codeEllipsisMatches = Array.from(content.matchAll(/```[\s\S]*?\.\.\.[\s\S]*?```/g));
  if (codeEllipsisMatches.length > 0) {
    enhancements.push({
      type: 'code_ellipsis',
      priority: 'high',
      count: codeEllipsisMatches.length,
      strategy: 'code_completion',
      message: `${codeEllipsisMatches.length} code blocks with ellipsis`
    });
  }

  // Check 2: Implementation placeholders (HIGH PRIORITY)
  const placeholderMatches = Array.from(content.matchAll(/\/\/\s*\.\.\.|\/\*\s*\.\.\.\s*\*\/|\.\.\.[\s]*implementation/gi));
  if (placeholderMatches.length > 0) {
    enhancements.push({
      type: 'placeholders',
      priority: 'high',
      count: placeholderMatches.length,
      strategy: 'code_completion',
      message: `${placeholderMatches.length} implementation placeholders`
    });
  }

  // Check 3: Size threshold (MEDIUM PRIORITY)
  if (minSize && content.length < minSize) {
    const deficit = minSize - content.length;
    enhancements.push({
      type: 'size',
      priority: 'medium',
      deficit: deficit,
      currentSize: content.length,
      targetSize: minSize,
      strategy: 'content_extension',
      message: `Only ${(content.length / 1024).toFixed(1)}KB (expected ${(minSize / 1024).toFixed(1)}KB+)`
    });
  }

  // Check 4: Truncation patterns (HIGH PRIORITY)
  const truncationPatterns = [
    /\n\n#{2,}\s+\w+[^\n]*\n{1,2}$/m,  // Heading with no content after
    /\*\*Step \d+:\*\*\s*\n{2,}/,      // Step with no instructions
    /```\w*\n\s*$/                      // Empty code block
  ];

  for (const pattern of truncationPatterns) {
    if (pattern.test(content)) {
      enhancements.push({
        type: 'truncation',
        priority: 'high',
        pattern: pattern.toString(),
        strategy: 'section_completion',
        message: 'Truncated section detected'
      });
      break; // Only report once
    }
  }

  return {
    needsEnhancement: enhancements.length > 0,
    enhancements,
    quality: calculateQualityScore(content, enhancements)
  };
}

/**
 * Calculate quality score (0-100)
 */
function calculateQualityScore(content, enhancements) {
  let score = 100;

  for (const enhancement of enhancements) {
    switch (enhancement.priority) {
      case 'high':
        score -= 20;
        break;
      case 'medium':
        score -= 10;
        break;
      case 'low':
        score -= 5;
        break;
    }
  }

  return Math.max(0, score);
}

/**
 * Strategy 1: Code Completion - Expand placeholders
 */
async function expandCodePlaceholders(outputDir, filename, enhancement, chapter) {
  console.log(`    🔧 Expanding code placeholders...`);

  const filePath = path.join(outputDir, filename);
  const content = await fs.readFile(filePath, 'utf-8');

  // Extract incomplete code blocks
  const codeBlocks = [];
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const code = match[2];
    if (/\.\.\.|\/\/\s*\.\.\.|implementation/i.test(code)) {
      codeBlocks.push({
        full: match[0],
        language: match[1] || 'text',
        code: code,
        index: match.index
      });
    }
  }

  if (codeBlocks.length === 0) {
    return { changes: 'No placeholders found', addedChars: 0 };
  }

  const prompt = `You are completing code examples in a technical tutorial.

IMPORTANT RULES:
1. ONLY expand sections marked with "..." or "// implementation" or similar placeholders
2. Keep ALL existing code exactly as-is
3. Match the coding style and patterns shown
4. Write COMPLETE, working code with NO ellipsis
5. Return ONLY the completed code blocks

CONTEXT:
Tutorial chapter: ${chapter.title}
Component: ${filename}

INCOMPLETE CODE BLOCKS:
${codeBlocks.map((block, i) => `
### Block ${i + 1} (${block.language}):
\`\`\`${block.language}
${block.code}
\`\`\`
`).join('\n')}

YOUR TASK:
For each block, provide the COMPLETE version with all placeholders replaced by full implementations.
Return each block in order, wrapped in code fences with the language specified.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 4000,
    temperature: 0.5,
    messages: [{ role: 'user', content: prompt }]
  });

  trackAPICall(
    'claude-3-5-haiku-20241022',
    message.usage?.input_tokens || 0,
    message.usage?.output_tokens || 0
  );

  const completedContent = message.content[0].text;

  // Simple merge: Replace original code blocks with completed versions
  let enhanced = content;
  const completedBlocks = Array.from(completedContent.matchAll(/```\w*\n([\s\S]*?)```/g));

  for (let i = 0; i < Math.min(codeBlocks.length, completedBlocks.length); i++) {
    enhanced = enhanced.replace(codeBlocks[i].full, completedBlocks[i][0]);
  }

  await fs.writeFile(filePath, enhanced, 'utf-8');

  return {
    changes: `Expanded ${codeBlocks.length} code placeholder(s)`,
    addedChars: enhanced.length - content.length
  };
}

/**
 * Strategy 2: Content Extension - Add missing sections
 */
async function addMissingSections(outputDir, filename, enhancement, chapter) {
  console.log(`    📝 Adding missing sections (target: +${(enhancement.deficit / 1024).toFixed(1)}KB)...`);

  const filePath = path.join(outputDir, filename);
  const content = await fs.readFile(filePath, 'utf-8');

  // Suggest sections based on component type
  const suggestions = suggestMissingSections(filename, content);

  const prompt = `You are extending instructor materials to make them more comprehensive.

EXISTING CONTENT (${(content.length / 1024).toFixed(1)}KB):
This content is GOOD and COMPLETE. Do not modify it.

YOUR TASK:
Add the following NEW sections to complement the existing content:
${suggestions.map(s => `- ${s}`).join('\n')}

REQUIREMENTS:
1. Write COMPLETE sections (no placeholders)
2. Match the tone and style of existing content
3. Provide detailed, practical information
4. Target: ${(enhancement.deficit / 1024).toFixed(1)}KB of additional content

CONTEXT:
Chapter: ${chapter.title}
Component: ${filename}

OUTPUT FORMAT:
Return ONLY the new sections (markdown formatted). They will be appended to existing content.`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 6000,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }]
  });

  trackAPICall(
    'claude-3-5-haiku-20241022',
    message.usage?.input_tokens || 0,
    message.usage?.output_tokens || 0
  );

  const additions = message.content[0].text;
  const enhanced = `${content}\n\n---\n\n${additions}`;

  await fs.writeFile(filePath, enhanced, 'utf-8');

  return {
    changes: `Added ${suggestions.length} section(s)`,
    addedChars: additions.length
  };
}

/**
 * Suggest missing sections based on component type
 */
function suggestMissingSections(filename, content) {
  const suggestions = [];

  if (filename === 'instructor-keys.txt') {
    if (!content.includes('Common Student Mistakes') && !content.includes('Common Mistakes')) {
      suggestions.push('Common Student Mistakes section (5-7 items with examples)');
    }
    if (!content.includes('Extension Challenges') && !content.includes('Bonus Activities')) {
      suggestions.push('Extension Challenges section (3-5 bonus activities for advanced students)');
    }
    if (!content.includes('Grading Checklist') && content.includes('Grading')) {
      suggestions.push('Detailed grading checklist (10-15 specific items to verify)');
    }
    if (!content.includes('Troubleshooting')) {
      suggestions.push('Troubleshooting Guide (5-7 common issues with solutions)');
    }
  }

  if (filename === 'exercises.txt') {
    const exerciseCount = (content.match(/## Exercise \d+:/g) || []).length;
    if (exerciseCount < 3) {
      suggestions.push(`Add ${3 - exerciseCount} more exercise(s) with complete instructions`);
    }
    if (!content.includes('Success Criteria')) {
      suggestions.push('Success Criteria sections for each exercise');
    }
  }

  return suggestions;
}

/**
 * Strategy 3: Section Completion - Continue truncated sections
 */
async function completeTruncatedSection(outputDir, filename, enhancement, chapter) {
  console.log(`    ✍️  Completing truncated section...`);

  const filePath = path.join(outputDir, filename);
  const content = await fs.readFile(filePath, 'utf-8');

  // Find truncation point (simple heuristic: last heading with no content)
  const truncationPoint = content.length - 100; // Last 100 chars

  const prompt = `You are completing a tutorial section that was cut off.

EXISTING CONTENT (COMPLETE):
${content.substring(0, Math.max(0, truncationPoint - 500))}
...

INCOMPLETE SECTION (continue from here):
${content.substring(Math.max(0, truncationPoint - 500))}

CONTEXT:
This is part of Chapter ${chapter.number}: ${chapter.title}
Component: ${filename}

YOUR TASK:
Continue from where it stopped and COMPLETE the section following the same format and style.
Provide full instructions, code examples, and explanations.

OUTPUT FORMAT:
Return ONLY the continuation (what comes after the last complete sentence).`;

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 4000,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }]
  });

  trackAPICall(
    'claude-3-5-haiku-20241022',
    message.usage?.input_tokens || 0,
    message.usage?.output_tokens || 0
  );

  const completion = message.content[0].text;
  const enhanced = content + '\n\n' + completion;

  await fs.writeFile(filePath, enhanced, 'utf-8');

  return {
    changes: 'Completed truncated section',
    addedChars: completion.length
  };
}

/**
 * Apply enhancement based on strategy
 */
async function applyEnhancement(outputDir, filename, enhancement, chapter) {
  switch (enhancement.strategy) {
    case 'code_completion':
      return await expandCodePlaceholders(outputDir, filename, enhancement, chapter);

    case 'content_extension':
      return await addMissingSections(outputDir, filename, enhancement, chapter);

    case 'section_completion':
      return await completeTruncatedSection(outputDir, filename, enhancement, chapter);

    default:
      throw new Error(`Unknown enhancement strategy: ${enhancement.strategy}`);
  }
}

/**
 * Main workflow function
 */
export async function reviseAndExtendWorkflow(outputDir, chapter, config) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`REVISE & EXTEND WORKFLOW`);
  console.log(`${'='.repeat(70)}\n`);

  const files = [
    { name: 'book-chapter.txt', minSize: null },
    { name: 'exercises.txt', minSize: 10000 },
    { name: 'instructor-keys.txt', minSize: 6000 },
    { name: 'qa-session.txt', minSize: null },
    { name: 'quiz.txt', minSize: null }
  ];

  const enhancementQueue = [];

  // Analyze each file for quality issues
  for (const file of files) {
    const filePath = path.join(outputDir, file.name);

    try {
      await fs.access(filePath);
      const content = await fs.readFile(filePath, 'utf-8');
      const analysis = analyzeQuality(file.name, content, file.minSize);

      if (analysis.needsEnhancement) {
        console.log(`  🔍 Quality Analysis: ${file.name}`);
        console.log(`     Quality Score: ${analysis.quality}/100`);
        console.log(`     Issues: ${analysis.enhancements.map(e => e.message).join(', ')}`);

        enhancementQueue.push({
          file: file.name,
          analysis
        });
      }
    } catch (error) {
      if (error.code !== 'ENOENT') {
        console.error(`     ❌ Error analyzing ${file.name}: ${error.message}`);
      }
    }
  }

  if (enhancementQueue.length === 0) {
    console.log(`  ✓ All content passes quality checks (no enhancements needed)\n`);
    return;
  }

  console.log(`\n  Enhancing ${enhancementQueue.length} file(s)...\n`);

  // Apply enhancements
  for (const item of enhancementQueue) {
    console.log(`  📦 ${item.file}:`);

    // Process high priority first, then medium
    const sortedEnhancements = item.analysis.enhancements.sort((a, b) => {
      const priority = { high: 0, medium: 1, low: 2 };
      return priority[a.priority] - priority[b.priority];
    });

    for (const enhancement of sortedEnhancements) {
      try {
        const result = await applyEnhancement(outputDir, item.file, enhancement, chapter);
        console.log(`     ✅ ${result.changes} (+${(result.addedChars / 1024).toFixed(1)}KB)`);
      } catch (error) {
        console.error(`     ❌ Enhancement failed: ${error.message}`);
      }
    }
  }

  console.log(`\n✓ Revise & Extend completed\n`);
}
