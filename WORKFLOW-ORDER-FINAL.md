# Complete Workflow Order - v3.2

## Updated Generation Pipeline

```
Chapter Generation Workflow (v3.2)
═══════════════════════════════════════════════════════════════════

PHASE 1: CONTENT GENERATION
────────────────────────────────────────────────────────────────────
1. Generate PowerPoint
   └─ AI Call: Claude Haiku, ~2000 tokens

2. Generate Book Chapter (Multi-pass)
   ├─ Pass 1: Outline (AI Call: ~2000 tokens)
   ├─ Pass 2: Introduction + Section 1 (AI Call: ~8000 tokens)
   └─ Pass 3: Section 2 + Conclusion (AI Call: ~8000 tokens)

3. Generate Exercises (Multi-pass)
   ├─ Pass 1: Exercise Outline (AI Call: ~2000 tokens)
   ├─ Pass 2: Exercises 1-2 Full (AI Call: ~8000 tokens)
   └─ Pass 3: Exercises 3-5 Full (AI Call: ~8000 tokens)

4. Generate Q&A Session
   └─ AI Call: Claude Haiku, ~4000 tokens

5. Generate Quiz
   └─ AI Call: Claude Haiku, ~4000 tokens

6. Generate Topics List
   └─ AI Call: Claude Haiku, ~2000 tokens

7. Generate Instructor Materials (Multi-pass)
   ├─ Pass 1: Instructor Outline (AI Call: ~2000 tokens)
   ├─ Pass 2: Exercise Solutions (AI Call: ~8000 tokens)
   └─ Pass 3: Quiz Answers + Guidelines (AI Call: ~6000 tokens)

PHASE 2: QUALITY ASSURANCE (ALL CONTENT)
────────────────────────────────────────────────────────────────────
8. Check/Edit Workflow
   └─ AI Call: Claude Haiku, ~4000 tokens (reviews all content)

9. 🆕 Revise & Extend Workflow (NEW in v3.2)
   ├─ Analyze quality issues in ALL content:
   │  ├─ Code block ellipsis detection
   │  ├─ Implementation placeholder detection
   │  └─ Size threshold validation
   ├─ Enhancement strategies (as needed):
   │  ├─ Code Completion (AI Call: ~4000 tokens)
   │  ├─ Content Extension (AI Call: ~6000 tokens)
   │  └─ Section Completion (AI Call: ~4000 tokens)
   └─ Updates affected files in-place

10. Polish/Format Workflow (ALL CONTENT)
    ├─ Pre-flight Check (detects if Revise & Extend needed)
    ├─ Skip large files (>50KB)
    ├─ Polish ALL components including instructor materials
    ├─ AI Call: Claude Haiku, ~4000 tokens per component
    └─ Reject if polished version is suspiciously short

11. 🆕 Markdown Formatting Workflow (NEW in v3.2)
    ├─ NO AI CALLS - Pure text processing
    ├─ Runs AFTER Polish to format final polished content
    ├─ Format ALL documents:
    │  ├─ book-chapter.txt
    │  ├─ exercises.txt
    │  ├─ qa-session.txt
    │  ├─ quiz.txt
    │  └─ instructor-keys.txt
    ├─ Transformations:
    │  ├─ Normalize heading spacing
    │  ├─ Add syntax highlighting to code blocks
    │  ├─ Format lists consistently
    │  ├─ Add horizontal rules between sections
    │  ├─ Add document headers with metadata
    │  └─ Exercise/Instructor-specific formatting
    └─ Output: Display-ready markdown files

PHASE 3: EXPORT
────────────────────────────────────────────────────────────────────
12. Export Formats
    ├─ Convert to PDF (NO AI - pypandoc)
    ├─ Convert to DOCX (NO AI - pypandoc)
    └─ Create .pptx from PowerPoint text (NO AI - python-pptx)

────────────────────────────────────────────────────────────────────
Total AI Calls per Chapter: ~10-15 (depends on Revise & Extend needs)
Total Cost per Chapter: $0.12-0.18 (with enhancements)
Total Time per Chapter: ~6-8 minutes
```

---

## Key Workflow Changes in v3.2

### 1. Revise & Extend Before Polish (Step 8)

**Purpose:** Complete any incomplete content before attempting to polish

**Trigger Conditions:**
```javascript
// In polish-format.js - Pre-flight check
const qualityIssues = [];

for (const component of componentsToPolish) {
  const content = await fs.readFile(path.join(outputDir, component.file), 'utf-8');

  // Check 1: Code block ellipsis
  const codeEllipsis = (content.match(/```[\s\S]*?\.\.\.[\s\S]*?```/g) || []).length;

  // Check 2: Implementation placeholders
  const placeholders = (content.match(/\/\/\s*\.\.\.|\.\.\.[\s]*implementation/gi) || []).length;

  // Check 3: Size thresholds
  const minSizes = { 'instructor-keys.txt': 6000, 'exercises.txt': 10000 };
  const isTooSmall = minSizes[component.file] && content.length < minSizes[component.file];

  if (codeEllipsis > 0 || placeholders > 0 || isTooSmall) {
    qualityIssues.push({
      file: component.file,
      issues: [
        codeEllipsis > 0 && `${codeEllipsis} code blocks with ellipsis`,
        placeholders > 0 && `${placeholders} implementation placeholders`,
        isTooSmall && `Too small (${(content.length / 1024).toFixed(1)}KB)`
      ].filter(Boolean)
    });
  }
}

if (qualityIssues.length > 0) {
  console.log(`\n  ⚠️  Quality issues detected - triggering Revise & Extend workflow...`);
  await reviseAndExtendWorkflow(outputDir, chapter, qualityIssues);
}
```

**Enhancement Strategies:**

1. **Code Completion** (High Priority)
   - Detect: `// ... implementation` or `/* ... */` in code blocks
   - Action: AI expands ONLY the placeholders, keeps existing code
   - Cost: ~$0.02 per component

2. **Content Extension** (Medium Priority)
   - Detect: File size below threshold (instructor-keys <6KB, exercises <10KB)
   - Action: AI adds missing sections (suggested by analysis)
   - Cost: ~$0.03 per component

3. **Section Completion** (High Priority)
   - Detect: Truncation patterns (heading with no content, empty code blocks)
   - Action: AI continues from truncation point
   - Cost: ~$0.02 per component

### 2. Markdown Formatting (Step 9)

**Purpose:** Apply consistent markdown formatting for display-ready output

**NO AI CALLS - Pure Text Processing**

**Transformations Applied:**

```javascript
// 1. Normalize heading spacing
//    - 2 blank lines before h1/h2
//    - 1 blank line before h3-h6

// 2. Code block formatting
//    - Ensure blank lines before/after
//    - Add syntax highlighting hints (javascript, python, sql, etc.)

// 3. List formatting
//    - Blank line before lists
//    - Consistent ordered list numbering

// 4. Typography
//    - Normalize bold (**) and italic (*)
//    - Remove excessive blank lines (max 3)

// 5. Section dividers
//    - Add horizontal rules before ## headings

// 6. Document headers
//    - Add metadata header with title, chapter, date, component

// 7. Component-specific formatting
//    - Exercises: Difficulty badges, time estimates, learning objectives
//    - Instructor: Grading checkboxes, common mistakes sections
```

**Example Output:**

```markdown
# Exercises - Introduction to Full-Stack Development

**Chapter 1:** Introduction to Full-Stack Development
**Generated:** 2025-01-17
**Component:** Exercises

---

## Exercise 1: Set Up Development Environment

**Difficulty:** `Medium`
**Estimated Time:** ⏱️ 45 minutes

**Learning Objectives:**

- Install and configure Node.js and npm
- Set up Visual Studio Code with extensions
- Create a basic full-stack project structure

---

**Example:**

```javascript
// Initialize a new Node.js project
npm init -y

// Install Express framework
npm install express
```
```

**Cost Impact:** $0 (no AI calls)

**Time Impact:** ~2-3 seconds per file

---

## Integration Points

### In `index.js` (Chapter Generator)

```javascript
async function generateChapter(chapterNum, options) {
  // ... existing generation steps 1-7 ...

  // STEP 8: Revise & Extend (if needed)
  if (!options.skipRevise) {
    await reviseAndExtendWorkflow(outputDir, chapter, config);
  }

  // STEP 9: Polish (with pre-flight check built-in)
  if (!options.skipPolish) {
    await polishWorkflow(outputDir, chapter, config);
  }

  // STEP 10: Markdown Formatting (AFTER polish)
  if (!options.skipFormatting) {
    await formatAllDocuments(outputDir, chapter, config);
  }

  // ... remaining steps ...
}
```

### In `workflows/polish-format.js`

```javascript
export async function polishWorkflow(outputDir, chapter, config) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`POLISH WORKFLOW`);
  console.log(`${'='.repeat(70)}\n`);

  // PRE-FLIGHT CHECK: Detect if Revise & Extend is needed
  const needsRevision = await detectQualityIssues(outputDir);

  if (needsRevision.length > 0) {
    console.log(`  ⚠️  Quality issues detected - running Revise & Extend first...`);
    await reviseAndExtendWorkflow(outputDir, chapter, needsRevision);
  }

  // Continue with polish workflow...
  console.log(`  Starting polish workflow...`);

  // ... existing polish logic ...
}
```

---

## CLI Options

```bash
# Full workflow (default)
node index.js generate --all --parallel 4

# Skip Revise & Extend (for testing)
node index.js generate --chapter 1 --skip-revise

# Skip formatting (for testing)
node index.js generate --chapter 1 --skip-formatting

# Skip both (minimal workflow)
node index.js generate --chapter 1 --skip-revise --skip-formatting

# Skip polish entirely
node index.js generate --all --skip-polish
```

---

## Cost Breakdown (Per Chapter)

| Step | AI Calls | Cost |
|------|----------|------|
| PowerPoint | 1 | $0.003 |
| Book Chapter (3-pass) | 3 | $0.030 |
| Exercises (3-pass) | 3 | $0.030 |
| Q&A | 1 | $0.008 |
| Quiz | 1 | $0.008 |
| Topics | 1 | $0.003 |
| Check/Edit | 1 | $0.008 |
| **Revise & Extend** (conditional) | 0-3 | $0.00-0.06 |
| **Markdown Format** | **0** | **$0.00** |
| Polish | 3-5 | $0.020 |
| Instructor Keys (3-pass) | 3 | $0.030 |
| **TOTAL** | **17-23** | **$0.14-0.20** |

**With Parallelism (4 chapters):**
- 20 chapters = 5 batches
- Total time: ~30-40 minutes
- Total cost: $2.80-4.00

---

## Success Metrics

**v3.1 → v3.2 Improvements:**

1. **Quality Pass Rate**
   - v3.1: 80-85% (some incomplete content)
   - v3.2: 95%+ (Revise & Extend catches issues)

2. **Manual Intervention**
   - v3.1: 15-20% chapters need manual fixes
   - v3.2: <5% chapters need manual fixes

3. **Display Readiness**
   - v3.1: Raw text, inconsistent formatting
   - v3.2: Display-ready markdown with metadata headers

4. **Cost Impact**
   - Additional: +$0.02-0.06 per chapter (Revise & Extend)
   - Formatting: $0 (no AI calls)
   - Total increase: +15-30% ($0.14 → $0.16-0.20)

5. **Time Impact**
   - Revise & Extend: +1-2 minutes per affected chapter (20% of chapters)
   - Formatting: +3-5 seconds per chapter
   - Total: Negligible with parallel mode

---

## Next Steps

1. ✅ Design complete (Revise & Extend, Markdown Formatting)
2. ✅ Markdown Formatter implemented
3. ⏭️ Implement Revise & Extend workflow
4. ⏭️ Integrate into main generation pipeline
5. ⏭️ Add CLI flags
6. ⏭️ Test on single chapter
7. ⏭️ Production run (all 20 chapters)
