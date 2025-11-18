import Link from 'next/link';

export default function StyleGuidePage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            &larr; Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Training Builder Style Guide</h1>
          <p className="text-gray-600 mb-8">
            Version 3.5 | A comprehensive guide for creating consistent, professional curricular content.
            Synthesizes best practices from Google, Gruntwork, Ciro Santilli, and GitHub markdown guides.
          </p>

          <nav className="mb-8 p-4 bg-gray-50 rounded-lg">
            <h2 className="font-semibold mb-2">Table of Contents</h2>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              <li><a href="#document-structure" className="text-blue-600 hover:underline">Document Structure</a></li>
              <li><a href="#headings" className="text-blue-600 hover:underline">Headings</a></li>
              <li><a href="#text-formatting" className="text-blue-600 hover:underline">Text Formatting</a></li>
              <li><a href="#lists" className="text-blue-600 hover:underline">Lists</a></li>
              <li><a href="#code" className="text-blue-600 hover:underline">Code</a></li>
              <li><a href="#admonitions" className="text-blue-600 hover:underline">Admonitions</a></li>
              <li><a href="#curricular" className="text-blue-600 hover:underline">Curricular Elements</a></li>
              <li><a href="#quick-reference" className="text-blue-600 hover:underline">Quick Reference</a></li>
            </ul>
          </nav>

          <section id="document-structure" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Document Structure</h2>
            <h3 className="text-lg font-semibold mb-2">File Header</h3>
            <p className="text-gray-600 mb-3">Every document should begin with a clear header:</p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto mb-4">
{`# Document Title

**Chapter X:** Chapter Title
**Generated:** YYYY-MM-DD
**Component:** Book Chapter | Exercise | Quiz | etc.

---`}
            </pre>
            <h3 className="text-lg font-semibold mb-2">Section Organization</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Start with learning objectives or overview</li>
              <li>Progress from foundational to advanced concepts</li>
              <li>End with summary, key takeaways, or next steps</li>
              <li>Include estimated reading/completion time</li>
            </ul>
          </section>

          <section id="headings" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Headings</h2>
            <h3 className="text-lg font-semibold mb-2">Capitalization Rules</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Level</th>
                    <th className="border p-2 text-left">Style</th>
                    <th className="border p-2 text-left">Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2">H1</td>
                    <td className="border p-2">Title Case</td>
                    <td className="border p-2 font-mono text-xs"># Introduction to Full-Stack Development</td>
                  </tr>
                  <tr>
                    <td className="border p-2">H2</td>
                    <td className="border p-2">Title Case</td>
                    <td className="border p-2 font-mono text-xs">## Getting Started with React</td>
                  </tr>
                  <tr>
                    <td className="border p-2">H3+</td>
                    <td className="border p-2">Sentence case</td>
                    <td className="border p-2 font-mono text-xs">### Setting up your environment</td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Title Case (APA Style):</strong> Capitalize first/last word, major words (nouns, verbs, adjectives),
                and words 4+ letters. Lowercase articles (a, an, the), short prepositions (in, on, at), and conjunctions (and, but, or).
              </p>
            </div>
          </section>

          <section id="text-formatting" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Text Formatting</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Purpose</th>
                    <th className="border p-2 text-left">Format</th>
                    <th className="border p-2 text-left">Example</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border p-2">Strong emphasis</td><td className="border p-2">**bold**</td><td className="border p-2"><strong>important</strong></td></tr>
                  <tr><td className="border p-2">Mild emphasis</td><td className="border p-2">*italic*</td><td className="border p-2"><em>technical term</em></td></tr>
                  <tr><td className="border p-2">UI elements</td><td className="border p-2">**bold**</td><td className="border p-2">Click <strong>Save</strong></td></tr>
                  <tr><td className="border p-2">File names</td><td className="border p-2">`code`</td><td className="border p-2"><code className="bg-gray-100 px-1 rounded">package.json</code></td></tr>
                  <tr><td className="border p-2">Commands</td><td className="border p-2">`code`</td><td className="border p-2"><code className="bg-gray-100 px-1 rounded">npm start</code></td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section id="lists" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Lists</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Bullet Points</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                  <li>Use hyphens (-) not asterisks (*)</li>
                  <li>One space after the marker</li>
                  <li>Capitalize first word</li>
                  <li>No period for short items</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2">Numbered Lists</h3>
                <ul className="list-disc list-inside text-gray-600 space-y-1 text-sm">
                  <li>Use 1. for all items (auto-increments)</li>
                  <li>Reserve for sequential items</li>
                  <li>Indent with 2 or 4 spaces</li>
                </ul>
              </div>
            </div>
          </section>

          <section id="code" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Code</h2>
            <p className="text-gray-600 mb-3"><strong>Always</strong> specify the language for code blocks:</p>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto mb-4">
{`\`\`\`javascript
import { useState } from 'react';

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <button onClick={() => setCount(count + 1)}>
      Count: {count}
    </button>
  );
}
\`\`\``}
            </pre>
            <h3 className="text-lg font-semibold mb-2">Best Practices</h3>
            <ul className="list-disc list-inside text-gray-600 space-y-1">
              <li>Keep examples focused - show one concept at a time</li>
              <li>Use meaningful names - <code className="bg-gray-100 px-1 rounded text-sm">calculateTotal</code> not <code className="bg-gray-100 px-1 rounded text-sm">calc</code></li>
              <li>Add comments - explain non-obvious logic</li>
              <li>Show complete examples - include imports and context</li>
            </ul>
          </section>

          <section id="admonitions" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Admonitions</h2>
            <p className="text-gray-600 mb-4">Use GitHub-flavored markdown admonitions for callouts:</p>
            <div className="space-y-4">
              <div className="border-l-4 border-blue-500 bg-blue-50 p-4 rounded-r-lg">
                <p className="font-semibold text-blue-800">Note</p>
                <p className="text-sm text-blue-700">Useful information that users should know, even when skimming content.</p>
                <code className="text-xs text-blue-600">&gt; [!NOTE]</code>
              </div>
              <div className="border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg">
                <p className="font-semibold text-green-800">Tip</p>
                <p className="text-sm text-green-700">Helpful advice for doing things better or more easily.</p>
                <code className="text-xs text-green-600">&gt; [!TIP]</code>
              </div>
              <div className="border-l-4 border-purple-500 bg-purple-50 p-4 rounded-r-lg">
                <p className="font-semibold text-purple-800">Important</p>
                <p className="text-sm text-purple-700">Key information users need to know to achieve their goal.</p>
                <code className="text-xs text-purple-600">&gt; [!IMPORTANT]</code>
              </div>
              <div className="border-l-4 border-yellow-500 bg-yellow-50 p-4 rounded-r-lg">
                <p className="font-semibold text-yellow-800">Warning</p>
                <p className="text-sm text-yellow-700">Urgent info that needs immediate user attention to avoid problems.</p>
                <code className="text-xs text-yellow-600">&gt; [!WARNING]</code>
              </div>
              <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                <p className="font-semibold text-red-800">Caution</p>
                <p className="text-sm text-red-700">Advises about risks or negative outcomes of certain actions.</p>
                <code className="text-xs text-red-600">&gt; [!CAUTION]</code>
              </div>
            </div>
          </section>

          <section id="curricular" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Curricular Elements</h2>

            <h3 className="text-lg font-semibold mb-2">Learning Objectives</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto mb-4">
{`## Learning Objectives

By the end of this chapter, you will be able to:

- Explain the principles of RESTful API design
- Implement CRUD operations using Express.js
- Handle errors and validate input data
- Document APIs using OpenAPI/Swagger`}
            </pre>

            <h3 className="text-lg font-semibold mb-2">Exercise Structure</h3>
            <pre className="bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto mb-4">
{`## Exercise 3.1: Building a REST API

**Objective**: Create a basic CRUD API for a todo list.

**Time**: 30 minutes

**Instructions**:

1. Create a new Express.js project
2. Implement the following endpoints...

**Success Criteria**:
- [ ] All endpoints return appropriate status codes
- [ ] Data persists between requests`}
            </pre>
          </section>

          <section id="quick-reference" className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Reference</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Element</th>
                    <th className="border p-2 text-left">Style</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td className="border p-2">H1/H2</td><td className="border p-2">Title Case</td></tr>
                  <tr><td className="border p-2">H3+</td><td className="border p-2">Sentence case</td></tr>
                  <tr><td className="border p-2">Bullets</td><td className="border p-2">Hyphens (-)</td></tr>
                  <tr><td className="border p-2">Code blocks</td><td className="border p-2">Always specify language</td></tr>
                  <tr><td className="border p-2">Emphasis</td><td className="border p-2">**bold** / *italic*</td></tr>
                  <tr><td className="border p-2">Notes</td><td className="border p-2">&gt; [!NOTE]</td></tr>
                  <tr><td className="border p-2">File names</td><td className="border p-2">`filename.ext`</td></tr>
                  <tr><td className="border p-2">Commands</td><td className="border p-2">`command --flag`</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600">
            <p><strong>Maintained by:</strong> Training Builder Team</p>
            <p><strong>References:</strong> Google Style Guide, Gruntwork Guide, Ciro Santilli Guide, GitHub Docs</p>
            <p className="mt-2">
              <Link href="/credits" className="text-blue-600 hover:underline">
                View Credits and Licenses &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
