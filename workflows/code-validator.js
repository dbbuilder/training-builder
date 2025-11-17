/**
 * Code Validator
 * ==============
 * Validates that code examples actually compile/work
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Extract code blocks from markdown content
 */
function extractCodeBlocks(content) {
  const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
  const blocks = [];
  let match;

  while ((match = codeBlockRegex.exec(content)) !== null) {
    const language = match[1] || 'unknown';
    const code = match[2];
    blocks.push({ language, code, line: content.substring(0, match.index).split('\n').length });
  }

  return blocks;
}

/**
 * Validate TypeScript code
 */
async function validateTypeScript(code, tempDir) {
  const tempFile = path.join(tempDir, 'temp.ts');

  // Add common imports if not present
  let fullCode = code;
  if (!code.includes('import') && !code.includes('export')) {
    fullCode = `// Auto-added for validation\nimport type { NextApiRequest, NextApiResponse } from 'next';\n\n${code}`;
  }

  await fs.writeFile(tempFile, fullCode, 'utf-8');

  try {
    // Run TypeScript compiler in no-emit mode
    await execAsync(`npx tsc --noEmit --skipLibCheck --lib es2020 ${tempFile}`, {
      cwd: tempDir,
      timeout: 10000
    });
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      details: error.stderr || error.stdout
    };
  } finally {
    // Cleanup
    try {
      await fs.unlink(tempFile);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Validate JavaScript code
 */
async function validateJavaScript(code, tempDir) {
  const tempFile = path.join(tempDir, 'temp.js');
  await fs.writeFile(tempFile, code, 'utf-8');

  try {
    // Basic syntax check using node --check
    await execAsync(`node --check ${tempFile}`, {
      cwd: tempDir,
      timeout: 5000
    });
    return { valid: true };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      details: error.stderr || error.stdout
    };
  } finally {
    // Cleanup
    try {
      await fs.unlink(tempFile);
    } catch (e) {
      // Ignore cleanup errors
    }
  }
}

/**
 * Validate SQL code
 */
async function validateSQL(code) {
  // Basic SQL syntax validation (can be enhanced with actual DB)
  const forbiddenPatterns = [
    /DROP\s+DATABASE/i,
    /DROP\s+TABLE\s+(?!IF\s+EXISTS)/i, // Allow "DROP TABLE IF EXISTS"
    /TRUNCATE\s+TABLE/i,
    /DELETE\s+FROM.*WHERE\s+1\s*=\s*1/i // Dangerous DELETE patterns
  ];

  for (const pattern of forbiddenPatterns) {
    if (pattern.test(code)) {
      return {
        valid: false,
        error: 'Dangerous SQL pattern detected',
        details: `Pattern matched: ${pattern.toString()}`
      };
    }
  }

  // Check for basic SQL keywords
  const hasValidKeywords = /\b(SELECT|INSERT|UPDATE|DELETE|CREATE|ALTER)\b/i.test(code);

  if (!hasValidKeywords) {
    return {
      valid: false,
      error: 'No valid SQL keywords found',
      details: 'Code does not appear to be SQL'
    };
  }

  return { valid: true };
}

/**
 * Validate code block based on language
 */
async function validateCodeBlock(block, tempDir) {
  const { language, code } = block;

  // Skip validation for certain languages
  const skipLanguages = ['bash', 'shell', 'text', 'json', 'yaml', 'md', 'markdown'];
  if (skipLanguages.includes(language.toLowerCase())) {
    return { valid: true, skipped: true, reason: 'Language not validated' };
  }

  // Skip if code is too short (likely incomplete example)
  if (code.trim().length < 10) {
    return { valid: true, skipped: true, reason: 'Code too short' };
  }

  // Skip if code contains placeholder comments
  if (code.includes('// ...') || code.includes('/* ... */') || code.includes('...')) {
    return { valid: true, skipped: true, reason: 'Contains placeholders' };
  }

  switch (language.toLowerCase()) {
    case 'typescript':
    case 'ts':
    case 'tsx':
      return await validateTypeScript(code, tempDir);

    case 'javascript':
    case 'js':
    case 'jsx':
      return await validateJavaScript(code, tempDir);

    case 'sql':
    case 'postgresql':
    case 'postgres':
      return await validateSQL(code);

    default:
      return { valid: true, skipped: true, reason: `Unsupported language: ${language}` };
  }
}

/**
 * Validate all code in generated content
 */
export async function validateContent(outputDir, chapter) {
  console.log(`  Validating code examples...`);

  const results = {
    totalBlocks: 0,
    validated: 0,
    skipped: 0,
    passed: 0,
    failed: 0,
    errors: []
  };

  // Create temp directory for validation
  const tempDir = path.join(outputDir, '.code-validation-temp');
  await fs.mkdir(tempDir, { recursive: true });

  try {
    // Components to validate
    const components = [
      'book-chapter.txt',
      'exercises.txt',
      'qa.txt'
    ];

    for (const component of components) {
      const filepath = path.join(outputDir, component);

      try {
        const content = await fs.readFile(filepath, 'utf-8');
        const blocks = extractCodeBlocks(content);

        results.totalBlocks += blocks.length;

        for (const block of blocks) {
          const result = await validateCodeBlock(block, tempDir);

          if (result.skipped) {
            results.skipped++;
          } else {
            results.validated++;
            if (result.valid) {
              results.passed++;
            } else {
              results.failed++;
              results.errors.push({
                component,
                language: block.language,
                line: block.line,
                error: result.error,
                details: result.details
              });
            }
          }
        }

      } catch (error) {
        console.warn(`    ⚠️  Could not validate ${component}: ${error.message}`);
      }
    }

  } finally {
    // Cleanup temp directory
    try {
      await fs.rm(tempDir, { recursive: true, force: true });
    } catch (e) {
      // Ignore cleanup errors
    }
  }

  // Summary
  if (results.validated > 0) {
    const passRate = ((results.passed / results.validated) * 100).toFixed(1);
    console.log(`    Validated: ${results.validated} blocks (${results.skipped} skipped)`);
    console.log(`    Pass rate: ${passRate}% (${results.passed}/${results.validated})`);

    if (results.failed > 0) {
      console.log(`    ⚠️  ${results.failed} validation error(s) found`);
    }
  } else {
    console.log(`    ℹ️  No code blocks validated (${results.skipped} skipped)`);
  }

  return results;
}

/**
 * Generate validation report
 */
export function formatValidationReport(results) {
  let report = `
# Code Validation Report

## Summary
- **Total code blocks:** ${results.totalBlocks}
- **Validated:** ${results.validated}
- **Skipped:** ${results.skipped}
- **Passed:** ${results.passed}
- **Failed:** ${results.failed}
- **Pass rate:** ${results.validated > 0 ? ((results.passed / results.validated) * 100).toFixed(1) : 'N/A'}%

`;

  if (results.errors.length > 0) {
    report += `## Validation Errors\n\n`;

    for (const error of results.errors) {
      report += `### ${error.component} (Line ${error.line})\n`;
      report += `- **Language:** ${error.language}\n`;
      report += `- **Error:** ${error.error}\n`;
      if (error.details) {
        report += `- **Details:** \`\`\`\n${error.details}\n\`\`\`\n`;
      }
      report += `\n`;
    }
  }

  return report;
}
