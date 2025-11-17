/**
 * Quiz Generator
 * ===============
 * Generates 10-15 question quizzes with answers and explanations using Claude AI
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
  const templatePath = path.join(__dirname, '..', 'templates', 'quiz.yaml');
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  return yaml.parse(templateContent);
}

async function loadStyleGuide() {
  const stylePath = path.join(__dirname, '..', 'config', 'style-guide.yaml');
  const styleContent = await fs.readFile(stylePath, 'utf-8');
  return yaml.parse(styleContent);
}

export async function generateQuiz(chapter, config) {
  const template = await loadTemplate();
  const styleGuide = await loadStyleGuide();

  const prompt = `You are an expert curriculum developer creating assessment quizzes for a full-stack web development training program.

# Your Task

Generate a comprehensive quiz (10-15 questions) for:

**Chapter ${chapter.number}: ${chapter.title}**

## Learning Objectives (Quiz Should Test These)

${chapter.learningObjectives.map(obj => `- ${obj}`).join('\n')}

## Topics Covered

${chapter.topicsLearned.map(topic => `- ${topic}`).join('\n')}

## Quiz Distribution

**Total Questions:** 10-15

**Question Types:**
- Multiple Choice: 60% (6-9 questions)
  * 4 options (a, b, c, d)
  * 1 correct answer
  * 3 plausible distractors
  * Explanation for why correct AND why others wrong

- True/False: 20% (2-3 questions)
  * Clear, unambiguous statement
  * Explanation with context and nuance

- Short Answer: 20% (2-3 questions)
  * Requires 2-4 sentence answer
  * Model answer provided
  * Grading rubric with key points

**Difficulty:**
- Easy (recall/definitions): 40%
- Medium (apply/analyze): 40%
- Hard (synthesize/debug): 20%

**Categories:**
- Conceptual (What is...? Why...?): 30%
- Practical (Which code...? How to...?): 40%
- Troubleshooting (What's wrong...?): 20%
- Best Practices (Recommended way...?): 10%

## Parts-Co Integration

50% of questions should reference the Parts-Co auto parts e-commerce domain:
- Entities: Manufacturer, Category, Part, Supplier, Warehouse, Inventory, Customer, Order
- Scenarios: browsing catalog, adding to cart, checking inventory, processing orders

## Question Format Examples

**Multiple Choice:**
\`\`\`
### Question 1 (Multiple Choice)

What is tRPC primarily used for?

a) Database migrations
b) End-to-end type safety ✓
c) CSS styling
d) Image optimization

**Answer:** b) End-to-end type safety ✓

**Explanation:** tRPC provides end-to-end type safety between frontend and backend using TypeScript types without code generation. Database migrations (a) are handled by Prisma. CSS styling (c) uses Tailwind. Image optimization (d) is Next.js built-in feature.
\`\`\`

**True/False:**
\`\`\`
### Question 5 (True/False)

TypeScript eliminates the need for runtime validation with Zod.

- [ ] True
- [x] False ✓

**Answer:** False ✓

**Explanation:** While TypeScript provides compile-time type safety, it doesn't protect against runtime issues like malicious input from external sources. Zod performs runtime validation to ensure data conforms to expected schemas even after TypeScript compilation. Both are necessary.
\`\`\`

**Short Answer:**
\`\`\`
### Question 10 (Short Answer)

Explain the difference between Server Components and Client Components in Next.js 14.

**Model Answer:**

Server Components render on the server and send HTML to the client, reducing JavaScript bundle size. Client Components run in the browser and can use React hooks and event handlers. Use Server Components for data fetching, Client Components for interactivity.

**Grading Rubric:**

Full credit (2 points):
- Explains rendering location difference
- Identifies when to use each

Partial credit (1 point):
- Either rendering distinction OR usage guidance

No credit:
- Fundamental misunderstanding
\`\`\`

## Requirements

1. Test all learning objectives
2. Range from easy recall to complex application
3. Clear, unambiguous wording
4. Comprehensive explanations
5. Realistic Parts-Co scenarios
6. Include answer key at end

## Output Format

\`\`\`markdown
# Chapter ${chapter.number} Quiz: ${chapter.title}

**Instructions:**
- Answer all [N] questions
- Passing score: 70% ([X]/[N] correct)
- Multiple choice: Select the best answer
- True/False: Select one option
- Short answer: Write 2-4 sentences

---

### Question 1 (Multiple Choice)

[Question]

a) [Option]
b) [Option]
c) [Option]
d) [Option]

**Answer:** [Letter] ✓

**Explanation:** [Why correct and why others wrong]

---

(Continue for all questions...)

---

## Answer Key

1. b ✓
2. c ✓
3. a ✓
(etc.)

---

## Scoring Guide

**Your Score:** ____ / [N]

- [High range]: Excellent understanding
- [Pass range]: Good understanding, review missed questions
- Below [Pass]: Review chapter and retake
\`\`\`

Generate the COMPLETE quiz NOW with 10-15 questions covering all learning objectives.`;

  console.log(`  Calling Claude API for quiz generation...`);

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 8000,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = message.content[0].text;

  const output = `# Quiz - Chapter ${chapter.number}
# ${chapter.title}
# Generated: ${new Date().toISOString()}
# =====================================================

${content}
`;

  return output;
}
