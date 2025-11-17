/**
 * Markdown Formatter Workflow
 * ===========================
 * Applies consistent markdown formatting to generated content
 * for improved display and readability.
 *
 * NO AI CALLS - Pure text processing only
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Format markdown content with consistent styling
 */
export function formatMarkdown(content) {
  let formatted = content;

  // 1. Normalize line endings
  formatted = formatted.replace(/\r\n/g, '\n');

  // 2. Normalize heading spacing (2 blank lines before h1/h2, 1 before h3+)
  formatted = formatted.replace(/\n{0,2}(^|\n)(#{1,2})\s+(.+)$/gm, '\n\n\n$2 $3');
  formatted = formatted.replace(/\n{0,1}(^|\n)(#{3,6})\s+(.+)$/gm, '\n\n$2 $3');

  // 3. Ensure blank line before/after code blocks
  formatted = formatted.replace(/([^\n])\n```/g, '$1\n\n```');
  formatted = formatted.replace(/```\n([^\n])/g, '```\n\n$1');

  // 4. Add syntax highlighting hints to code blocks without language
  formatted = formatted.replace(/```\n((?:function|const|let|var|class|export|import)\s)/g, '```javascript\n$1');
  formatted = formatted.replace(/```\n((?:def|class|import|from)\s)/g, '```python\n$1');
  formatted = formatted.replace(/```\n((?:public|private|class|namespace|using)\s)/g, '```csharp\n$1');
  formatted = formatted.replace(/```\n((?:SELECT|INSERT|UPDATE|DELETE|CREATE)\s)/gi, '```sql\n$1');
  formatted = formatted.replace(/```\n((?:<\?php|<\?=))/g, '```php\n$1');
  formatted = formatted.replace(/```\n((?:<!DOCTYPE|<html|<div|<script))/gi, '```html\n$1');
  formatted = formatted.replace(/```\n((?:\{|\[)[\s\S]*(?:\}|\]))/g, '```json\n$1');

  // 5. Normalize list spacing (blank line before lists)
  formatted = formatted.replace(/([^\n])\n([*\-+]|\d+\.)\s+/g, '$1\n\n$2 ');

  // 6. Format ordered lists consistently (ensure numbering)
  const orderedListRegex = /^(\d+)\.\s+(.+)$/gm;
  let listCounter = 0;
  formatted = formatted.replace(orderedListRegex, (match, num, text) => {
    listCounter++;
    return `${listCounter}. ${text}`;
  });

  // 7. Normalize bold/italic markers (prefer ** and *)
  formatted = formatted.replace(/__(.*?)__/g, '**$1**'); // __ → **
  formatted = formatted.replace(/(?<!\*)_([^_]+?)_(?!\*)/g, '*$1*'); // _ → * (but not inside **)

  // 8. Add horizontal rules between major sections (before ## headings)
  formatted = formatted.replace(/\n\n(##\s+(?!#))/g, '\n\n---\n\n$1');

  // 9. Normalize spacing around blockquotes
  formatted = formatted.replace(/([^\n])\n(>)/g, '$1\n\n$2');
  formatted = formatted.replace(/(^>.*$)\n([^>\n])/gm, '$1\n\n$2');

  // 10. Format tables (ensure proper spacing)
  formatted = formatted.replace(/([^\n])\n(\|)/g, '$1\n\n$2');
  formatted = formatted.replace(/(\|.*\|)\n([^|\n])/g, '$1\n\n$2');

  // 11. Remove excessive blank lines (max 3 consecutive)
  formatted = formatted.replace(/\n{4,}/g, '\n\n\n');

  // 12. Ensure file ends with single newline
  formatted = formatted.replace(/\n*$/, '\n');

  // 13. Trim whitespace from line endings
  formatted = formatted.split('\n').map(line => line.trimEnd()).join('\n');

  return formatted;
}

/**
 * Add document header with metadata
 */
export function addDocumentHeader(content, metadata) {
  const header = `# ${metadata.title}

**Chapter ${metadata.chapterNumber}:** ${metadata.chapterTitle}
**Generated:** ${new Date().toISOString().split('T')[0]}
**Component:** ${metadata.component}

---

`;

  return header + content;
}

/**
 * Format code examples with consistent style
 */
export function formatCodeExamples(content) {
  // Add "Example:" prefix to code blocks that follow certain patterns
  const examplePattern = /(\n(?:Here'?s|Below is|The following shows?).*?:)\n\n```/gi;
  content = content.replace(examplePattern, '$1\n\n**Example:**\n\n```');

  // Add "Output:" prefix to code blocks showing results
  const outputPattern = /(Output|Result|Response):\n\n```/gi;
  content = content.replace(outputPattern, '**$1:**\n\n```');

  return content;
}

/**
 * Format exercise sections specifically
 */
export function formatExerciseDocument(content, chapterInfo) {
  let formatted = content;

  // Ensure consistent exercise numbering
  let exerciseNum = 0;
  formatted = formatted.replace(/^##+\s*Exercise\s*\d*:?\s*(.+)$/gmi, (match, title) => {
    exerciseNum++;
    return `## Exercise ${exerciseNum}: ${title.trim()}`;
  });

  // Format difficulty badges
  formatted = formatted.replace(/\*\*Difficulty:\*\*\s*(Easy|Medium|Hard|Advanced)/gi,
    (match, level) => `**Difficulty:** \`${level}\``);

  // Format time estimates
  formatted = formatted.replace(/\*\*(?:Estimated\s+)?Time:\*\*\s*(\d+)/gi,
    (match, time) => `**Estimated Time:** ⏱️ ${time} minutes`);

  // Format learning objectives as a list
  formatted = formatted.replace(/\*\*Learning Objectives?:\*\*\s*\n([^#]+)/gi,
    (match, objectives) => {
      const lines = objectives.trim().split('\n').map(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('-') && !trimmed.startsWith('*')) {
          return `- ${trimmed}`;
        }
        return trimmed;
      }).filter(Boolean).join('\n');
      return `**Learning Objectives:**\n\n${lines}\n`;
    });

  return formatMarkdown(formatted);
}

/**
 * Format instructor keys specifically
 */
export function formatInstructorDocument(content, chapterInfo) {
  let formatted = content;

  // Format grading sections
  formatted = formatted.replace(/\*\*Grading\s*(?:Criteria|Rubric|Guidelines?):\*\*/gi,
    '### Grading Criteria');

  // Format common mistakes sections
  formatted = formatted.replace(/\*\*Common\s*(?:Mistakes|Errors):\*\*/gi,
    '### Common Student Mistakes');

  // Format solution sections
  formatted = formatted.replace(/\*\*(?:Solution|Answer)\s*(?:for\s*)?(?:Exercise\s*)?\d*:?\*\*/gi,
    (match) => `### ${match.replace(/\*\*/g, '').trim()}`);

  // Add checkboxes to grading criteria
  formatted = formatted.replace(/(###\s*Grading\s*Criteria[\s\S]*?)\n-\s+(.+)/gm,
    '$1\n- [ ] $2');

  return formatMarkdown(formatted);
}

/**
 * Main workflow function
 */
export async function formatAllDocuments(outputDir, chapterInfo, config) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`MARKDOWN FORMATTING WORKFLOW`);
  console.log(`${'='.repeat(70)}\n`);

  const files = [
    {
      name: 'book-chapter.txt',
      type: 'book',
      addHeader: true,
      metadata: {
        title: chapterInfo.title,
        chapterNumber: chapterInfo.number,
        chapterTitle: chapterInfo.title,
        component: 'Book Chapter'
      }
    },
    {
      name: 'exercises.txt',
      type: 'exercises',
      addHeader: true,
      formatter: formatExerciseDocument,
      metadata: {
        title: `Exercises - ${chapterInfo.title}`,
        chapterNumber: chapterInfo.number,
        chapterTitle: chapterInfo.title,
        component: 'Exercises'
      }
    },
    {
      name: 'qa-session.txt',
      type: 'qa',
      addHeader: true,
      metadata: {
        title: `Q&A Session - ${chapterInfo.title}`,
        chapterNumber: chapterInfo.number,
        chapterTitle: chapterInfo.title,
        component: 'Q&A Session'
      }
    },
    {
      name: 'quiz.txt',
      type: 'quiz',
      addHeader: true,
      metadata: {
        title: `Quiz - ${chapterInfo.title}`,
        chapterNumber: chapterInfo.number,
        chapterTitle: chapterInfo.title,
        component: 'Quiz'
      }
    },
    {
      name: 'instructor-keys.txt',
      type: 'instructor',
      addHeader: true,
      formatter: formatInstructorDocument,
      metadata: {
        title: `Instructor Answer Keys - ${chapterInfo.title}`,
        chapterNumber: chapterInfo.number,
        chapterTitle: chapterInfo.title,
        component: 'Instructor Materials'
      }
    }
  ];

  let processedCount = 0;

  for (const file of files) {
    const filePath = path.join(outputDir, file.name);

    try {
      // Check if file exists
      await fs.access(filePath);

      console.log(`  📝 Formatting ${file.name}...`);

      // Read content
      let content = await fs.readFile(filePath, 'utf-8');
      const originalSize = content.length;

      // Apply specific formatter if defined
      if (file.formatter) {
        content = file.formatter(content, chapterInfo);
      } else {
        content = formatMarkdown(content);
      }

      // Format code examples
      content = formatCodeExamples(content);

      // Add document header if requested
      if (file.addHeader && file.metadata) {
        content = addDocumentHeader(content, file.metadata);
      }

      // Write formatted content back
      await fs.writeFile(filePath, content, 'utf-8');

      const newSize = content.length;
      const sizeDiff = newSize - originalSize;
      const diffSign = sizeDiff >= 0 ? '+' : '';

      console.log(`     ✅ Formatted (${(newSize / 1024).toFixed(1)}KB, ${diffSign}${sizeDiff} bytes)`);
      processedCount++;

    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log(`     ⏭️  Skipped (file not found)`);
      } else {
        console.error(`     ❌ Error: ${error.message}`);
      }
    }
  }

  console.log(`\n✓ Markdown formatting completed (${processedCount}/${files.length} files)\n`);
}
