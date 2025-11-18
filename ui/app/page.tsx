import Link from 'next/link';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="max-w-5xl w-full space-y-8 text-center">
        <div className="space-y-4">
          <h1 className="text-6xl font-bold tracking-tight text-gray-900">
            Training Builder
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Generate comprehensive training courses with AI. Create book chapters, exercises, quizzes, instructor materials, and PowerPoint presentations - all from a single outline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          <FeatureCard
            icon="📝"
            title="7 Document Types"
            description="Book chapters, exercises, instructor keys, quizzes, Q&A, topic summaries, and PowerPoint slides"
          />
          <FeatureCard
            icon="🤖"
            title="AI Generation"
            description="Generate complete curricula with Claude, GPT-4, or Gemini using your own API keys"
          />
          <FeatureCard
            icon="📄"
            title="PDF Pipeline"
            description="Export to PDF with chapter-based page numbers, cover pages, and merged course books"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
          <FeatureCard
            icon="🎨"
            title="Professional Formatting"
            description="Automatic APA title case, GitHub admonitions, syntax highlighting, and consistent styling"
          />
          <FeatureCard
            icon="📊"
            title="PowerPoint Export"
            description="Generate presentations with modern Tailwind-inspired designs and sub-bullet support"
          />
          <FeatureCard
            icon="✅"
            title="Style Guide"
            description="Built-in style guide synthesizing best practices from Google, GitHub, and industry standards"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <ModelCard
            name="Claude Haiku 3.5"
            description="Fast, efficient, great for most courses"
            cost="~$3/course"
          />
          <ModelCard
            name="GPT-4o Mini"
            description="OpenAI's latest efficient model"
            cost="~$2/course"
          />
          <ModelCard
            name="Gemini Flash 2.0"
            description="Google's fast multimodal model"
            cost="~$2/course"
          />
        </div>

        <div className="flex gap-4 justify-center mt-12">
          <Link
            href="/dashboard"
            className="px-8 py-4 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/docs"
            className="px-8 py-4 bg-white text-blue-600 rounded-lg font-semibold border-2 border-blue-600 hover:bg-blue-50 transition-colors"
          >
            View Documentation
          </Link>
        </div>

        <div className="flex gap-4 justify-center mt-4">
          <Link
            href="/style-guide"
            className="px-6 py-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            Style Guide
          </Link>
          <Link
            href="/credits"
            className="px-6 py-2 text-gray-600 hover:text-blue-600 transition-colors"
          >
            Credits & Licenses
          </Link>
        </div>

        <div className="mt-16 p-6 bg-white rounded-lg shadow-md border border-gray-200">
          <h3 className="text-lg font-semibold mb-2">Bring Your Own Key (BYOK)</h3>
          <p className="text-gray-600">
            Your API keys stay with you. We never store or access your credentials.
            All generation happens directly between your browser and your chosen AI provider.
          </p>
        </div>
      </div>
    </main>
  );
}

function FeatureCard({ icon, title, description }: { icon: string; title: string; description: string }) {
  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}

function ModelCard({ name, description, cost }: { name: string; description: string; cost: string }) {
  return (
    <div className="p-4 bg-white rounded-lg border border-gray-200">
      <h4 className="font-semibold text-lg mb-1">{name}</h4>
      <p className="text-sm text-gray-600 mb-2">{description}</p>
      <p className="text-sm font-semibold text-blue-600">{cost}</p>
    </div>
  );
}
