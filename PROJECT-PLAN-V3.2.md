# Training Builder Project Plan - v3.2

## Executive Summary

**Project:** AI-Powered Training Curriculum Generator
**Version:** 3.2 (Revise & Extend + Markdown Formatting)
**Status:** In Development
**Target Cost:** $0.14-0.20 per chapter
**Target Time:** 30-40 minutes for 20 chapters (parallel mode)

---

## Complete Workflow Order (OFFICIAL)

### PHASE 1: CONTENT GENERATION

All content is generated first before any quality assurance steps.

```
1. Generate PowerPoint
   └─ Single AI call, basic outline

2. Generate Book Chapter (Multi-pass)
   ├─ Pass 1: Chapter outline (structure planning)
   ├─ Pass 2: Introduction + First sections (detailed content)
   └─ Pass 3: Remaining sections + Conclusion (completion)

3. Generate Exercises (Multi-pass)
   ├─ Pass 1: Exercise outline (5 exercises planned)
   ├─ Pass 2: Exercises 1-2 with FULL implementations
   └─ Pass 3: Exercises 3-5 with FULL implementations

4. Generate Q&A Session
   └─ Single AI call, student-instructor dialogue

5. Generate Quiz
   └─ Single AI call, questions with answers

6. Generate Topics List
   └─ Single AI call, key topics summary

7. Generate Instructor Materials (Multi-pass)
   ├─ Pass 1: Instructor outline (materials structure)
   ├─ Pass 2: Exercise solutions with COMPLETE code
   └─ Pass 3: Quiz answers + grading guidelines
```

**CRITICAL:** All content must be generated BEFORE moving to Phase 2.

### PHASE 2: QUALITY ASSURANCE

All content goes through quality pipeline together.

```
8. Check/Edit Workflow
   └─ AI reviews all generated content for accuracy

9. Revise & Extend Workflow (NEW in v3.2)
   ├─ Analyzes ALL content for quality issues:
   │  ├─ Code blocks with ellipsis/placeholders
   │  ├─ Implementation comments (// ... implementation)
   │  ├─ Size thresholds (instructor-keys <6KB, exercises <10KB)
   │  └─ Truncation patterns (headings with no content)
   │
   ├─ Enhancement Strategy 1: Code Completion
   │  └─ Expands ONLY placeholders, keeps existing code
   │
   ├─ Enhancement Strategy 2: Content Extension
   │  └─ Adds missing sections to reach size targets
   │
   └─ Enhancement Strategy 3: Section Completion
      └─ Continues truncated sections to completion

10. Polish/Format Workflow
    ├─ Pre-flight check (triggers Revise & Extend if needed)
    ├─ Polishes ALL content including instructor materials
    └─ Rejects suspiciously short polished versions

11. Markdown Formatting Workflow (NEW in v3.2)
    ├─ NO AI CALLS - Pure text processing
    ├─ Runs AFTER Polish on final content
    ├─ Applies to ALL files:
    │  ├─ book-chapter.txt
    │  ├─ exercises.txt
    │  ├─ qa-session.txt
    │  ├─ quiz.txt
    │  └─ instructor-keys.txt
    │
    └─ Transformations:
       ├─ Normalize heading spacing (2 lines before h1/h2, 1 before h3+)
       ├─ Add syntax highlighting to code blocks (auto-detect language)
       ├─ Format lists consistently (blank lines, numbering)
       ├─ Add horizontal rules between major sections
       ├─ Add document headers with metadata
       ├─ Exercise-specific: Difficulty badges, time estimates
       └─ Instructor-specific: Grading checkboxes, mistake sections
```

**CRITICAL:** Quality assurance runs on ALL content, including instructor materials.

### PHASE 3: EXPORT

```
12. Export Formats
    ├─ Convert to PDF (pypandoc)
    ├─ Convert to DOCX (pypandoc)
    └─ Create .pptx from PowerPoint text (python-pptx)
```

---

## Implementation Checklist

### ✅ Completed (v3.1)
- [x] Multi-pass book chapter generation
- [x] Multi-pass exercise generation
- [x] Multi-pass instructor keys generation
- [x] Cost tracking for all API calls
- [x] Ellipsis detection warnings
- [x] Size validation warnings
- [x] Parallel generation (4 concurrent chapters)
- [x] CLI options for parallel mode

### 🔄 In Progress (v3.2)
- [ ] Revise & Extend workflow implementation
  - [ ] Quality analyzer module
  - [ ] Code completion strategy
  - [ ] Content extension strategy
  - [ ] Section completion strategy
  - [ ] Integration with polish workflow
- [ ] Markdown formatting workflow
  - [x] Formatter module created
  - [ ] Integration into main pipeline
  - [ ] Component-specific formatters tested
- [ ] Test run (chapters 1-2)
- [ ] Full production run (all 20 chapters)

### 📋 Planned (Future)
- [ ] Web UI (Vercel + Next.js 14)
  - [ ] Next.js project scaffolding with TypeScript
  - [ ] Tailwind CSS + shadcn/ui integration
  - [ ] Monaco editor for outline editing
  - [ ] Real-time generation monitoring (Pusher)
  - [ ] PostgreSQL database (Neon)
  - [ ] BYOK (Bring Your Own Key) support
  - [ ] Preview and export functionality

---

## Cost & Time Projections

### Per Chapter (v3.2)

| Step | AI Calls | Tokens | Cost |
|------|----------|--------|------|
| PowerPoint | 1 | 2,000 | $0.003 |
| Book Chapter (3-pass) | 3 | 18,000 | $0.030 |
| Exercises (3-pass) | 3 | 18,000 | $0.030 |
| Q&A | 1 | 4,000 | $0.008 |
| Quiz | 1 | 4,000 | $0.008 |
| Topics | 1 | 2,000 | $0.003 |
| Instructor Keys (3-pass) | 3 | 16,000 | $0.030 |
| Check/Edit | 1 | 4,000 | $0.008 |
| **Revise & Extend** (conditional) | 0-3 | 0-14,000 | $0.00-0.06 |
| **Markdown Format** | **0** | **0** | **$0.00** |
| Polish | 3-5 | 12,000-20,000 | $0.020 |
| **TOTAL** | **17-23** | **80,000-102,000** | **$0.14-0.20** |

### Full Course (20 Chapters)

**Without Parallel:**
- Time: ~120 minutes (6 min/chapter × 20)
- Cost: $2.80-4.00

**With Parallel (4 concurrent):**
- Time: ~30-40 minutes (5 batches × 6-8 min)
- Cost: $2.80-4.00
- **Time Savings: 66%**

---

## Quality Metrics (Target)

| Metric | v3.0 | v3.1 | v3.2 (Target) |
|--------|------|------|---------------|
| Exercise Size | 5-7KB | 8-12KB | 10-15KB |
| Instructor Keys Size | 1-3KB | 6-12KB | 8-15KB |
| Code Completeness | 60% | 85% | 98% |
| Manual Fixes Needed | 20% | 15% | <5% |
| Display Readiness | Raw text | Raw text | Formatted markdown |

---

## File Structure

```
training-builder/
├── generators/
│   ├── book-chapter-generator.js     (multi-pass, v3.1)
│   ├── exercise-generator.js         (multi-pass, v3.1)
│   ├── instructor-keys-generator.js  (multi-pass, v3.1)
│   ├── qa-generator.js
│   ├── quiz-generator.js
│   └── topics-generator.js
│
├── workflows/
│   ├── check-edit.js                 (existing)
│   ├── revise-and-extend.js          (NEW - v3.2, TO BE IMPLEMENTED)
│   ├── polish-format.js              (existing, needs pre-flight check)
│   └── markdown-formatter.js         (NEW - v3.2, IMPLEMENTED)
│
├── lib/
│   ├── cost-tracker.js               (v3.1)
│   └── parallel-executor.js          (v3.1)
│
├── curriculum.yaml                   (course structure)
├── index.js                          (main orchestrator)
├── package.json
│
├── docs/
│   ├── V3.1-MULTI-PASS-FIX.md       (v3.1 improvements)
│   ├── REVISE-AND-EXTEND-DESIGN.md  (v3.2 design)
│   ├── WORKFLOW-ORDER-FINAL.md      (v3.2 workflow)
│   ├── PROJECT-PLAN-V3.2.md         (this file)
│   ├── WEB-UI-ARCHITECTURE.md       (future)
│   └── WEB-UI-IMPLEMENTATION-GUIDE.md (future)
│
└── output/
    └── chapter-{N}/
        ├── book-chapter.txt         (formatted markdown)
        ├── exercises.txt            (formatted markdown)
        ├── qa-session.txt           (formatted markdown)
        ├── quiz.txt                 (formatted markdown)
        ├── instructor-keys.txt      (formatted markdown)
        ├── powerpoint.txt
        ├── topics.txt
        └── exports/
            ├── chapter.pdf
            ├── chapter.docx
            └── slides.pptx
```

---

## Integration Points (Implementation Details)

### 1. Main Orchestrator (`index.js`)

```javascript
async function generateChapter(chapterNum, options) {
  console.log(`\nGenerating Chapter ${chapterNum}...`);

  // PHASE 1: CONTENT GENERATION
  const powerpoint = await generatePowerPoint(outputDir, chapter, config);
  const bookChapter = await generateBookChapter(outputDir, chapter, config);
  const exercises = await generateExercises(chapter, config);
  const qa = await generateQA(outputDir, chapter, config);
  const quiz = await generateQuiz(outputDir, chapter, config);
  const topics = await generateTopics(outputDir, chapter, config);
  const instructorKeys = await generateInstructorKeys(outputDir, chapter, config);

  // PHASE 2: QUALITY ASSURANCE
  if (!options.skipCheckEdit) {
    await checkEditWorkflow(outputDir, chapter, config);
  }

  if (!options.skipRevise) {
    await reviseAndExtendWorkflow(outputDir, chapter, config);
  }

  if (!options.skipPolish) {
    await polishWorkflow(outputDir, chapter, config);
  }

  if (!options.skipFormatting) {
    await formatAllDocuments(outputDir, chapter, config);
  }

  // PHASE 3: EXPORT
  if (!options.skipExport) {
    await exportFormats(outputDir, chapter, config);
  }

  console.log(`✓ Chapter ${chapterNum} completed\n`);
}
```

### 2. Revise & Extend Workflow (`workflows/revise-and-extend.js`)

**TO BE IMPLEMENTED:**

```javascript
export async function reviseAndExtendWorkflow(outputDir, chapter, config) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`REVISE & EXTEND WORKFLOW`);
  console.log(`${'='.repeat(70)}\n`);

  const files = [
    { name: 'book-chapter.txt', minSize: null },
    { name: 'exercises.txt', minSize: 10000 },
    { name: 'instructor-keys.txt', minSize: 6000 },
    { name: 'qa-session.txt', minSize: null },
    { name: 'quiz.txt', minSize: null }
  ];

  const enhancementQueue = [];

  // Analyze quality issues
  for (const file of files) {
    const content = await fs.readFile(path.join(outputDir, file.name), 'utf-8');
    const analysis = analyzeQuality(file.name, content, file.minSize);

    if (analysis.needsEnhancement) {
      enhancementQueue.push({ file: file.name, analysis });
    }
  }

  if (enhancementQueue.length === 0) {
    console.log(`  ✓ All content passes quality checks\n`);
    return;
  }

  // Apply enhancements
  for (const item of enhancementQueue) {
    console.log(`  📦 ${item.file}:`);

    for (const enhancement of item.analysis.enhancements) {
      const result = await applyEnhancement(
        outputDir,
        item.file,
        enhancement,
        chapter,
        config
      );

      console.log(`     ✅ ${result.changes} (+${(result.addedChars / 1024).toFixed(1)}KB)`);
    }
  }

  console.log(`\n✓ Revise & Extend completed\n`);
}

function analyzeQuality(filename, content, minSize) {
  const issues = [];

  // Check 1: Code block ellipsis
  const codeEllipsis = Array.from(content.matchAll(/```[\s\S]*?\.\.\.[\s\S]*?```/g));
  if (codeEllipsis.length > 0) {
    issues.push({
      type: 'code_ellipsis',
      priority: 'high',
      count: codeEllipsis.length,
      strategy: 'code_completion'
    });
  }

  // Check 2: Implementation placeholders
  const placeholders = Array.from(content.matchAll(/\/\/\s*\.\.\.|\.\.\.[\s]*implementation/gi));
  if (placeholders.length > 0) {
    issues.push({
      type: 'placeholders',
      priority: 'high',
      count: placeholders.length,
      strategy: 'code_completion'
    });
  }

  // Check 3: Size threshold
  if (minSize && content.length < minSize) {
    issues.push({
      type: 'size',
      priority: 'medium',
      deficit: minSize - content.length,
      strategy: 'content_extension'
    });
  }

  // Check 4: Truncation patterns
  if (/\n\n#{2,}\s+\w+[^\n]*\n{1,2}$/m.test(content)) {
    issues.push({
      type: 'truncation',
      priority: 'high',
      strategy: 'section_completion'
    });
  }

  return {
    needsEnhancement: issues.length > 0,
    enhancements: issues
  };
}

async function applyEnhancement(outputDir, filename, enhancement, chapter, config) {
  switch (enhancement.strategy) {
    case 'code_completion':
      return await expandCodePlaceholders(outputDir, filename, enhancement, chapter);

    case 'content_extension':
      return await addMissingSections(outputDir, filename, enhancement, chapter);

    case 'section_completion':
      return await completeTruncatedSection(outputDir, filename, enhancement, chapter);

    default:
      throw new Error(`Unknown strategy: ${enhancement.strategy}`);
  }
}
```

### 3. Polish Workflow Pre-flight Check (`workflows/polish-format.js`)

**TO BE MODIFIED:**

```javascript
export async function polishWorkflow(outputDir, chapter, config) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`POLISH WORKFLOW`);
  console.log(`${'='.repeat(70)}\n`);

  // PRE-FLIGHT CHECK: Ensure Revise & Extend was run
  const qualityCheck = await checkQualityIssues(outputDir);

  if (qualityCheck.issuesFound) {
    console.log(`  ⚠️  Quality issues still present - running Revise & Extend...`);
    await reviseAndExtendWorkflow(outputDir, chapter, config);
  }

  // Continue with existing polish logic...
  console.log(`  Starting polish workflow...\n`);

  // ... rest of polish code ...
}

async function checkQualityIssues(outputDir) {
  const files = ['exercises.txt', 'instructor-keys.txt'];

  for (const file of files) {
    const content = await fs.readFile(path.join(outputDir, file), 'utf-8');

    if (/```[\s\S]*?\.\.\.[\s\S]*?```/g.test(content)) {
      return { issuesFound: true, reason: 'Code ellipsis detected' };
    }

    if (file === 'instructor-keys.txt' && content.length < 6000) {
      return { issuesFound: true, reason: 'Instructor keys too small' };
    }

    if (file === 'exercises.txt' && content.length < 10000) {
      return { issuesFound: true, reason: 'Exercises too small' };
    }
  }

  return { issuesFound: false };
}
```

---

## CLI Commands

```bash
# Full v3.2 workflow (default)
node index.js generate --all --parallel 4

# Test chapters 1-2 only
node index.js generate --chapters 1,2 --parallel 2

# Skip specific steps (for testing)
node index.js generate --chapter 1 --skip-revise
node index.js generate --chapter 1 --skip-formatting
node index.js generate --chapter 1 --skip-polish

# Disable all quality steps (fast generation)
node index.js generate --chapter 1 --skip-revise --skip-polish --skip-formatting

# Enable verbose logging
node index.js generate --all --parallel 4 --verbose
```

---

## Testing Plan

### Test 1: Chapters 1-2 (Parallel)
**Purpose:** Validate v3.2 implementation before full run

```bash
node index.js generate --chapters 1,2 --parallel 2 2>&1 | tee v3.2-test.log
```

**Success Criteria:**
- [ ] Both chapters complete without errors
- [ ] Revise & Extend triggers on quality issues
- [ ] Markdown formatting applied to all files
- [ ] Exercises >10KB
- [ ] Instructor keys >6KB
- [ ] No code blocks with ellipsis
- [ ] Cost <$0.40 total

### Test 2: Full Production Run (20 Chapters)
**Purpose:** Generate complete course

```bash
node index.js generate --all --parallel 4 2>&1 | tee v3.2-production.log
```

**Success Criteria:**
- [ ] All 20 chapters complete
- [ ] Total cost $2.80-4.00
- [ ] Total time 30-40 minutes
- [ ] <5% chapters need manual fixes
- [ ] All files formatted as markdown
- [ ] Display-ready output

---

## Web UI Roadmap (Future)

### Technology Stack
- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS + shadcn/ui
- **Backend:** Next.js API Routes (Serverless)
- **Database:** Neon PostgreSQL (Serverless)
- **Real-time:** Pusher (WebSocket)
- **Storage:** Vercel Blob
- **Hosting:** Vercel

### Features
1. Multi-stage outline editor (Monaco)
2. BYOK (Claude Haiku / GPT-4o Mini / Gemini Flash)
3. Real-time generation monitoring
4. Budget tracking
5. Preview and export (ZIP download)

### Timeline
- Scaffolding: 1 day
- Core features: 2-3 days
- Polish and testing: 1 day
- **Total: 4-5 days**

---

## Version History

### v3.2 (Current - In Development)
- Added Revise & Extend workflow
- Added Markdown Formatting workflow
- Moved instructor materials to Phase 1 (generation)
- Quality assurance now applies to ALL content

### v3.1 (Completed)
- Multi-pass generation for exercises, book chapters, instructor keys
- Cost tracking for all API calls
- Parallel generation (4 concurrent chapters)
- Ellipsis and size detection warnings

### v3.0 (Completed)
- Polish workflow bug fixes
- Basic multi-pass for book chapters
- Sequential generation only

---

## Success Metrics (Overall)

**Quality:**
- 95%+ chapters pass all quality checks
- <5% require manual intervention
- Zero code blocks with incomplete implementations

**Performance:**
- 30-40 minutes for full course (20 chapters)
- $2.80-4.00 total cost
- 66% time savings vs. sequential

**Deliverables:**
- Display-ready markdown files
- PDF/DOCX exports
- PowerPoint slides
- Complete instructor materials

---

## Notes

- All workflow order changes must be documented here first
- Test on 1-2 chapters before full production runs
- Monitor cost tracker for budget overruns
- Keep backups of successful generation runs
- Document any API rate limit issues
