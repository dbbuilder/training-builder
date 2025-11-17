/**
 * Content Validator
 * ==================
 * Automated validation of generated content structure and quality
 */

import fs from 'fs/promises';
import path from 'path';

/**
 * Validate generated content for a chapter
 */
export async function validateContent(outputDir, chapter, config) {
  console.log(`  Validating content structure and quality...`);

  const results = {
    chapter: chapter.number,
    title: chapter.title,
    timestamp: new Date().toISOString(),
    files: {},
    validations: [],
    errors: [],
    warnings: [],
    score: 0,
    maxScore: 0
  };

  // Expected files
  const expectedFiles = [
    { name: 'powerpoint.txt', minSize: 10000, maxSize: 100000 },
    { name: 'book-chapter.txt', minSize: 20000, maxSize: 150000 },
    { name: 'exercises.txt', minSize: 10000, maxSize: 80000 },
    { name: 'qa.txt', minSize: 5000, maxSize: 50000 },
    { name: 'quiz.txt', minSize: 5000, maxSize: 40000 },
    { name: 'topics.txt', minSize: 2000, maxSize: 15000 }
  ];

  // Check file existence and size
  for (const file of expectedFiles) {
    const filepath = path.join(outputDir, file.name);
    results.maxScore += 10;

    try {
      const stats = await fs.stat(filepath);
      const content = await fs.readFile(filepath, 'utf-8');

      results.files[file.name] = {
        exists: true,
        size: stats.size,
        lines: content.split('\n').length,
        wordCount: content.split(/\s+/).length
      };

      // Size validation
      if (stats.size < file.minSize) {
        results.warnings.push({
          file: file.name,
          issue: `File size ${stats.size} is below minimum ${file.minSize}`,
          severity: 'medium'
        });
        results.score += 5;
      } else if (stats.size > file.maxSize) {
        results.warnings.push({
          file: file.name,
          issue: `File size ${stats.size} exceeds maximum ${file.maxSize}`,
          severity: 'low'
        });
        results.score += 8;
      } else {
        results.score += 10;
      }

      // Content-specific validations
      await validateFileContent(file.name, content, chapter, results);

    } catch (error) {
      results.errors.push({
        file: file.name,
        issue: `File not found or unreadable: ${error.message}`,
        severity: 'high'
      });
      results.files[file.name] = {
        exists: false,
        error: error.message
      };
    }
  }

  // Calculate overall score
  const percentage = results.maxScore > 0 ? Math.round((results.score / results.maxScore) * 100) : 0;
  results.overallScore = `${results.score}/${results.maxScore} (${percentage}%)`;

  // Determine pass/fail
  results.passed = percentage >= 70;
  results.grade = percentage >= 90 ? 'A' : percentage >= 80 ? 'B' : percentage >= 70 ? 'C' : 'F';

  console.log(`    Score: ${results.overallScore} - Grade: ${results.grade}`);
  console.log(`    Errors: ${results.errors.length}, Warnings: ${results.warnings.length}`);

  return results;
}

/**
 * Validate content of specific file types
 */
async function validateFileContent(filename, content, chapter, results) {
  results.maxScore += 10;
  let score = 10;

  // PowerPoint validation
  if (filename === 'powerpoint.txt') {
    const slideMatches = content.match(/## Slide \d+:/g);
    const slideCount = slideMatches ? slideMatches.length : 0;

    if (slideCount < 30) {
      results.warnings.push({
        file: filename,
        issue: `Only ${slideCount} slides found, expected 30-50`,
        severity: 'medium'
      });
      score -= 3;
    } else if (slideCount > 50) {
      results.warnings.push({
        file: filename,
        issue: `${slideCount} slides found, expected 30-50`,
        severity: 'low'
      });
      score -= 2;
    }

    // Check for speaker notes
    if (!content.includes('Speaker Notes:')) {
      results.warnings.push({
        file: filename,
        issue: 'No speaker notes found',
        severity: 'medium'
      });
      score -= 3;
    }
  }

  // Book chapter validation
  if (filename === 'book-chapter.txt') {
    const wordCount = content.split(/\s+/).length;

    if (wordCount < 5000) {
      results.warnings.push({
        file: filename,
        issue: `Only ${wordCount} words, expected 5,000-8,000`,
        severity: 'high'
      });
      score -= 5;
    } else if (wordCount > 8000) {
      results.warnings.push({
        file: filename,
        issue: `${wordCount} words, expected 5,000-8,000`,
        severity: 'low'
      });
      score -= 2;
    }

    // Check for required sections
    const requiredSections = ['Introduction', 'Learning Objectives', 'Summary', "What's Next"];
    for (const section of requiredSections) {
      if (!content.includes(section)) {
        results.warnings.push({
          file: filename,
          issue: `Missing required section: ${section}`,
          severity: 'high'
        });
        score -= 3;
      }
    }

    // Check for code examples
    if (!content.includes('```')) {
      results.warnings.push({
        file: filename,
        issue: 'No code blocks found',
        severity: 'high'
      });
      score -= 3;
    }
  }

  // Quiz validation
  if (filename === 'quiz.txt') {
    const questionMatches = content.match(/### Question \d+/g);
    const questionCount = questionMatches ? questionMatches.length : 0;

    if (questionCount < 10) {
      results.warnings.push({
        file: filename,
        issue: `Only ${questionCount} questions, expected 10-15`,
        severity: 'medium'
      });
      score -= 3;
    }

    // Check for answer key
    if (!content.includes('Answer Key')) {
      results.warnings.push({
        file: filename,
        issue: 'No answer key found',
        severity: 'high'
      });
      score -= 4;
    }

    // Check for explanations
    if (!content.includes('Explanation:')) {
      results.warnings.push({
        file: filename,
        issue: 'No explanations found',
        severity: 'high'
      });
      score -= 4;
    }
  }

  // Q&A validation
  if (filename === 'qa.txt') {
    const questionMatches = content.match(/### Q\d+:/g);
    const questionCount = questionMatches ? questionMatches.length : 0;

    if (questionCount < 10) {
      results.warnings.push({
        file: filename,
        issue: `Only ${questionCount} Q&A pairs, expected 10-15`,
        severity: 'medium'
      });
      score -= 3;
    }
  }

  // Exercises validation
  if (filename === 'exercises.txt') {
    const exerciseMatches = content.match(/# Hands-On Exercise \d+:/g);
    const exerciseCount = exerciseMatches ? exerciseMatches.length : 0;

    if (exerciseCount < 3) {
      results.warnings.push({
        file: filename,
        issue: `Only ${exerciseCount} exercises, expected 3-5`,
        severity: 'medium'
      });
      score -= 3;
    }

    // Check for success criteria
    if (!content.includes('Success Criteria')) {
      results.warnings.push({
        file: filename,
        issue: 'No success criteria found',
        severity: 'medium'
      });
      score -= 3;
    }

    // Check for troubleshooting
    if (!content.includes('Troubleshooting')) {
      results.warnings.push({
        file: filename,
        issue: 'No troubleshooting section found',
        severity: 'low'
      });
      score -= 2;
    }
  }

  // Check for learning objectives coverage (all files)
  for (const objective of chapter.learningObjectives) {
    // Simple check - objective keywords appear in content
    const keywords = objective.toLowerCase().split(' ').filter(w => w.length > 4);
    const hasKeywords = keywords.some(kw => content.toLowerCase().includes(kw));

    if (!hasKeywords) {
      results.warnings.push({
        file: filename,
        issue: `Learning objective may not be covered: "${objective}"`,
        severity: 'low'
      });
    }
  }

  results.score += Math.max(0, score);
}
