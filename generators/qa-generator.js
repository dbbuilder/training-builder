/**
 * Q&A / FAQ Generator
 * ===================
 * Generates 10-15 question-answer pairs for common student questions
 */

import Anthropic from '@anthropic-ai/sdk';
import fs from 'fs/promises';
import path from 'path';
import yaml from 'yaml';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
});

async function loadTemplate() {
  const templatePath = path.join(__dirname, '..', 'templates', 'qa.yaml');
  const templateContent = await fs.readFile(templatePath, 'utf-8');
  return yaml.parse(templateContent);
}

async function loadStyleGuide() {
  const stylePath = path.join(__dirname, '..', 'config', 'style-guide.yaml');
  const styleContent = await fs.readFile(stylePath, 'utf-8');
  return yaml.parse(styleContent);
}

export async function generateQA(chapter, config) {
  const template = await loadTemplate();
  const styleGuide = await loadStyleGuide();

  const prompt = `You are an expert instructor creating Q&A/FAQ sections for a full-stack web development training program.

# Your Task

Generate comprehensive Q&A (10-15 questions) for:

**Chapter ${chapter.number}: ${chapter.title}**

## Topics Covered

${chapter.topicsLearned.map(topic => `- ${topic}`).join('\n')}

## Question Distribution

**Total:** 10-15 questions

**Categories:**
- Conceptual (30%): "What is...?" "Why do we use...?"
- Practical (40%): "How do I...?" "What's the best way to...?"
- Troubleshooting (20%): "Why isn't...working?" "How do I fix...?"
- Best Practices (10%): "Should I...?" "When should I...?"

## Answer Format

**Structure:**
1. Direct answer first (1 sentence)
2. Detailed explanation (2-4 sentences)
3. Code example if applicable (40% of questions)
4. Links to documentation

**Tone:**
- Helpful and patient, never dismissive
- Assume good faith from student
- Acknowledge when something is tricky
- Provide concrete next steps

**Length:** 2-5 sentences per answer (50-150 words)

## Parts-Co Integration

60% of questions should reference Parts-Co auto parts domain:
- Entities: Manufacturer, Category, Part, Supplier, Warehouse, Inventory, Customer, Order
- Realistic scenarios (prevent out-of-stock orders, display supplier prices, handle concurrent checkouts)

## Question Format

\`\`\`markdown
### Q1: What's the difference between tRPC and REST APIs?

**A:** tRPC provides end-to-end type safety using TypeScript types, while REST is a more general architectural style without built-in typing.

With tRPC, your frontend automatically knows the exact input and output types of every backend procedure, giving you autocomplete and compile-time type checking. REST APIs require manual type definitions or code generation from OpenAPI schemas. For TypeScript full-stack applications, tRPC eliminates the gap between frontend and backend types entirely.

**See also:** [tRPC Documentation](https://trpc.io/docs)
\`\`\`

\`\`\`markdown
### Q5: How do I prevent customers from ordering out-of-stock parts?

**A:** Validate inventory in your tRPC procedure before allowing items to be added to the cart.

\`\`\`typescript
addToCart: protectedProcedure
  .input(z.object({ partId: z.number(), quantity: z.number() }))
  .mutation(async ({ input, ctx }) => {
    // Check available inventory across all warehouses
    const inventory = await ctx.prisma.inventory.aggregate({
      where: { partId: input.partId },
      _sum: { quantityOnHand: true }
    });

    const available = inventory._sum.quantityOnHand || 0;

    if (input.quantity > available) {
      throw new TRPCError({
        code: 'BAD_REQUEST',
        message: \`Only \${available} units available\`
      });
    }

    // Proceed with adding to cart...
  })
\`\`\`

This ensures users can't add unavailable quantities. Display the error message in your UI to inform the customer.
\`\`\`

\`\`\`markdown
### Q8: Why am I getting "Invalid input: Expected object, received undefined"?

**A:** This error occurs when you call a tRPC procedure without providing required input parameters.

tRPC procedures with \`.input()\` validation expect an object. If your procedure has no input, call it with an empty object: \`trpc.parts.list.useQuery({})\` not \`trpc.parts.list.useQuery()\`. If your procedure does have inputs, ensure you're passing an object: \`trpc.parts.getById.useQuery({ id: 123 })\` not \`trpc.parts.getById.useQuery(123)\`.

Check your procedure definition for the exact input schema defined by Zod.
\`\`\`

## Requirements

1. Questions students would actually ask
2. Direct, actionable answers
3. Code examples for "How to" questions
4. Helpful, patient tone
5. Realistic Parts-Co scenarios
6. Links to official documentation

## Categories to Organize

\`\`\`markdown
## Conceptual Questions

[Questions about theory and concepts]

## Practical Questions

[How-to questions with code examples]

## Troubleshooting

[Debugging and error resolution]

## Best Practices

[Recommended approaches]

## Additional Resources

- [Official Docs](url)
- [Tutorial](url)
\`\`\`

Generate the COMPLETE Q&A NOW with 10-15 questions covering common student questions about this chapter.`;

  console.log(`  Calling Claude API for Q&A generation...`);

  const message = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 8000,
    temperature: 0.7,
    messages: [{ role: 'user', content: prompt }]
  });

  const content = message.content[0].text;

  const output = `# Q&A / FAQ - Chapter ${chapter.number}
# ${chapter.title}
# Generated: ${new Date().toISOString()}
# =====================================================

${content}
`;

  return output;
}
