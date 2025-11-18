# Training Builder Style Guide

**Version**: 3.5
**Last Updated**: 2025-11-18

A comprehensive style guide for creating consistent, professional curricular content. This guide synthesizes best practices from Google, Gruntwork, Ciro Santilli, and GitHub markdown guides, plus insights from mdBook, HonKit, and MkDocs.

---

## Table of Contents

1. [Document Structure](#document-structure)
2. [Headings](#headings)
3. [Text Formatting](#text-formatting)
4. [Lists](#lists)
5. [Code](#code)
6. [Links and References](#links-and-references)
7. [Tables](#tables)
8. [Admonitions](#admonitions)
9. [Images and Media](#images-and-media)
10. [Curricular-Specific Elements](#curricular-specific-elements)
11. [Accessibility](#accessibility)
12. [File Organization](#file-organization)

---

## Document Structure

### File Header

Every document should begin with a clear header:

```markdown
# Document Title

**Chapter X:** Chapter Title
**Generated:** YYYY-MM-DD
**Component:** Book Chapter | Exercise | Quiz | etc.

---
```

### Section Organization

- Start with learning objectives or overview
- Progress from foundational to advanced concepts
- End with summary, key takeaways, or next steps
- Include estimated reading/completion time

### Blank Lines

- **Always** add blank lines before and after:
  - Headings
  - Code blocks
  - Lists
  - Block quotes
  - Tables
  - Horizontal rules

```markdown
Previous paragraph text.

## New Section

First paragraph of new section.
```

---

## Headings

### Hierarchy

- Use ATX-style headings (`#` syntax)
- Never skip heading levels (H1 → H2 → H3)
- One H1 per document (the title)

### Capitalization

| Level | Style | Example |
|-------|-------|---------|
| H1 | Title Case | `# Introduction to Full-Stack Development` |
| H2 | Title Case | `## Getting Started with React` |
| H3+ | Sentence case | `### Setting up your environment` |

### Title Case Rules (APA Style)

**Capitalize**:
- First and last word
- Major words (nouns, verbs, adjectives, adverbs)
- Words of 4+ letters

**Lowercase**:
- Articles: a, an, the
- Short prepositions: in, on, at, by, for, of, to, up
- Conjunctions: and, but, or, nor, yet, so

**Examples**:
- "Introduction to Full-Stack Development" (correct)
- "Introduction To Full-stack Development" (incorrect)
- "Working with APIs and Databases" (correct)

---

## Text Formatting

### Emphasis

| Purpose | Format | Example |
|---------|--------|---------|
| Strong emphasis | **bold** | `**important**` |
| Mild emphasis | *italic* | `*technical term*` |
| UI elements | **bold** | `Click **Save**` |
| First use of term | *italic* | `*React* is a JavaScript library` |
| File/folder names | `code` | `` `package.json` `` |
| Commands | `code` | `Run `npm install`` |

### Inline Code

Use backticks for:
- File names: `` `index.js` ``
- Commands: `` `npm start` ``
- Variable names: `` `useState` ``
- Technical terms: `` `API endpoint` ``
- Keyboard shortcuts: `` `Ctrl+C` ``

### Avoid

- ALL CAPS for emphasis (use bold)
- Underscores for emphasis (use asterisks)
- Excessive formatting (choose one style per element)

---

## Lists

### Bullet Points

- Use hyphens (`-`) not asterisks (`*`)
- One space after the marker
- Capitalize first word
- No period for short items; period for sentences

```markdown
- First item
- Second item
- Third item with more detail that forms a complete sentence.
```

### Numbered Lists

- Use `1.` for all items (auto-increments)
- Reserve for sequential or ranked items

```markdown
1. First step
1. Second step
1. Third step
```

### Nested Lists

- Indent with 2 or 4 spaces (be consistent)
- Can mix bullets and numbers

```markdown
- Main item
  - Sub-item
  - Another sub-item
    - Deep nested
- Another main item
```

### Description Lists

Use for term definitions:

```markdown
**Term**
: Definition of the term goes here.

**Another Term**
: Its definition follows.
```

---

## Code

### Inline Code

Use single backticks for short references:

```markdown
The `useState` hook manages component state.
```

### Code Blocks

**Always** specify the language:

````markdown
```javascript
function greet(name) {
  return `Hello, ${name}!`;
}
```
````

### Supported Languages

| Language | Identifier |
|----------|------------|
| JavaScript | `javascript` or `js` |
| TypeScript | `typescript` or `ts` |
| Python | `python` |
| Bash/Shell | `bash` or `shell` |
| SQL | `sql` |
| HTML | `html` |
| CSS | `css` |
| JSON | `json` |
| YAML | `yaml` |
| Markdown | `markdown` |

### Code Best Practices

1. **Keep examples focused** - Show one concept at a time
2. **Use meaningful names** - `calculateTotal` not `calc`
3. **Add comments** - Explain non-obvious logic
4. **Show complete examples** - Include imports and context
5. **Highlight changes** - Use comments like `// NEW` or `// CHANGED`

```javascript
import { useState } from 'react';  // Required import

function Counter() {
  const [count, setCount] = useState(0);  // Initialize state

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
```

---

## Links and References

### Inline Links

For single-use URLs:

```markdown
See the [React documentation](https://react.dev) for details.
```

### Reference Links

For repeated URLs or long links:

```markdown
Check out [React][react-docs] and [Vue][vue-docs] for comparison.

[react-docs]: https://react.dev
[vue-docs]: https://vuejs.org
```

### Internal Links

Link to other sections or documents:

```markdown
See [Chapter 3: Components](./chapter-03/book-chapter.md) for details.

As discussed in [the previous section](#authentication), security is crucial.
```

### Link Text Best Practices

- Be descriptive: "Read the authentication guide" not "Click here"
- Avoid bare URLs in prose
- Keep link text concise but meaningful

---

## Tables

### Basic Format

```markdown
| Column 1 | Column 2 | Column 3 |
|----------|----------|----------|
| Data 1   | Data 2   | Data 3   |
| Data 4   | Data 5   | Data 6   |
```

### Alignment

```markdown
| Left | Center | Right |
|:-----|:------:|------:|
| L    |   C    |     R |
```

### Best Practices

- Keep tables simple (max 4-5 columns)
- Use consistent alignment
- Pad cells with spaces for readability
- Consider lists for complex data

---

## Admonitions

Use GitHub-flavored markdown admonitions for callouts:

### Note

For helpful information:

```markdown
> [!NOTE]
> Useful information that users should know, even when skimming content.
```

### Tip

For helpful advice:

```markdown
> [!TIP]
> Helpful advice for doing things better or more easily.
```

### Important

For key information:

```markdown
> [!IMPORTANT]
> Key information users need to know to achieve their goal.
```

### Warning

For potential issues:

```markdown
> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.
```

### Caution

For dangerous actions:

```markdown
> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.
```

### Usage Guidelines

- Use sparingly (1-3 per section max)
- Keep content concise
- Choose the appropriate type:
  - **Note**: Background info, context
  - **Tip**: Efficiency improvements, shortcuts
  - **Important**: Must-know information
  - **Warning**: Potential errors, data loss
  - **Caution**: Security risks, irreversible actions

---

## Images and Media

### Image Syntax

```markdown
![Alt text describing the image](./images/screenshot.png)
```

### Best Practices

- Always include descriptive alt text
- Use relative paths
- Optimize images for web (max 1MB)
- Prefer PNG for screenshots, JPEG for photos
- Include captions when helpful

### Diagrams

Use code blocks for ASCII diagrams or reference external tools:

```
┌─────────────┐     ┌─────────────┐
│   Client    │────▶│   Server    │
└─────────────┘     └─────────────┘
```

---

## Curricular-Specific Elements

### Learning Objectives

Start each chapter with clear objectives:

```markdown
## Learning Objectives

By the end of this chapter, you will be able to:

- Explain the principles of RESTful API design
- Implement CRUD operations using Express.js
- Handle errors and validate input data
- Document APIs using OpenAPI/Swagger
```

### Prerequisites

List what learners need before starting:

```markdown
## Prerequisites

Before beginning this chapter, ensure you have:

- Completed Chapter 2: JavaScript Fundamentals
- Node.js v18+ installed
- Basic understanding of HTTP methods
```

### Exercises

Structure exercises clearly:

```markdown
## Exercise 3.1: Building a REST API

**Objective**: Create a basic CRUD API for a todo list.

**Time**: 30 minutes

**Instructions**:

1. Create a new Express.js project
2. Implement the following endpoints:
   - `GET /todos` - List all todos
   - `POST /todos` - Create a todo
   - `PUT /todos/:id` - Update a todo
   - `DELETE /todos/:id` - Delete a todo

**Success Criteria**:
- [ ] All endpoints return appropriate status codes
- [ ] Data persists between requests
- [ ] Input validation is implemented

**Hints**:
<details>
<summary>Click for hints</summary>

- Use `express.json()` middleware for body parsing
- Store todos in an array for now (database comes later)
- Return 404 for missing resources

</details>
```

### Quizzes

Format quiz questions consistently:

```markdown
## Quiz

### Question 1

What HTTP method is typically used to update an existing resource?

- A) GET
- B) POST
- C) PUT
- D) DELETE

<details>
<summary>Answer</summary>

**C) PUT**

PUT is used for full updates, while PATCH is used for partial updates.
Related: Chapter 3, Section "HTTP Methods"

</details>
```

### Key Takeaways

End sections with summaries:

```markdown
## Key Takeaways

- RESTful APIs use HTTP methods to represent operations
- Status codes communicate the result of requests
- Input validation prevents security vulnerabilities
- Documentation is essential for API consumers
```

---

## Accessibility

### General Principles

- Use semantic structure (headings, lists)
- Provide alt text for images
- Ensure sufficient color contrast
- Don't rely solely on color for meaning

### Code Accessibility

- Use syntax highlighting
- Keep line lengths reasonable (<100 chars)
- Provide text descriptions for complex code

### Link Accessibility

- Descriptive link text
- Avoid "click here" or bare URLs
- Indicate external links or downloads

---

## File Organization

### Directory Structure

```
output/
├── chapter-01/
│   ├── book-chapter.md
│   ├── exercises.md
│   ├── instructor-keys.md
│   ├── quiz.md
│   ├── qa.md
│   ├── topics.md
│   ├── powerpoint.md
│   └── archive/
├── chapter-02/
│   └── ...
└── pdf/
    ├── chapter-01/
    │   └── chapter-01_complete.pdf
    └── course-complete_YYYYMMDD.pdf
```

### Naming Conventions

- Use lowercase
- Use hyphens for spaces: `book-chapter.md`
- Include chapter numbers: `chapter-01`
- Use descriptive names: `instructor-keys.md` not `ik.md`

---

## Quick Reference

| Element | Style |
|---------|-------|
| H1/H2 | Title Case |
| H3+ | Sentence case |
| Bullets | Hyphens (`-`) |
| Code blocks | Always specify language |
| Emphasis | `**bold**` / `*italic*` |
| Notes | `> [!NOTE]` |
| File names | `` `filename.ext` `` |
| Commands | `` `command --flag` `` |
| Links | Descriptive text, not "click here" |
| Tables | Align pipes for readability |

---

## Formatter Configuration

The Training Builder formatter automatically applies these styles. Key transformations:

1. **APA Title Case** - Applied to H1/H2 headings
2. **Hyphen Bullets** - Converts `*` to `-`
3. **GitHub Admonitions** - Converts `**Note:**` patterns
4. **Code Language Detection** - Auto-detects and adds language hints
5. **Emphasis Normalization** - Standardizes to `**` and `*`

### Running the Formatter

```bash
# Format all chapters
node format-existing.js ./output --all --md

# Format single chapter
node format-existing.js ./output/chapter-01 --md
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 3.5 | 2025-11-18 | Added tool analysis insights, expanded admonitions, curricular elements |
| 2.0 | 2025-11-17 | Initial comprehensive guide based on industry standards |

---

**Maintained by**: Training Builder Team
**References**: Google Style Guide, Gruntwork Guide, Ciro Santilli Guide, GitHub Docs
