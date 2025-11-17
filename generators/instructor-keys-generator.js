/**
 * Instructor Answer Keys Generator
 * =================================
 * Generates complete solutions and grading rubrics for instructors
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

export async function generateInstructorKeys(outputDir, chapter, config) {
  console.log(`  Generating instructor answer keys...`);

  // Read exercises and quiz
  const exercises = await fs.readFile(path.join(outputDir, 'exercises.txt'), 'utf-8');
  const quiz = await fs.readFile(path.join(outputDir, 'quiz.txt'), 'utf-8');

  const prompt = `You are creating COMPREHENSIVE instructor answer keys and grading materials for a full-stack web development course.

🚨 CRITICAL REQUIREMENTS - THIS IS MANDATORY:

1. Generate COMPLETE, FULL-LENGTH solutions (target: 4-6KB minimum)
2. FULL working code for EVERY exercise - NO ellipsis (...), NO truncation
3. NEVER use placeholder comments like "// rest of code here" or "// implementation"
4. Every code block must be 100% complete and runnable
5. If approaching token limit, prioritize COMPLETE CODE SOLUTIONS over commentary

# Chapter Context

**Chapter ${chapter.number}: ${chapter.title}**

## Exercises

${exercises}

## Quiz

${quiz}

# Your Task

Generate COMPREHENSIVE instructor materials with COMPLETE, DETAILED solutions:

1. **Exercise Solutions** (MUST BE COMPLETE)
   - FULL working code for ALL exercises (no truncation, no ellipsis)
   - Step-by-step implementation explanations
   - Common student mistakes to watch for with examples
   - Detailed grading rubric with point breakdown per requirement
   - Code quality criteria (naming, structure, comments)

2. **Quiz Answer Key** (COMPREHENSIVE - WRITE DETAILED EXPLANATIONS)
   - Correct answers with EXTENSIVE technical explanations (2-3 paragraphs each)
   - Why EACH wrong answer is incorrect (specific technical reasons, 1 paragraph per wrong answer)
   - Partial credit guidelines with specific criteria and examples
   - Example student responses that would earn partial credit (include 2-3 actual example answers)
   - Common misconceptions to watch for with explanations

3. **Grading Guidelines** (ACTIONABLE AND DETAILED)
   - Realistic time estimates for grading each component
   - Specific things to look for in student submissions (provide detailed checklist for each exercise)
   - Red flags indicating copy/paste or incomplete understanding (with examples)
   - How to provide constructive feedback (include example feedback for common issues)
   - Quality vs. correctness balance (explain the grading philosophy)

4. **Extension Ideas** (CHALLENGE STUDENTS - PROVIDE FULL DESCRIPTIONS)
   - 3-5 bonus challenges for advanced students (each with full problem statement)
   - Real-world scenarios to discuss in class (provide discussion questions)
   - Industry connections to the chapter content (explain practical applications)
   - Additional resources for deeper learning

# Output Format

\`\`\`markdown
# Instructor Answer Keys - Chapter ${chapter.number}
# ${chapter.title}
# CONFIDENTIAL - For Instructor Use Only

## Exercise Solutions

### Exercise 1: [Title]

**Solution Code:**

\`\`\`typescript
// Complete working solution with comments
\`\`\`

**Implementation Notes:**
- Why this approach works
- Alternative approaches students might try
- Performance considerations

**Common Mistakes:**
1. [Mistake 1] - Students often forget to...
2. [Mistake 2] - Watch for...

**Grading Rubric (100 points):**
- Code compiles/runs (20 pts)
- Correct implementation (40 pts)
- Code quality (20 pts)
- Error handling (10 pts)
- Comments (10 pts)

---

### Exercise 2: [Title]

(Repeat for all exercises)

---

## Quiz Answer Key

### Question 1

**Correct Answer:** [Answer]

**Explanation:** [Why this is correct]

**Why Wrong Answers Are Wrong:**
- Option A: [Explanation]
- Option B: [Explanation]

**Partial Credit:**
- Give 50% if student mentions [key concept]

---

(Repeat for all quiz questions)

---

## Grading Time Estimates

- Exercise 1: 5 minutes
- Exercise 2: 8 minutes
- Quiz: 10 minutes
- **Total:** ~30 minutes per student

## Red Flags

Watch for these signs of incomplete understanding:
1. Code copied from examples without modification
2. Missing error handling (common copy/paste indicator)
3. Variable names don't match Parts-Co context
4. Can't explain design decisions

## Discussion Topics

Use these for in-class discussion:
1. [Real-world scenario related to exercises]
2. [Trade-offs in design decisions]
3. [Production considerations]

## Extension Challenges

For advanced students who finish early:
1. [Bonus challenge 1]
2. [Bonus challenge 2]
\`\`\`

Generate COMPLETE instructor materials with full code solutions.`;

  console.log(`  Multi-pass instructor keys generation (3 steps)...`);

  // PASS 1: Generate outline
  console.log(`    1/3 Generating instructor materials outline...`);

  const outlinePrompt = `Create a DETAILED outline for instructor answer keys for Chapter ${chapter.number}: ${chapter.title}.

The outline should include:
1. Exercise Solutions - List each exercise with:
   - Solution approach overview
   - Key code components to include
   - Common mistakes to cover
   - Grading rubric categories

2. Quiz Answer Key - List each question with:
   - Correct answer
   - Key concepts to explain
   - Wrong answer explanations needed

3. Grading Guidelines structure
4. Extension Ideas structure

Output as structured markdown outline showing what needs to be generated.`;

  const outlineMessage = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1500,
    temperature: 0.3,
    messages: [{ role: 'user', content: outlinePrompt }]
  });

  // Track cost
  try {
    const { trackAPICall } = await import('../utils/cost-tracker.js');
    trackAPICall('claude-3-5-haiku-20241022',
      outlineMessage.usage?.input_tokens || 0,
      outlineMessage.usage?.output_tokens || 0);
  } catch (error) {
    if (error.message.includes('BUDGET EXCEEDED')) throw error;
  }

  const outline = outlineMessage.content[0].text;

  // PASS 2: Generate exercise solutions (the most code-heavy part)
  console.log(`    2/3 Generating complete exercise solutions...`);

  const solutionsPrompt = `${prompt}

## Outline to Follow

${outline}

# Your Task

Generate COMPLETE EXERCISE SOLUTIONS ONLY with:

**For EACH exercise:**
1. FULL working code solution (COMPLETE, NO ellipsis, NO truncation)
2. Detailed implementation notes (2-3 paragraphs explaining the approach)
3. Common mistakes section (3-5 mistakes with examples)
4. Detailed grading rubric with point breakdown

Focus ONLY on exercise solutions. Make the code COMPLETE and COMPREHENSIVE.
Target: 3-4KB for this section alone.`;

  const solutionsMessage = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 8000,
    temperature: 0.3,
    messages: [{ role: 'user', content: solutionsPrompt }]
  });

  // Track cost
  try {
    const { trackAPICall } = await import('../utils/cost-tracker.js');
    trackAPICall('claude-3-5-haiku-20241022',
      solutionsMessage.usage?.input_tokens || 0,
      solutionsMessage.usage?.output_tokens || 0);
  } catch (error) {
    if (error.message.includes('BUDGET EXCEEDED')) throw error;
  }

  const exerciseSolutions = solutionsMessage.content[0].text;

  // PASS 3: Generate quiz answers, grading guidelines, and extensions
  console.log(`    3/3 Generating quiz answers and grading guidelines...`);

  const quizPrompt = `${prompt}

## Outline to Follow

${outline}

## Already Generated (DO NOT REPEAT)

Exercise solutions are complete.

# Your Task

Generate the following sections:

1. **Quiz Answer Key**
   - For EACH question: correct answer with 2-3 paragraph explanation
   - For EACH wrong answer: 1 paragraph why it's incorrect
   - Partial credit guidelines with examples
   - Common misconceptions (2-3 paragraphs)

2. **Grading Guidelines**
   - Time estimates for each component
   - Detailed checklist for grading (10-15 items)
   - Red flags with examples
   - Example constructive feedback

3. **Extension Ideas**
   - 3-5 bonus challenges (full problem statements)
   - Discussion questions (3-5 items)
   - Real-world applications
   - Additional resources

Target: 2-3KB for this section.`;

  const quizMessage = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 8000,
    temperature: 0.3,
    messages: [{ role: 'user', content: quizPrompt }]
  });

  // Track cost
  try {
    const { trackAPICall } = await import('../utils/cost-tracker.js');
    trackAPICall('claude-3-5-haiku-20241022',
      quizMessage.usage?.input_tokens || 0,
      quizMessage.usage?.output_tokens || 0);
  } catch (error) {
    if (error.message.includes('BUDGET EXCEEDED')) throw error;
  }

  const quizAndGuidelines = quizMessage.content[0].text;

  // Combine all sections
  const content = `${exerciseSolutions}

---

${quizAndGuidelines}`;

  // Check for ellipsis/truncation in code blocks
  const ellipsisCount = (content.match(/```[\s\S]*?\.\.\.[\s\S]*?```/g) || []).length;
  if (ellipsisCount > 0) {
    console.warn(`    ⚠️  Warning: ${ellipsisCount} code block(s) with "..." detected (possible truncation)`);
  }

  const output = `# Instructor Answer Keys - Chapter ${chapter.number}
# ${chapter.title}
# CONFIDENTIAL - For Instructor Use Only
# Generated: ${new Date().toISOString()}
# =====================================================

${content}
`;

  await fs.writeFile(path.join(outputDir, 'instructor-keys.txt'), output, 'utf-8');

  // Size check
  const sizeKB = (output.length / 1024).toFixed(1);
  if (output.length < 6000) {
    console.warn(`    ⚠️  Warning: Instructor keys only ${sizeKB}KB (expected 6-8KB)`);
  }

  return {
    generated: true,
    filepath: path.join(outputDir, 'instructor-keys.txt'),
    size: output.length
  };
}
