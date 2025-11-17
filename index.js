#!/usr/bin/env node

/**
 * Training Builder - Main Entry Point
 * ====================================
 * Automated curriculum generator using Claude AI
 *
 * Usage:
 *   node index.js generate --chapter 1
 *   node index.js generate --all
 *   node index.js validate --chapter 1
 */

import 'dotenv/config';
import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Import generators
import { generatePowerPoint } from './generators/powerpoint-generator.js';
import { generateBookChapter } from './generators/chapter-generator.js';
import { generateQuiz } from './generators/quiz-generator.js';
import { generateQA } from './generators/qa-generator.js';
import { generateExercises } from './generators/exercise-generator.js';
import { generateTopicsLearned } from './generators/topics-generator.js';
import { generatePPTX } from './generators/pptx-generator.js';
import { generateLMSPackage } from './generators/lms-package-generator.js';
import { generateInstructorKeys } from './generators/instructor-keys-generator.js';

// Import workflows
import { checkAndEdit } from './workflows/check-edit.js';
import { reviseAndExtendWorkflow } from './workflows/revise-and-extend.js';
import { polishAndFormat } from './workflows/polish-format.js';
import { formatAllDocuments } from './workflows/markdown-formatter.js';
import { validateContent } from './workflows/validator.js';

// Import utilities
import { saveCheckpoint, getStartingChapter, clearCheckpoint } from './utils/checkpoint.js';

// Load configuration
async function loadConfig() {
  const curriculumPath = path.join(__dirname, 'config', 'curriculum.json');
  const curriculum = JSON.parse(await fs.readFile(curriculumPath, 'utf-8'));
  return curriculum;
}

// Create output directory for chapter
async function ensureOutputDir(chapterNumber) {
  const outputDir = path.join(__dirname, 'output', `chapter-${String(chapterNumber).padStart(2, '0')}`);
  await fs.mkdir(outputDir, { recursive: true });
  return outputDir;
}

// Generate all components for a single chapter
async function generateChapter(chapterNumber, options = {}) {
  console.log(chalk.blue.bold(`\n${'='.repeat(70)}`));
  console.log(chalk.blue.bold(`Generating Chapter ${chapterNumber}`));
  console.log(chalk.blue.bold(`${'='.repeat(70)}\n`));

  const startTime = Date.now();

  try {
    // Load configuration
    const config = await loadConfig();
    const chapter = config.chapters.find(c => c.number === chapterNumber);

    if (!chapter) {
      throw new Error(`Chapter ${chapterNumber} not found in curriculum.json`);
    }

    // Create output directory
    const outputDir = await ensureOutputDir(chapterNumber);
    console.log(chalk.gray(`Output directory: ${outputDir}\n`));

    // Component generation status (PHASE 1: CONTENT GENERATION)
    const components = [
      { name: 'PowerPoint Outline', filename: 'powerpoint.txt', generator: generatePowerPoint },
      { name: 'Book Chapter', filename: 'book-chapter.txt', generator: generateBookChapter },
      { name: 'Exercises', filename: 'exercises.txt', generator: generateExercises },
      { name: 'Q&A / FAQ', filename: 'qa.txt', generator: generateQA },
      { name: 'Quiz', filename: 'quiz.txt', generator: generateQuiz },
      { name: 'Topics Learned', filename: 'topics.txt', generator: generateTopicsLearned },
      {
        name: 'Instructor Materials',
        filename: 'instructor-keys.txt',
        generator: async (chapter, config) => {
          // generateInstructorKeys writes directly to file, returns {generated, filepath, size}
          await generateInstructorKeys(outputDir, chapter, config);
          // Read the content back since the pipeline expects content string
          return await fs.readFile(path.join(outputDir, 'instructor-keys.txt'), 'utf-8');
        }
      }
    ];

    const results = {
      chapter: chapterNumber,
      title: chapter.title,
      components: {},
      timings: {},
      errors: []
    };

    // Generate each component
    for (const component of components) {
      const componentStart = Date.now();

      process.stdout.write(chalk.cyan(`Generating ${component.name}... `));

      try {
        const content = await component.generator(chapter, config);
        const filepath = path.join(outputDir, component.filename);
        await fs.writeFile(filepath, content, 'utf-8');

        const duration = ((Date.now() - componentStart) / 1000).toFixed(2);
        results.timings[component.name] = duration;
        results.components[component.name] = {
          status: 'success',
          filepath,
          size: content.length,
          duration
        };

        // Content validation
        const warnings = [];
        if (component.name === 'Book Chapter' && content.length < 8000) {
          warnings.push(`Content unexpectedly short (${content.length} bytes, expected >8000)`);
        }
        if (content.includes('...') && component.name !== 'PowerPoint Outline') {
          warnings.push('Content may contain truncated code (ellipsis found)');
        }

        if (warnings.length > 0) {
          results.components[component.name].warnings = warnings;
          console.log(chalk.green(`✓ (${duration}s, ${(content.length / 1024).toFixed(1)}KB)`) + chalk.yellow(` ⚠ ${warnings.length} warning(s)`));
        } else {
          console.log(chalk.green(`✓ (${duration}s, ${(content.length / 1024).toFixed(1)}KB)`));
        }

      } catch (error) {
        console.log(chalk.red(`✗ ${error.message}`));
        results.errors.push({
          component: component.name,
          error: error.message
        });
        results.components[component.name] = {
          status: 'error',
          error: error.message
        };
      }
    }

    // PHASE 2: QUALITY ASSURANCE

    // Check/Edit workflow (if not skipped)
    if (!options.skipCheck && results.errors.length === 0) {
      console.log(chalk.yellow(`\n${'─'.repeat(70)}`));
      console.log(chalk.yellow.bold('CHECK/EDIT WORKFLOW'));
      console.log(chalk.yellow(`${'─'.repeat(70)}\n`));

      try {
        const checkResults = await checkAndEdit(outputDir, chapter, config);
        results.checkEdit = checkResults;
        console.log(chalk.green(`✓ Check/Edit completed\n`));
      } catch (error) {
        console.log(chalk.red(`✗ Check/Edit failed: ${error.message}\n`));
        results.checkEdit = { status: 'error', error: error.message };
      }
    }

    // Revise & Extend workflow (if not skipped) - NEW in v3.2
    if (!options.skipRevise && results.errors.length === 0) {
      try {
        await reviseAndExtendWorkflow(outputDir, chapter, config);
        results.reviseExtend = { status: 'success' };
      } catch (error) {
        console.log(chalk.red(`✗ Revise & Extend failed: ${error.message}\n`));
        results.reviseExtend = { status: 'error', error: error.message };
      }
    }

    // Polish/Format workflow (if not skipped)
    if (!options.skipPolish && results.errors.length === 0) {
      console.log(chalk.yellow(`${'─'.repeat(70)}`));
      console.log(chalk.yellow.bold('POLISH/FORMAT WORKFLOW'));
      console.log(chalk.yellow(`${'─'.repeat(70)}\n`));

      try {
        const polishResults = await polishAndFormat(outputDir, chapter, config);
        results.polish = polishResults;
        console.log(chalk.green(`✓ Polish/Format completed\n`));
      } catch (error) {
        console.log(chalk.red(`✗ Polish/Format failed: ${error.message}\n`));
        results.polish = { status: 'error', error: error.message };
      }
    }

    // Markdown Formatting workflow (if not skipped) - NEW in v3.2
    if (!options.skipFormatting && results.errors.length === 0) {
      try {
        await formatAllDocuments(outputDir, chapter, config);
        results.markdownFormat = { status: 'success' };
      } catch (error) {
        console.log(chalk.red(`✗ Markdown Formatting failed: ${error.message}\n`));
        results.markdownFormat = { status: 'error', error: error.message };
      }
    }

    // PHASE 3: EXPORT

    // Generate PowerPoint PPTX file
    if (!options.skipExport && results.errors.length === 0) {
      console.log(chalk.yellow(`${'─'.repeat(70)}`));
      console.log(chalk.yellow.bold('EXPORT FORMATS'));
      console.log(chalk.yellow(`${'─'.repeat(70)}\n`));

      try {
        const pptxPath = path.join(outputDir, `chapter-${String(chapterNumber).padStart(2, '0')}.pptx`);
        const outlinePath = path.join(outputDir, 'powerpoint.txt');

        process.stdout.write(chalk.cyan(`  Generating PowerPoint file... `));
        const pptxResults = await generatePPTX(outlinePath, pptxPath, {
          number: chapterNumber,
          title: chapter.title
        });
        console.log(chalk.green(`✓ ${pptxResults.slidesGenerated} slides (${(pptxResults.fileSize / 1024).toFixed(1)}KB)`));

        results.pptx = pptxResults;
      } catch (error) {
        console.log(chalk.red(`✗ Failed: ${error.message}`));
        results.pptx = { status: 'error', error: error.message };
      }

      // Generate LMS packages
      try {
        process.stdout.write(chalk.cyan(`  Generating LMS packages... `));
        const lmsResults = await generateLMSPackage(outputDir, {
          number: chapterNumber,
          title: chapter.title
        }, 'all');

        const formats = Object.keys(lmsResults);
        console.log(chalk.green(`✓ ${formats.length} formats (${formats.join(', ')})`));

        results.lms = lmsResults;
      } catch (error) {
        console.log(chalk.red(`✗ Failed: ${error.message}`));
        results.lms = { status: 'error', error: error.message };
      }

      console.log('');
    }

    // Save generation report
    const reportPath = path.join(outputDir, 'generation-report.json');
    await fs.writeFile(reportPath, JSON.stringify(results, null, 2), 'utf-8');

    // Summary
    const totalTime = ((Date.now() - startTime) / 1000).toFixed(2);
    console.log(chalk.blue.bold(`\n${'='.repeat(70)}`));
    console.log(chalk.green.bold(`✓ Chapter ${chapterNumber} generated successfully in ${totalTime}s`));

    if (results.errors.length > 0) {
      console.log(chalk.red(`  ${results.errors.length} component(s) failed`));
    }

    console.log(chalk.gray(`  Report saved to: ${reportPath}`));
    console.log(chalk.blue.bold(`${'='.repeat(70)}\n`));

    return results;

  } catch (error) {
    console.error(chalk.red.bold(`\n✗ Failed to generate chapter ${chapterNumber}:`));
    console.error(chalk.red(error.message));
    console.error(chalk.gray(error.stack));
    throw error;
  }
}

// Generate all chapters
async function generateAllChapters(options = {}) {
  const config = await loadConfig();
  const totalChapters = config.chapters.length;

  console.log(chalk.blue.bold(`\n${'='.repeat(70)}`));
  console.log(chalk.blue.bold(`Generating All ${totalChapters} Chapters`));
  if (options.parallel) {
    console.log(chalk.yellow(`⚡ PARALLEL MODE: ${options.parallel} concurrent chapters`));
  }
  console.log(chalk.blue.bold(`${'='.repeat(70)}\n`));

  const results = [];
  const startTime = Date.now();

  // Parallel generation
  if (options.parallel) {
    const PARALLEL_LIMIT = parseInt(options.parallel) || 4;

    // Create batches of chapters
    const chapterBatches = [];
    for (let i = 0; i < config.chapters.length; i += PARALLEL_LIMIT) {
      chapterBatches.push(config.chapters.slice(i, i + PARALLEL_LIMIT));
    }

    console.log(chalk.cyan(`Generating ${totalChapters} chapters in ${chapterBatches.length} batches of up to ${PARALLEL_LIMIT}...\n`));

    for (let batchIndex = 0; batchIndex < chapterBatches.length; batchIndex++) {
      const batch = chapterBatches[batchIndex];
      console.log(chalk.yellow(`\n📦 Batch ${batchIndex + 1}/${chapterBatches.length}: Chapters ${batch.map(c => c.number).join(', ')}\n`));

      // Generate all chapters in batch concurrently
      const batchPromises = batch.map(async (chapter) => {
        try {
          const result = await generateChapter(chapter.number, options);
          return result;
        } catch (error) {
          console.error(chalk.red(`Skipping chapter ${chapter.number} due to error: ${error.message}\n`));
          return {
            chapter: chapter.number,
            status: 'error',
            error: error.message
          };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      results.push(...batchResults);

      // Brief pause between batches to avoid rate limiting
      if (batchIndex < chapterBatches.length - 1) {
        console.log(chalk.gray(`\n⏸️  Pausing 5 seconds before next batch...\n`));
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
    }
  } else {
    // Sequential generation (original code)
    for (let i = 0; i < totalChapters; i++) {
      const chapter = config.chapters[i];

      try {
        const result = await generateChapter(chapter.number, options);
        results.push(result);
      } catch (error) {
        console.error(chalk.red(`Skipping chapter ${chapter.number} due to error\n`));
        results.push({
          chapter: chapter.number,
          status: 'error',
          error: error.message
        });
      }

      // Brief pause between chapters to avoid rate limiting
      if (i < totalChapters - 1) {
        console.log(chalk.gray('Pausing 2 seconds before next chapter...\n'));
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
  }

  // Overall summary
  const totalTime = ((Date.now() - startTime) / 60000).toFixed(2);
  const successful = results.filter(r => !r.error).length;
  const failed = totalChapters - successful;

  console.log(chalk.blue.bold(`\n${'='.repeat(70)}`));
  console.log(chalk.blue.bold(`GENERATION COMPLETE`));
  console.log(chalk.blue.bold(`${'='.repeat(70)}\n`));
  console.log(chalk.green(`✓ ${successful}/${totalChapters} chapters generated successfully`));

  if (failed > 0) {
    console.log(chalk.red(`✗ ${failed} chapter(s) failed`));
  }

  console.log(chalk.gray(`Total time: ${totalTime} minutes\n`));

  // Save overall report
  const reportPath = path.join(__dirname, 'output', 'generation-summary.json');
  await fs.writeFile(reportPath, JSON.stringify({
    timestamp: new Date().toISOString(),
    totalChapters,
    successful,
    failed,
    totalTime: `${totalTime} minutes`,
    results
  }, null, 2), 'utf-8');

  console.log(chalk.gray(`Summary report: ${reportPath}\n`));

  return results;
}

// Validate generated content
async function validate(chapterNumber, options = {}) {
  console.log(chalk.blue.bold(`\nValidating Chapter ${chapterNumber}...\n`));

  const config = await loadConfig();
  const chapter = config.chapters.find(c => c.number === chapterNumber);

  if (!chapter) {
    throw new Error(`Chapter ${chapterNumber} not found`);
  }

  const outputDir = path.join(__dirname, 'output', `chapter-${String(chapterNumber).padStart(2, '0')}`);

  try {
    const validationResults = await validateContent(outputDir, chapter, config);

    console.log(chalk.green(`\n✓ Validation complete\n`));
    console.log(chalk.bold('Results:'));
    console.log(JSON.stringify(validationResults, null, 2));

    return validationResults;

  } catch (error) {
    console.error(chalk.red(`✗ Validation failed: ${error.message}`));
    throw error;
  }
}

// CLI Setup
const program = new Command();

program
  .name('training-builder')
  .description('Automated curriculum generator using Claude AI')
  .version('1.0.0');

program
  .command('generate')
  .description('Generate chapter materials')
  .option('-c, --chapter <number>', 'Generate specific chapter (1-20)')
  .option('-a, --all', 'Generate all chapters')
  .option('-p, --parallel <number>', 'Generate chapters in parallel (e.g., --parallel 4)')
  .option('--skip-check', 'Skip check/edit workflow')
  .option('--skip-polish', 'Skip polish/format workflow')
  .option('--skip-export', 'Skip PPTX and LMS package generation')
  .option('--skip-instructor', 'Skip instructor answer keys generation')
  .option('-v, --verbose', 'Verbose output')
  .action(async (options) => {
    try {
      if (options.all) {
        await generateAllChapters(options);
      } else if (options.chapter) {
        const chapterNum = parseInt(options.chapter, 10);
        if (isNaN(chapterNum) || chapterNum < 1 || chapterNum > 20) {
          console.error(chalk.red('Error: Chapter must be between 1 and 20'));
          process.exit(1);
        }
        await generateChapter(chapterNum, options);
      } else {
        console.error(chalk.red('Error: Must specify --chapter <number> or --all'));
        program.help();
      }
    } catch (error) {
      console.error(chalk.red.bold('\nGeneration failed:'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

program
  .command('validate')
  .description('Validate generated content')
  .option('-c, --chapter <number>', 'Validate specific chapter')
  .option('-a, --all', 'Validate all chapters')
  .action(async (options) => {
    try {
      if (options.all) {
        console.log(chalk.yellow('Validating all chapters not yet implemented'));
        // TODO: Implement validate all
      } else if (options.chapter) {
        const chapterNum = parseInt(options.chapter, 10);
        await validate(chapterNum, options);
      } else {
        console.error(chalk.red('Error: Must specify --chapter <number> or --all'));
        program.help();
      }
    } catch (error) {
      console.error(chalk.red.bold('\nValidation failed:'));
      console.error(chalk.red(error.message));
      process.exit(1);
    }
  });

// Parse command line arguments
program.parse(process.argv);

// Show help if no command
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
