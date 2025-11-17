/**
 * PowerPoint Outline Generator
 * =============================
 * Generates 30-50 slide PowerPoint outlines for each chapter using Claude AI
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

// Load PowerPoint template
async function loadTemplate() {
  const templatePath = path.join(__dirname, '..', 'templates', 'powerpoint.yaml');
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  return yaml.parse(templateContent);
}

// Load style guide
async function loadStyleGuide() {
  const stylePath = path.join(__dirname, '..', 'config', 'style-guide.yaml');
  const styleContent = await fs.readFile(stylePath, 'utf-8');
  return yaml.parse(styleContent);
}

// Get previous chapter context
function getPreviousChapterContext(chapter, config) {
  if (chapter.number === 1) {
    return "This is the first chapter - no previous content to reference.";
  }

  const prevChapter = config.chapters.find(c => c.number === chapter.number - 1);
  if (!prevChapter) {
    return "Previous chapter not found.";
  }

  return `Previous chapter: Chapter ${prevChapter.number}: ${prevChapter.title}
Learning objectives covered:
${prevChapter.learningObjectives.map(obj => `- ${obj}`).join('\n')}

Key topics:
${prevChapter.topicsLearned.map(topic => `- ${topic}`).join('\n')}`;
}

// Get next chapter preview
function getNextChapterPreview(chapter, config) {
  const nextChapter = config.chapters.find(c => c.number === chapter.number + 1);

  if (!nextChapter) {
    return "This is the final chapter.";
  }

  return `Next chapter: Chapter ${nextChapter.number}: ${nextChapter.title}
Learning objectives:
${nextChapter.learningObjectives.slice(0, 3).map(obj => `- ${obj}`).join('\n')}`;
}

/**
 * Generate PowerPoint outline for a chapter
 */
export async function generatePowerPoint(chapter, config) {
  const template = await loadTemplate();
  const styleGuide = await loadStyleGuide();
  const previousContext = getPreviousChapterContext(chapter, config);
  const nextPreview = getNextChapterPreview(chapter, config);

  // Construct prompt for Claude
  const prompt = `You are an expert technical curriculum developer creating PowerPoint presentations for a full-stack web development training program.

# Your Task

Generate a complete PowerPoint outline (30-50 slides) for the following chapter:

**Chapter ${chapter.number}: ${chapter.title}**
Part: ${chapter.part}

## Learning Objectives

${chapter.learningObjectives.map(obj => `- ${obj}`).join('\n')}

## Topics to Cover

${chapter.topicsLearned.map(topic => `- ${topic}`).join('\n')}

## Context

${previousContext}

${nextPreview}

## Technology Stack

- Frontend: ${config.technologyStack.frontend.framework}, ${config.technologyStack.frontend.library}, ${config.technologyStack.frontend.styling}
- Backend: ${config.technologyStack.backend.framework}, ${config.technologyStack.backend.api}, ${config.technologyStack.backend.orm}
- Database: ${config.technologyStack.database.name} on ${config.technologyStack.database.deployment}

## Template Structure

Follow this structure:

1. Title slide with chapter number and title
2. Learning objectives (3-5 bullets)
3. Recap of previous chapter (2-3 slides if applicable)
4. Main content slides (25-40 slides):
   - Concept introduction slides
   - Code example slides
   - Architecture diagram slides
   - Comparison slides
   - Step-by-step how-to slides
   - Common pitfall slides
   - Best practice slides
5. Exercise preview (2-3 slides)
6. Summary slide (key takeaways)
7. Quiz preview slide
8. Next chapter preview slide

## PowerPoint Standards (from Style Guide)

${JSON.stringify(styleGuide.powerpoint_standards, null, 2)}

## Requirements

- **30-50 slides total**
- **Every slide must have:**
  - Slide number
  - Slide type
  - Content (bullets, code, diagram descriptions)
  - Speaker notes (what to say, demo ideas, common questions, time estimate)

- **Code examples:**
  - Use TypeScript/JavaScript syntax
  - Keep under 15 lines per slide
  - Include inline comments
  - Use realistic Parts-Co variable names (Part, Manufacturer, Order, etc.)

- **Diagrams:**
  - Provide text description for visual creation
  - Label components clearly
  - Show data flow

- **Tone:**
  - ${styleGuide.tone.voice}
  - ${styleGuide.tone.characteristics.join(', ')}

- **Parts-Co Context:**
  - Ground examples in auto parts e-commerce business
  - Use entities: Manufacturer, Category, Part, Supplier, Warehouse, Inventory, Customer, Order
  - Reference realistic scenarios (browsing catalog, adding to cart, checking inventory, processing orders)

## Output Format

Generate the PowerPoint outline in this exact format:

\`\`\`
# Chapter ${chapter.number}: ${chapter.title}

## Slide 1: Title Slide

**Type:** Title

CHAPTER ${chapter.number}: ${chapter.title}

Parts-Co E-Commerce Training System
From Database to Deployment

[Logo placeholder]

**Speaker Notes:**

Time: 1 minute

Talking Points:
- Welcome to Chapter ${chapter.number}
- Today we're covering [topic]
- This builds on [previous chapter concepts]

---

## Slide 2: Learning Objectives

**Type:** Learning Objectives

LEARNING OBJECTIVES

By the end of this chapter, you will be able to:

• [Objective 1]
• [Objective 2]
• [Objective 3]

**Speaker Notes:**

Time: 2 minutes

Talking Points:
- These are the concrete skills you'll gain
- [Emphasize most important objective]

Common Questions:
- [Anticipated student question]

---

(Continue for all 30-50 slides...)
\`\`\`

Generate complete, comprehensive PowerPoint outline NOW.`;

  // Call Claude API
  console.log(`  Calling Claude API for PowerPoint generation...`);

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 8000,
    temperature: 0.7,
    messages: [
      {
        role: 'user',
        content: prompt
      }
    ]
  });

  // Extract generated content
  const content = message.content[0].text;

  // Add metadata header
  const output = `# PowerPoint Outline - Chapter ${chapter.number}
# ${chapter.title}
# Generated: ${new Date().toISOString()}
# =====================================================

${content}
`;

  return output;
}
