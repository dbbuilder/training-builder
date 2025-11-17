/**
 * Exercise Generator
 * ==================
 * Generates 3-5 hands-on coding exercises with step-by-step instructions
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';
import { fileURLToPath } from 'url';
import { trackAPICall } from '../utils/cost-tracker.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function loadTemplate() {
  const templatePath = path.join(__dirname, '..', 'templates', 'exercise.yaml');
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  return yaml.parse(templateContent);
}

async function loadStyleGuide() {
  const stylePath = path.join(__dirname, '..', 'config', 'style-guide.yaml');
  const styleContent = await fs.readFile(stylePath, 'utf-8');
  return yaml.parse(styleContent);
}

export async function generateExercises(chapter, config) {
  const template = await loadTemplate();
  const styleGuide = await loadStyleGuide();

  const prompt = `You are an expert coding instructor creating hands-on exercises for a full-stack web development training program.

⚠️ CRITICAL INSTRUCTIONS - READ CAREFULLY:
1. Generate COMPLETE working code - NO ellipsis (...), NO truncation, NO placeholders
2. Every code block must be copy-pasteable and runnable
3. Do NOT use comments like "// ... rest of code" or "// implementation here"
4. Write FULL implementations for every example
5. If you start to reach token limits, prioritize COMPLETE code over explanatory text

# Your Task

Generate 3-5 hands-on coding exercises for:

**Chapter ${chapter.number}: ${chapter.title}**

## Learning Objectives (Exercises Should Practice These)

${chapter.learningObjectives.map(obj => `- ${obj}`).join('\n')}

## Topics to Practice

${chapter.topicsLearned.map(topic => `- ${topic}`).join('\n')}

## Exercise Progression

**Exercise 1:** Easy - Foundation
- Practice single concept from chapter
- 30 minutes
- Example: Create first tRPC query procedure

**Exercise 2:** Medium - Application
- Combine multiple concepts
- 45 minutes
- Example: Build complete CRUD router with validation

**Exercise 3:** Medium-Hard - Integration
- Connect frontend and backend
- 60 minutes
- Example: Connect tRPC procedure to React component

**Exercise 4 (Optional):** Hard - Real-World
- Build production-ready feature
- 90 minutes
- Example: Complete parts catalog with filters and pagination

## Exercise Structure

For EACH exercise:

\`\`\`markdown
# Hands-On Exercise {N}: {Title}

## What You'll Build

[Clear description of end result]

[Visual description or expected outcome]

## Why This Matters

[How this reinforces chapter concepts]

[Real-world application in Parts-Co]

## Learning Goals

- {goal_1}
- {goal_2}
- {goal_3}

## Estimated Time

{X} minutes

---

## Prerequisites

- ✅ {prerequisite_1}
- ✅ {prerequisite_2}

---

## Instructions

**Part 1: {Phase Name}**

{High-level description}

**Step 1: {Task description}**

{Detailed instructions}

\`\`\`{language}
{complete_code_to_write}
\`\`\`

💡 **What this does:** {Explanation}

**Step 2: {Next task}**

{Instructions}

\`\`\`{language}
{code}
\`\`\`

⚠️ **Common mistake:** {Warning}

---

**Part 2: {Next Phase}**

(Continue...)

---

## Success Criteria

You'll know you've completed successfully when:

✅ {verification_1}
✅ {verification_2}
✅ {verification_3}
✅ {verification_4}

**Final check:** {comprehensive_test}

---

## Troubleshooting

### Problem: {Common error}

**Symptoms:**
- {symptom_1}
- {symptom_2}

**Likely cause:** {Explanation}

**Solution:**

1. {Fix step 1}
2. {Fix step 2}

---

### Problem: {Another issue}

(Repeat...)

---

## Going Further (Optional)

**Easy:** {extension_1}

**Medium:** {extension_2}

**Advanced:** {extension_3}
\`\`\`

## Requirements

1. **COMPLETE CODE - ABSOLUTELY NO TRUNCATION:**
   - Every code snippet must be FULLY implemented
   - NO ellipsis (...) ANYWHERE in code
   - NO placeholder comments like "// rest of implementation"
   - NO "// ... other methods here"
   - Write COMPLETE functions from start to finish

2. **Realistic Parts-Co examples:**
   - Entities: Manufacturer, Category, Part, Supplier, Warehouse, Inventory, Customer, Order
   - Features: browsing catalog, adding to cart, checking inventory, processing orders

3. **Clear instructions:** Numbered steps, one task per step
4. **Success criteria:** Specific, testable checkpoints
5. **Troubleshooting:** 3-5 most common problems with solutions
6. **Extensions:** Easy, medium, advanced optional challenges

## Code Standards

- Language: TypeScript/JavaScript
- Comments: Inline for complex logic
- Length: Keep snippets focused (under 50 lines) but COMPLETE
- Names: Realistic Parts-Co variable names (partId, manufacturerId, orderTotal)
- NEVER truncate - if code is long, that's fine as long as it's complete

## Tone

- Encouraging but not condescending
- Clear and specific instructions
- Acknowledge when something is challenging
- Celebrate progress

## FINAL REMINDER

Before submitting your response, verify:
✅ NO code block contains "..." (ellipsis)
✅ NO code block contains "// rest of implementation" or similar
✅ EVERY function is fully implemented
✅ EVERY code snippet can be copy-pasted and will run

Generate ALL 3-5 exercises NOW with COMPLETE instructions, COMPLETE code, and troubleshooting.`;

  console.log(`  Multi-pass exercise generation (3 steps)...`);

  // PASS 1: Generate outline with exercise titles and structure
  console.log(`    1/3 Generating exercise outline...`);

  const outlinePrompt = `Generate a DETAILED outline for 3-5 exercises for Chapter ${chapter.number}: ${chapter.title}.

For each exercise, provide:
- Exercise number and title
- Difficulty level and estimated time
- Learning goals (3-4 items)
- High-level structure (Parts 1-3 with brief descriptions)
- Success criteria (4-5 items)
- Common problems to troubleshoot (3-5 items)

Output as structured markdown outline.`;

  const outlineMessage = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 2000,
    temperature: 0.7,
    messages: [{ role: 'user', content: outlinePrompt }]
  });

  // Track cost
  try {
    trackAPICall('claude-3-5-haiku-20241022',
      outlineMessage.usage?.input_tokens || 0,
      outlineMessage.usage?.output_tokens || 0);
  } catch (error) {
    if (error.message.includes('BUDGET EXCEEDED')) throw error;
  }

  const outline = outlineMessage.content[0].text;

  // PASS 2-3: Generate complete exercises in batches
  console.log(`    2/3 Generating exercises 1-2 (full implementation)...`);

  const batch1Prompt = `${prompt}

## Exercise Outline to Expand

${outline}

# Your Task

Generate COMPLETE implementations for exercises 1-2 ONLY with:
- Full step-by-step instructions
- COMPLETE working code (NO ellipsis, NO truncation)
- Detailed explanations
- Troubleshooting sections

Focus ONLY on exercises 1-2. Make them COMPLETE and DETAILED.`;

  const batch1Message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 8000,
    temperature: 0.7,
    messages: [{ role: 'user', content: batch1Prompt }]
  });

  // Track cost
  try {
    trackAPICall('claude-3-5-haiku-20241022',
      batch1Message.usage?.input_tokens || 0,
      batch1Message.usage?.output_tokens || 0);
  } catch (error) {
    if (error.message.includes('BUDGET EXCEEDED')) throw error;
  }

  const exercises12 = batch1Message.content[0].text;

  console.log(`    3/3 Generating exercises 3-5 (full implementation)...`);

  const batch2Prompt = `${prompt}

## Exercise Outline to Expand

${outline}

## Already Generated (For Context Only - DO NOT REPEAT)

${exercises12.substring(0, 500)}... [exercises 1-2 already complete]

# Your Task

Generate COMPLETE implementations for exercises 3-5 with:
- Full step-by-step instructions
- COMPLETE working code (NO ellipsis, NO truncation)
- Detailed explanations
- Troubleshooting sections

Focus ONLY on exercises 3-5 (or 3-4 if only 4 exercises total). Make them COMPLETE and DETAILED.`;

  const batch2Message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 8000,
    temperature: 0.7,
    messages: [{ role: 'user', content: batch2Prompt }]
  });

  // Track cost
  try {
    trackAPICall('claude-3-5-haiku-20241022',
      batch2Message.usage?.input_tokens || 0,
      batch2Message.usage?.output_tokens || 0);
  } catch (error) {
    if (error.message.includes('BUDGET EXCEEDED')) throw error;
  }

  const exercises35 = batch2Message.content[0].text;

  // Combine all exercises
  const content = `${exercises12}

---

${exercises35}`;

  // Check for ellipsis/truncation
  const ellipsisCount = (content.match(/\.\.\./g) || []).length;
  if (ellipsisCount > 3) {
    console.warn(`    ⚠️  Warning: ${ellipsisCount} instances of "..." detected (possible truncation)`);
  }

  const output = `# Hands-On Exercises - Chapter ${chapter.number}
# ${chapter.title}
# Generated: ${new Date().toISOString()}
# =====================================================

${content}
`;

  return output;
}
