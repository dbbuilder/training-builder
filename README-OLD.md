# Training Builder - Automated Curriculum Generator

**Automated training material generator using Claude AI for creating comprehensive technical courses.**

## Overview

Training Builder is a specialized tool that leverages Claude AI to generate complete, professional-quality training curricula with multiple delivery formats (PowerPoint, book chapters, quizzes, Q&A, exercises) following a consistent, high-quality template.

Built for the Parts-Co Full-Stack E-Commerce Training System, this tool can be adapted for any technical curriculum development project.

## Features

- **Multi-Format Generation**: Creates 7 components per chapter
  - PowerPoint outline (30-50 slides)
  - Book chapter (15-25 pages)
  - Hands-on exercises with step-by-step instructions
  - Q&A/FAQ (10-15 questions)
  - Quiz (10-15 questions with answers)
  - Topics learned summary
  - Code checkpoint information

- **Workflow Automation**: Built-in quality control
  - **Check/Edit Step**: AI reviews generated content for accuracy, completeness, consistency
  - **Polish/Format Step**: Final formatting, styling, cross-references, professional touches

- **Template-Driven**: Consistent structure across all chapters
  - Reusable templates for each content type
  - Style guides for technical writing
  - Brand consistency (Parts-Co theme)

- **Intelligent Generation**: Context-aware content creation
  - Reads curriculum plan and technology decisions
  - Maintains continuity across chapters
  - Cross-references previous and upcoming chapters
  - Adapts complexity progressively

## Quick Start

### Installation

```bash
cd /mnt/d/dev2/claude-agent-sdk/training-builder
npm install
```

### Configuration

Create `.env` file with your Anthropic API key:

```bash
ANTHROPIC_API_KEY=your_api_key_here
```

### Generate a Single Chapter

```bash
npm run generate -- --chapter 1
```

### Generate All Chapters

```bash
npm run generate -- --all
```

### Validate Generated Content

```bash
npm run validate -- --chapter 1
```

## Project Structure

```
training-builder/
├── index.js                    # Main CLI entry point
├── package.json                # Dependencies and scripts
├── README.md                   # This file
├── .env                        # API keys (not committed)
├── templates/                  # Content templates
│   ├── powerpoint.yaml         # PowerPoint slide structure
│   ├── book-chapter.yaml       # Book chapter structure
│   ├── quiz.yaml               # Quiz format
│   ├── qa.yaml                 # Q&A format
│   └── exercise.yaml           # Hands-on exercise format
├── generators/                 # Content generators
│   ├── powerpoint-generator.js # PowerPoint outline generator
│   ├── chapter-generator.js    # Book chapter generator
│   ├── quiz-generator.js       # Quiz generator
│   ├── qa-generator.js         # Q&A generator
│   └── exercise-generator.js   # Exercise generator
├── workflows/                  # Quality control workflows
│   ├── check-edit.js           # Review and edit workflow
│   ├── polish-format.js        # Formatting and polish workflow
│   └── validator.js            # Content validation
└── output/                     # Generated materials
    ├── chapter-01/
    │   ├── powerpoint.txt
    │   ├── book-chapter.txt
    │   ├── exercises.txt
    │   ├── quiz.txt
    │   ├── qa.txt
    │   └── topics.txt
    └── chapter-02/
        └── ...
```

## Usage Examples

### Generate Chapter with Custom Options

```bash
# Generate with verbose output
npm run generate -- --chapter 5 --verbose

# Skip check/edit step (faster, lower quality)
npm run generate -- --chapter 5 --skip-check

# Generate specific components only
npm run generate -- --chapter 5 --components powerpoint,chapter
```

### Batch Generation

```bash
# Generate chapters 1-5
npm run generate -- --range 1-5

# Generate all chapters in parallel (faster)
npm run generate -- --all --parallel

# Generate with custom output directory
npm run generate -- --all --output /custom/path
```

### Validation and Quality Control

```bash
# Validate all chapters
npm run validate -- --all

# Check for consistency across chapters
npm run validate -- --consistency

# Generate quality report
npm run validate -- --report
```

## Templates

### PowerPoint Template (`templates/powerpoint.yaml`)

Defines slide structure:
- Title slide
- Learning objectives slide
- Content slides (concept, code examples, diagrams)
- Exercise preview slides
- Summary slide
- Next chapter preview slide

### Book Chapter Template (`templates/book-chapter.yaml`)

Defines chapter structure:
- Chapter title and number
- Learning objectives (3-5 bullet points)
- Prerequisites (prior chapters, tools)
- Introduction (2-3 paragraphs)
- Main sections (3-5 sections)
- Hands-on exercise
- Summary (key takeaways)
- What's next (preview)
- Further reading

### Quiz Template (`templates/quiz.yaml`)

Question types:
- Multiple choice (4 options, 1 correct)
- True/false with explanation
- Short answer
- Code completion/debugging

## Workflow Steps

### 1. Generation

AI generates initial content based on:
- Chapter number and title (from curriculum plan)
- Learning objectives
- Technology stack (from technology decisions)
- Previous chapter context
- Template structure

### 2. Check/Edit

AI reviews generated content for:
- **Accuracy**: Technical correctness, code examples work
- **Completeness**: All required sections present, learning objectives covered
- **Consistency**: Terminology matches previous chapters, cross-references valid
- **Clarity**: Explanations understandable for target audience
- **Progression**: Appropriate difficulty level for chapter position

Makes corrections automatically, logs significant changes.

### 3. Polish/Format

AI applies final touches:
- **Formatting**: Consistent headings, code block syntax, bullet points
- **Cross-references**: Links to previous/next chapters, references to earlier concepts
- **Professional styling**: Proper technical writing style, callout boxes (Tip, Warning, Note)
- **Brand consistency**: Parts-Co branding, color scheme references
- **Proofreading**: Grammar, spelling, punctuation

## Configuration

### Curriculum Configuration (`config/curriculum.json`)

Generated from existing planning documents:
- `FULLSTACK_CURRICULUM_PLAN.txt`
- `TECHNOLOGY_DECISIONS.txt`
- `SAMPLE_CHAPTER_05.txt`
- `IMPLEMENTATION_ROADMAP.txt`

### Style Guide (`config/style-guide.yaml`)

Defines:
- Tone and voice (professional, conversational, encouraging)
- Technical writing standards
- Code formatting preferences
- Terminology dictionary
- Parts-Co brand guidelines

## Output Formats

All content generated as **plain text** in formats ready for:

- **PowerPoint**: Structured outline easily convertible to slides
- **Book Chapter**: Markdown format ready for PDF generation via Pandoc
- **Quizzes**: Markdown format exportable to QTI for LMS integration
- **Q&A**: Structured text format
- **Exercises**: Step-by-step instructions with success criteria

## Quality Metrics

Training Builder tracks:
- Generation time per chapter
- Token usage (cost estimation)
- Content length (slides, pages, questions)
- Validation results (errors, warnings)
- Consistency score across chapters

Reports available via `npm run validate -- --report`.

## Customization

### Adding New Content Types

1. Create template in `templates/your-type.yaml`
2. Create generator in `generators/your-type-generator.js`
3. Update `index.js` to include new component
4. Add validation rules in `workflows/validator.js`

### Adapting for Different Courses

1. Update curriculum configuration with your course structure
2. Modify templates to match your content types
3. Adjust style guide for your brand/voice
4. Update technology stack references

## Cost Estimation

Based on Claude Sonnet API pricing:

- **Single chapter**: ~$0.50-1.00 (all 7 components)
- **20 chapters**: ~$10-20 total
- **With check/edit/polish**: ~$15-30 total

Actual costs vary based on chapter complexity and content length.

## Roadmap

- [ ] Support for video script generation
- [ ] Integration with PowerPoint API for direct .pptx creation
- [ ] LMS integration (Moodle, Canvas export)
- [ ] Multi-language support
- [ ] Interactive code examples with embedded sandboxes
- [ ] Automated diagram generation from descriptions

## License

MIT License - See LICENSE file for details.

## Support

For issues, questions, or contributions:
- GitHub Issues: [Link to repository]
- Documentation: `docs/` folder
- Examples: `examples/` folder

---

**Built with Claude AI** - Demonstrating the power of AI-assisted curriculum development.
