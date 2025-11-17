/**
 * Book Chapter Generator
 * ======================
 * Generates 15-25 page technical book chapters using multi-pass approach
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
  const templatePath = path.join(__dirname, '..', 'templates', 'book-chapter.yaml');
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  return yaml.parse(templateContent);
}

async function loadStyleGuide() {
  const stylePath = path.join(__dirname, '..', 'config', 'style-guide.yaml');
  const styleContent = await fs.readFile(stylePath, 'utf-8');
  return yaml.parse(styleContent);
}

function getPreviousChapterContext(chapter, config) {
  if (chapter.number === 1) {
    return "This is the first chapter - no previous content to reference.";
  }

  const prevChapter = config.chapters.find(c => c.number === chapter.number - 1);
  if (!prevChapter) return "Previous chapter not found.";

  return `Previous chapter: Chapter ${prevChapter.number}: ${prevChapter.title}
Topics covered: ${prevChapter.topicsLearned.slice(0, 5).join(', ')}`;
}

function getNextChapterPreview(chapter, config) {
  const nextChapter = config.chapters.find(c => c.number === chapter.number + 1);
  if (!nextChapter) return "This is the final chapter.";

  return `Next chapter: Chapter ${nextChapter.number}: ${nextChapter.title}`;
}

async function callClaude(prompt, maxTokens, temperature = 0.7) {
  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: maxTokens,
    temperature: temperature,
    messages: [{ role: 'user', content: prompt }]
  });

  // Track API cost
  try {
    const inputTokens = message.usage?.input_tokens || 0;
    const outputTokens = message.usage?.output_tokens || 0;
    trackAPICall('claude-3-5-haiku-20241022', inputTokens, outputTokens);
  } catch (error) {
    // If budget exceeded, throw error to stop generation
    if (error.message.includes('BUDGET EXCEEDED')) {
      throw error;
    }
    // Otherwise just warn and continue
    console.warn('⚠️  Cost tracking failed:', error.message);
  }

  return message.content[0].text;
}

export async function generateBookChapter(chapter, config) {
  const template = await loadTemplate();
  const styleGuide = await loadStyleGuide();
  const previousContext = getPreviousChapterContext(chapter, config);
  const nextPreview = getNextChapterPreview(chapter, config);

  console.log(`  Multi-pass generation (7 steps)...`);

  // PASS 1: Generate detailed outline
  console.log(`    1/7 Generating outline...`);
  const outlinePrompt = `You are an expert technical writer creating a detailed outline for a full-stack web development book chapter.

# Chapter to Outline

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

- Frontend: ${config.technologyStack.frontend.framework}, ${config.technologyStack.frontend.library}
- Backend: ${config.technologyStack.backend.framework}, ${config.technologyStack.backend.api}
- Database: ${config.technologyStack.database.name}

# Your Task

Generate a DETAILED outline for this chapter with:

1. **Front Matter**
   - Estimated reading time
   - Prerequisites (2-3 items)
   - Learning objectives (restate the above)

2. **Introduction** (2-3 paragraphs outline)
   - Opening hook
   - Why this topic matters
   - What you'll learn preview

3. **Main Content Sections** (3-5 major sections)
   - Section titles and subsections
   - Key concepts to explain in each
   - Code examples needed (with brief description)
   - Callout boxes (tips, warnings, notes)

4. **Hands-On Exercise** (2-4 pages)
   - What you'll build
   - Steps outline
   - Success criteria

5. **Summary**
   - Key takeaways (5-7 bullets)
   - Skills acquired

6. **What's Next**
   - Preview of next chapter

7. **Further Reading**
   - 3-5 official documentation links
   - 2-3 tutorial recommendations

Output as a detailed markdown outline with section headings and bullet points for content.`;

  const outline = await callClaude(outlinePrompt, 3000);

  // PASS 2-7: Generate each major section
  const sections = [
    { key: 'frontMatter', name: 'Front Matter & Introduction', tokens: 2000 },
    { key: 'section1', name: 'Main Content - Part 1 (Sections 1-2)', tokens: 8000 },
    { key: 'section2', name: 'Main Content - Part 2 (Sections 3-4)', tokens: 8000 },
    { key: 'section3', name: 'Main Content - Part 3 (Section 5 + Exercise)', tokens: 8000 },
    { key: 'summary', name: 'Summary, What\'s Next, Further Reading', tokens: 2000 }
  ];

  const sectionContent = {};

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    console.log(`    ${i + 2}/7 Generating ${section.name}...`);

    const sectionPrompt = `You are an expert technical writer expanding a section of a full-stack web development book chapter.

# Chapter Context

**Chapter ${chapter.number}: ${chapter.title}**

## Full Chapter Outline

${outline}

## Parts-Co Business Context

Use auto parts e-commerce scenarios throughout:
- Entities: Manufacturer, Category, Part, Supplier, Warehouse, Inventory, Customer, Order
- Real-world examples: browsing catalog, adding to cart, checking inventory, processing orders

## Writing Standards

**Tone:** ${styleGuide.tone.voice}
**Perspective:** ${styleGuide.tone.perspective}

**Paragraph Guidelines:**
- Length: 3-5 sentences (100-150 words)
- Structure: Topic sentence, supporting details, closing/transition
- Voice: Active voice, present tense

**Code Integration:**
- Complete, working code (no ellipsis)
- TypeScript/JavaScript with inline comments
- Under 30 lines per example
- Realistic Parts-Co variable names
- Explanation after each code block

**Callout Boxes:**
- 💡 **Tip:** Helpful shortcuts, best practices
- ⚠️ **Warning:** Common mistakes, gotchas
- 📝 **Note:** Additional context
- 💻 **Example:** Working code examples

# Your Task

Generate the **${section.name}** section of this chapter. Write COMPLETE content (no placeholders, no ellipsis).

${section.key === 'frontMatter' ? `
Include:
- # Chapter ${chapter.number}: ${chapter.title}
- Estimated Time with breakdown
- Prerequisites (2-3 items)
- Learning Objectives
- Introduction (2-3 full paragraphs)
` : ''}

${section.key === 'section1' ? `
Generate the first 1-2 major sections from the outline with:
- Complete explanations
- Code examples with full implementation
- Callout boxes
- Subsections
` : ''}

${section.key === 'section2' ? `
Generate the next 1-2 major sections from the outline with:
- Complete explanations
- Code examples with full implementation
- Callout boxes
- Subsections
` : ''}

${section.key === 'section3' ? `
Generate the final major section and hands-on exercise with:
- Complete section content
- Full exercise with step-by-step instructions
- Success criteria
- Troubleshooting section
` : ''}

${section.key === 'summary' ? `
Generate:
- ## Summary (5-7 key takeaways)
- ## What's Next (preview of Chapter ${chapter.number + 1})
- ## Further Reading (3-5 official docs, 2-3 tutorials with URLs)
` : ''}

Output in Markdown format. Write COMPLETE content - no placeholders.`;

    sectionContent[section.key] = await callClaude(sectionPrompt, section.tokens);
  }

  console.log(`    7/7 Combining sections...`);

  // Combine all sections
  const fullChapter = `# Book Chapter - Chapter ${chapter.number}
# ${chapter.title}
# Generated: ${new Date().toISOString()}
# =====================================================

${sectionContent.frontMatter}

---

${sectionContent.section1}

---

${sectionContent.section2}

---

${sectionContent.section3}

---

${sectionContent.summary}
`;

  return fullChapter;
}
