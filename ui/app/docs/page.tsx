import Link from 'next/link';

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-700 mb-4 inline-block">
            ← Back to Home
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Documentation</h1>
          <p className="text-gray-600">Learn how to use Training Builder to create amazing courses</p>
        </div>

        {/* Quick Start */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Quick Start</h2>
          <ol className="list-decimal list-inside space-y-3 text-gray-700">
            <li>
              <strong>Create a Project:</strong> Click "Get Started" and provide your project name
            </li>
            <li>
              <strong>Select AI Model:</strong> Choose between Claude Haiku 3.5, GPT-4o Mini, or Gemini Flash 2.0
            </li>
            <li>
              <strong>Enter API Key:</strong> Provide your API key from the selected provider
            </li>
            <li>
              <strong>Design Outline:</strong> Create your course structure using YAML format
            </li>
            <li>
              <strong>Generate Content:</strong> Click "Generate" and watch the AI create your course
            </li>
            <li>
              <strong>Review & Export:</strong> Preview all content and export to ZIP
            </li>
          </ol>
        </section>

        {/* YAML Format */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">YAML Outline Format</h2>
          <p className="text-gray-700 mb-4">
            Define your course structure using YAML. Here's an example:
          </p>
          <pre className="bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto text-sm">
{`course:
  title: "Full-Stack Web Development"
  description: "Complete course"
  duration: "120 hours"
  level: "Intermediate"

chapters:
  - number: 1
    title: "Introduction to Full-Stack"
    duration: "2 hours"
    topics:
      - What is full-stack development
      - Modern architecture
      - Tools setup

  - number: 2
    title: "JavaScript Fundamentals"
    duration: "4 hours"
    topics:
      - ES6+ features
      - Async/await
      - Modules`}
          </pre>
        </section>

        {/* Model Comparison */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Model Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Model</th>
                  <th className="text-left py-2">Provider</th>
                  <th className="text-left py-2">Speed</th>
                  <th className="text-left py-2">Cost</th>
                  <th className="text-left py-2">Best For</th>
                </tr>
              </thead>
              <tbody className="text-gray-700">
                <tr className="border-b">
                  <td className="py-3">Claude Haiku 3.5</td>
                  <td>Anthropic</td>
                  <td>Very Fast</td>
                  <td>~$3/course</td>
                  <td>Comprehensive courses</td>
                </tr>
                <tr className="border-b">
                  <td className="py-3">GPT-4o Mini</td>
                  <td>OpenAI</td>
                  <td>Fast</td>
                  <td>~$2/course</td>
                  <td>Technical content</td>
                </tr>
                <tr>
                  <td className="py-3">Gemini Flash 2.0</td>
                  <td>Google</td>
                  <td>Very Fast</td>
                  <td>~$2/course</td>
                  <td>Quick iterations</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ */}
        <section className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h2 className="text-2xl font-bold mb-4">Frequently Asked Questions</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Is my API key secure?</h3>
              <p className="text-gray-700">
                Yes! Your API key is stored locally in your browser's localStorage and never sent to our servers.
                All AI generation happens directly between your browser and your chosen AI provider.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">How long does generation take?</h3>
              <p className="text-gray-700">
                A 20-chapter course takes approximately 2-3 hours to generate completely, depending on the
                complexity and chosen model. Individual chapters take 5-8 minutes each.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What content is generated?</h3>
              <p className="text-gray-700">
                For each chapter, we generate: PowerPoint slides, book chapter content, practical exercises,
                Q&A sections, quizzes, topics summary, and complete instructor answer keys.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Can I edit the generated content?</h3>
              <p className="text-gray-700">
                Currently, you can preview and export the content. Future versions will include inline editing
                capabilities. For now, edit the exported files in your preferred text editor.
              </p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">What export formats are supported?</h3>
              <p className="text-gray-700">
                We export to ZIP files containing markdown files for each component, PowerPoint presentations,
                and LMS-compatible packages (Canvas, Moodle, SCORM).
              </p>
            </div>
          </div>
        </section>

        {/* API Keys */}
        <section className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold mb-4">Getting API Keys</h2>

          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Anthropic Claude</h3>
              <p className="text-gray-700 mb-2">
                Sign up at{' '}
                <a href="https://console.anthropic.com" target="_blank" className="text-blue-600 hover:underline">
                  console.anthropic.com
                </a>
              </p>
              <p className="text-sm text-gray-600">Free tier: $5 credit, then pay-as-you-go</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">OpenAI</h3>
              <p className="text-gray-700 mb-2">
                Sign up at{' '}
                <a href="https://platform.openai.com" target="_blank" className="text-blue-600 hover:underline">
                  platform.openai.com
                </a>
              </p>
              <p className="text-sm text-gray-600">Free trial: $5 credit, then pay-as-you-go</p>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 mb-2">Google Gemini</h3>
              <p className="text-gray-700 mb-2">
                Sign up at{' '}
                <a href="https://ai.google.dev" target="_blank" className="text-blue-600 hover:underline">
                  ai.google.dev
                </a>
              </p>
              <p className="text-sm text-gray-600">Free tier available with rate limits</p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="mt-8 text-center text-gray-600">
          <p>Need more help? Check out our GitHub repository or contact support.</p>
        </div>
      </div>
    </div>
  );
}
