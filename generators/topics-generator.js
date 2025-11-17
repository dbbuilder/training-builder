/**
 * Topics Learned Generator
 * =========================
 * Generates concise summary of key topics covered in chapter
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function loadTemplate() {
  const templatePath = path.join(__dirname, '..', 'templates', 'topics-learned.yaml');
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  return yaml.parse(templateContent);
}

async function loadStyleGuide() {
  const stylePath = path.join(__dirname, '..', 'config', 'style-guide.yaml');
  const styleContent = await fs.readFile(stylePath, 'utf-8');
  return yaml.parse(styleContent);
}

function getRelatedChapters(chapter, config) {
  const related = [];

  // Previous chapter (for context)
  if (chapter.number > 1) {
    const prev = config.chapters.find(c => c.number === chapter.number - 1);
    if (prev) {
      related.push(`- **${prev.title}** (Chapter ${prev.number}) - Foundation for this chapter`);
    }
  }

  // Next chapter (for progression)
  const next = config.chapters.find(c => c.number === chapter.number + 1);
  if (next) {
    related.push(`- **${next.title}** (Chapter ${next.number}) - Building on what you learned`);
  }

  return related.length > 0 ? related.join('\n') : "- This is a standalone chapter";
}

export async function generateTopicsLearned(chapter, config) {
  const template = await loadTemplate();
  const styleGuide = await loadStyleGuide();
  const relatedChapters = getRelatedChapters(chapter, config);

  const prompt = `You are creating a concise summary of topics covered in a full-stack web development chapter.

# Your Task

Generate a Topics Learned summary for:

**Chapter ${chapter.number}: ${chapter.title}**

## Learning Objectives Covered

${chapter.learningObjectives.map(obj => `- ${obj}`).join('\n')}

## Topics from Curriculum

${chapter.topicsLearned.map(topic => `- ${topic}`).join('\n')}

## Structure

\`\`\`markdown
# Chapter ${chapter.number} Topics Learned

**${chapter.title}**

Quick reference of key concepts covered in this chapter.

---

## Core Concepts

- **{Concept 1}**: {1-2 sentence description}
- **{Concept 2}**: {Description}
- **{Concept 3}**: {Description}

## Technical Skills

- **{Skill 1}**: {What you can now do}
- **{Skill 2}**: {What you can now do}
- **{Skill 3}**: {What you can now do}

## Tools & Technologies

- **{Tool 1}**: {Purpose and usage}
- **{Tool 2}**: {Purpose and usage}

## Parts-Co Application Features

- **{Feature 1}**: {What you built}
- **{Feature 2}**: {What you built}

## Best Practices

- **{Practice 1}**: {Why it matters}
- **{Practice 2}**: {Why it matters}

---

## Related Topics

${relatedChapters}

---

## What You Can Now Do

✅ {Capability 1}
✅ {Capability 2}
✅ {Capability 3}
✅ {Capability 4}
✅ {Capability 5}
\`\`\`

## Requirements

1. **5-10 topics total** across all categories
2. **Format:** **{Bold topic name}**: {1-2 sentence description}
3. **Description length:** 20-40 words
4. **Present tense:** "provides", "enables", "allows"
5. **Concrete capabilities:** Specific things student can now do

## Categories

**Core Concepts:** Fundamental ideas and theory
- Example: "**Type Safety**: Ensuring frontend and backend types match automatically without code generation"

**Technical Skills:** Practical abilities acquired
- Example: "**Creating tRPC procedures**: Define type-safe API endpoints with input validation"

**Tools & Technologies:** Software introduced
- Example: "**tRPC**: Type-safe RPC framework for client-server communication"

**Parts-Co Features:** Functionality built
- Example: "**Parts catalog API**: tRPC procedures for fetching and filtering auto parts data"

**Best Practices:** Recommended approaches
- Example: "**Server-first rendering**: Fetch data on server to reduce client JavaScript bundle size"

**Capabilities (What You Can Now Do):** 5-8 concrete abilities
- Format: ✅ {Action verb} {specific thing}
- Example: "✅ Set up tRPC in a Next.js 14 project"

## Parts-Co Context

Use realistic auto parts e-commerce features:
- Entities: Manufacturer, Category, Part, Supplier, Warehouse, Inventory, Customer, Order
- Features built: parts catalog, inventory checking, cart management, order processing

Generate the COMPLETE Topics Learned summary NOW with 5-10 topics and 5-8 capabilities.`;

  console.log(`  Calling Claude API for topics summary generation...`);

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 4000,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = message.content[0].text;

  const output = `# Topics Learned - Chapter ${chapter.number}
# ${chapter.title}
# Generated: ${new Date().toISOString()}
# =====================================================

${content}
`;

  return output;
}
