/**
 * Check and Edit Workflow
 * ========================
 * AI-powered review and editing of generated content
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

/**
 * Review and edit all generated content for a chapter
 */
export async function checkAndEdit(outputDir, chapter, config) {
  console.log(`  Reviewing content for accuracy and completeness...`);

  const components = [
    'powerpoint.txt',
    'book-chapter.txt',
    'exercises.txt',
    'qa.txt',
    'quiz.txt',
    'topics.txt'
  ];

  const results = {
    componentsReviewed: 0,
    issuesFound: [],
    correctionsApplied: [],
    timestamp: new Date().toISOString()
  };

  // Read all generated content
  const contentMap = {};
  for (const component of components) {
    const filepath = path.join(outputDir, component);
    try {
      contentMap[component] = await fs.readFile(filepath, 'utf-8');
    } catch (error) {
      console.log(`    ⚠️ Could not read ${component}: ${error.message}`);
      results.issuesFound.push({ component, issue: 'File not found' });
    }
  }

  // Construct review prompt
  const prompt = `You are a technical curriculum quality reviewer. Review the following generated content for Chapter ${chapter.number}: ${chapter.title}

# Your Task

Review ALL components for:

1. **Accuracy**: Technical correctness, code examples work
2. **Completeness**: All learning objectives covered
3. **Consistency**: Terminology matches across components, cross-references valid
4. **Clarity**: Explanations understandable for target audience
5. **Progression**: Appropriate difficulty for Chapter ${chapter.number}

# Learning Objectives to Verify

${chapter.learningObjectives.map(obj => `- ${obj}`).join('\n')}

# Components to Review

${Object.keys(contentMap).map(component => `## ${component}\n${contentMap[component].substring(0, 2000)}...\n`).join('\n')}

# Review Checklist

For each component, check:

**PowerPoint:**
- [ ] 30-50 slides
- [ ] All learning objectives addressed
- [ ] Code examples have syntax highlighting markers
- [ ] Speaker notes present
- [ ] Parts-Co examples used

**Book Chapter:**
- [ ] 15-25 pages (estimate based on word count)
- [ ] Introduction sets context
- [ ] Code examples complete and commented
- [ ] Callout boxes used appropriately
- [ ] Hands-on exercise included
- [ ] Summary and what's next sections present

**Exercises:**
- [ ] 3-5 exercises with progressive difficulty
- [ ] Step-by-step instructions clear
- [ ] Success criteria specific
- [ ] Troubleshooting section included
- [ ] Code complete (no ellipsis)

**Q&A:**
- [ ] 10-15 questions
- [ ] Answers direct and helpful
- [ ] Code examples where appropriate
- [ ] Links to documentation

**Quiz:**
- [ ] 10-15 questions
- [ ] Mix of MC, T/F, short answer
- [ ] Explanations comprehensive
- [ ] Answer key included

**Topics Learned:**
- [ ] 5-10 key topics
- [ ] Categorized appropriately
- [ ] Capabilities listed

# Output Format

Provide your review as JSON:

\`\`\`json
{
  "overallQuality": "excellent|good|needsWork",
  "issues": [
    {
      "component": "powerpoint.txt",
      "severity": "high|medium|low",
      "issue": "Description of issue",
      "location": "Slide 15",
      "suggestedFix": "How to correct it"
    }
  ],
  "completeness": {
    "objectivesCovered": ["objective1", "objective2"],
    "objectivesMissing": []
  },
  "recommendations": [
    "Add more explanation of X in book chapter",
    "Include troubleshooting for Y in exercises"
  ]
}
\`\`\`

Focus on SIGNIFICANT issues only. Minor typos and style preferences can be handled in polish step.`;

  try {
    const message = await anthropic.messages.create({
      model: 'claude-3-5-haiku-20241022',
      max_tokens: 4000,
      temperature: 0.3,
      messages: [{ role: 'user', content: prompt }]
    });

    const reviewText = message.content[0].text;

    // Extract JSON from response
    const jsonMatch = reviewText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const review = JSON.parse(jsonMatch[0]);
      results.review = review;
      results.componentsReviewed = components.length;

      // Log issues found
      if (review.issues && review.issues.length > 0) {
        console.log(`    Found ${review.issues.length} issues:`);
        review.issues.forEach(issue => {
          console.log(`      - [${issue.severity}] ${issue.component}: ${issue.issue}`);
          results.issuesFound.push(issue);
        });
      } else {
        console.log(`    ✓ No significant issues found`);
      }

      // Log recommendations
      if (review.recommendations && review.recommendations.length > 0) {
        console.log(`    Recommendations:`);
        review.recommendations.forEach(rec => {
          console.log(`      - ${rec}`);
        });
      }
    }

  } catch (error) {
    console.log(`    ✗ Review failed: ${error.message}`);
    results.error = error.message;
  }

  // Save review report
  const reportPath = path.join(outputDir, 'check-edit-report.json');
  await fs.writeFile(reportPath, JSON.stringify(results, null, 2), 'utf-8');

  return results;
}
