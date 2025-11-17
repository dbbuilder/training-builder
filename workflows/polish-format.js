/**
 * Polish and Format Workflow
 * ===========================
 * AI-powered final formatting and professional polish
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function loadStyleGuide() {
  const stylePath = path.join(process.cwd(), 'config', 'style-guide.yaml');
  const styleContent = await fs.readFile(stylePath, 'utf-8');
  return yaml.parse(styleContent);
}

/**
 * Polish and format all generated content
 */
export async function polishAndFormat(outputDir, chapter, config) {
  console.log(`  Applying final polish and formatting...`);

  const styleGuide = await loadStyleGuide();

  const results = {
    componentsPolished: 0,
    changesApplied: [],
    timestamp: new Date().toISOString()
  };

  // Components to polish
  const components = [
    { file: 'powerpoint.txt', type: 'PowerPoint outline' },
    { file: 'book-chapter.txt', type: 'Book chapter' },
    { file: 'exercises.txt', type: 'Exercises' },
    { file: 'qa.txt', type: 'Q&A' },
    { file: 'quiz.txt', type: 'Quiz' },
    { file: 'topics.txt', type: 'Topics learned' }
  ];

  for (const component of components) {
    const filepath = path.join(outputDir, component.file);

    try {
      const content = await fs.readFile(filepath, 'utf-8');

      // Skip polishing if content is already substantial (likely already good)
      // This prevents the polish workflow from destroying well-generated content
      const skipThresholds = {
        'book-chapter.txt': 15000,  // Skip if >15KB
        'powerpoint.txt': 3500       // Skip if >3.5KB
      };

      const skipThreshold = skipThresholds[component.file];
      if (skipThreshold && content.length > skipThreshold) {
        console.log(`    ⏭️  Skipping ${component.file} (already ${(content.length / 1024).toFixed(1)}KB, no polish needed)`);
        results.changesApplied.push({
          component: component.file,
          originalLength: content.length,
          polishedLength: content.length,
          status: 'skipped-already-good'
        });
        continue;
      }

      const prompt = `You are a professional technical editor. Apply final polish to this ${component.type}.

CRITICAL INSTRUCTIONS:
- Return ONLY the polished content itself
- Do NOT include any meta-commentary like "I'll provide a polished version" or "Here's the polished content"
- Do NOT ask questions like "Would you like me to proceed?"
- Do NOT include preambles or explanations
- Start your response immediately with the actual content (e.g., the title or first line)

# Content to Polish

${content}

# Chapter Context

Chapter ${chapter.number}: ${chapter.title}
Previous chapter: ${chapter.number > 1 ? config.chapters[chapter.number - 2]?.title : 'None'}
Next chapter: ${chapter.number < 20 ? config.chapters[chapter.number]?.title : 'None'}

# Polish Tasks (Apply Minimally)

1. **Formatting:**
   - Fix any heading hierarchy issues
   - Ensure code blocks have proper language tags
   - Consistent bullet/list formatting

2. **Proofreading:**
   - Fix obvious typos only
   - Ensure terminology consistency
   - Fix broken markdown syntax

3. **DO NOT:**
   - Rewrite content unnecessarily
   - Remove or truncate sections
   - Change technical accuracy
   - Add unnecessary embellishments

# Output Format

Begin your response IMMEDIATELY with the actual content. For example:

For book chapters, start with: "# Chapter ${chapter.number}: ${chapter.title}"
For exercises, start with: "# Hands-On Exercises"
For other content, start with the actual first line of content.

NO preambles. NO questions. NO meta-commentary. Just the polished content.`;

      const message = await anthropic.messages.create({
        model: 'claude-3-5-haiku-20241022',
        max_tokens: 8000,
        temperature: 0.3,
        messages: [{ role: 'user', content: prompt }]
      });

      let polishedContent = message.content[0].text;

      // Safety check: If polished content is suspiciously short, keep original
      if (polishedContent.length < content.length * 0.5) {
        console.log(`    ⚠️  Polished ${component.file} suspiciously short (${polishedContent.length} vs ${content.length}), keeping original`);
        results.changesApplied.push({
          component: component.file,
          originalLength: content.length,
          polishedLength: content.length,
          status: 'rejected-too-short',
          attemptedLength: polishedContent.length
        });
        continue; // Don't overwrite the file
      }

      // Safety check: Detect meta-commentary responses
      const metaIndicators = [
        'I\'ll provide',
        'I\'ll polish',
        'Would you like',
        'Before I',
        'Let me',
        'I can',
        'May I clarify'
      ];

      const hasMetaCommentary = metaIndicators.some(indicator =>
        polishedContent.slice(0, 200).includes(indicator)
      );

      if (hasMetaCommentary) {
        console.log(`    ⚠️  Polished ${component.file} contains meta-commentary, keeping original`);
        results.changesApplied.push({
          component: component.file,
          originalLength: content.length,
          polishedLength: content.length,
          status: 'rejected-meta-commentary'
        });
        continue; // Don't overwrite the file
      }

      // Save polished version
      await fs.writeFile(filepath, polishedContent, 'utf-8');

      results.componentsPolished++;
      results.changesApplied.push({
        component: component.file,
        originalLength: content.length,
        polishedLength: polishedContent.length,
        status: 'polished'
      });

      console.log(`    ✓ Polished ${component.file}`);

    } catch (error) {
      console.log(`    ✗ Failed to polish ${component.file}: ${error.message}`);
      results.changesApplied.push({
        component: component.file,
        status: 'error',
        error: error.message
      });
    }
  }

  // Save polish report
  const reportPath = path.join(outputDir, 'polish-format-report.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2), 'utf-8');

  return results;
}
