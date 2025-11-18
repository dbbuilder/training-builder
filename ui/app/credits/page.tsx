import Link from 'next/link';

export default function CreditsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <Link href="/" className="text-blue-600 hover:text-blue-800 font-medium">
            &larr; Back to Home
          </Link>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Credits and Licenses</h1>
          <p className="text-gray-600 mb-8">
            Training Builder uses open-source tools and draws inspiration from excellent documentation projects.
            We gratefully acknowledge the following contributors and projects.
          </p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Third-Party Tools and Libraries</h2>

            <h3 className="text-lg font-semibold mb-3">Python Libraries</h3>
            <div className="overflow-x-auto mb-4">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Library</th>
                    <th className="border p-2 text-left">License</th>
                    <th className="border p-2 text-left">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2 font-mono">PyPDF2</td>
                    <td className="border p-2">BSD 3-Clause</td>
                    <td className="border p-2">PDF manipulation and merging</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-mono">ReportLab</td>
                    <td className="border p-2">BSD</td>
                    <td className="border p-2">Cover page and page number generation</td>
                  </tr>
                  <tr>
                    <td className="border p-2 font-mono">Anthropic SDK</td>
                    <td className="border p-2">MIT</td>
                    <td className="border p-2">AI content generation</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <h3 className="text-lg font-semibold mb-3">Command Line Tools</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm border-collapse">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border p-2 text-left">Tool</th>
                    <th className="border p-2 text-left">License</th>
                    <th className="border p-2 text-left">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border p-2 font-mono">Pandoc</td>
                    <td className="border p-2">GPL-2.0</td>
                    <td className="border p-2">Markdown to PDF conversion</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Research References</h2>
            <p className="text-gray-600 mb-4">
              The following open-source documentation tools were analyzed for best practices and enhancement ideas:
            </p>

            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">mdBook</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Repository:</strong>{' '}
                  <a href="https://github.com/rust-lang/mdBook" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    github.com/rust-lang/mdBook
                  </a>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>License:</strong> Mozilla Public License 2.0 (MPL-2.0)
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Copyright:</strong> The Rust Project Developers
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Usage:</strong> Analyzed for preprocessing pipeline patterns and GitHub-style admonitions
                </p>
                <p className="text-xs text-gray-500 mt-2 italic">
                  The MPL-2.0 is a weak copyleft license that permits both open-source and proprietary derivative works.
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">HonKit</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Repository:</strong>{' '}
                  <a href="https://github.com/honkit/honkit" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    github.com/honkit/honkit
                  </a>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>License:</strong> Apache License 2.0
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Copyright:</strong> HonKit Contributors
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Usage:</strong> Analyzed for plugin architecture, theme systems, and multi-format output
                </p>
              </div>

              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-lg">MkDocs</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Repository:</strong>{' '}
                  <a href="https://github.com/mkdocs/mkdocs" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                    github.com/mkdocs/mkdocs
                  </a>
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>License:</strong> BSD 2-Clause
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Copyright:</strong> Tom Christie
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Usage:</strong> Analyzed for YAML configuration patterns and hook-based plugins
                </p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Style Guide References</h2>
            <p className="text-gray-600 mb-4">
              The Training Builder Style Guide synthesizes best practices from:
            </p>
            <div className="space-y-3">
              <div className="flex items-start gap-3 text-sm">
                <span className="font-semibold text-blue-600">1.</span>
                <div>
                  <strong>Google Markdown Style Guide</strong>
                  <p className="text-gray-600">License: CC-BY 3.0</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <span className="font-semibold text-blue-600">2.</span>
                <div>
                  <strong>Gruntwork Markdown Style Guide</strong>
                  <p className="text-gray-600">License: Proprietary (referenced for educational purposes)</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <span className="font-semibold text-blue-600">3.</span>
                <div>
                  <strong>Ciro Santilli&apos;s Markdown Style Guide</strong>
                  <p className="text-gray-600">License: CC-BY-SA 4.0</p>
                </div>
              </div>
              <div className="flex items-start gap-3 text-sm">
                <span className="font-semibold text-blue-600">4.</span>
                <div>
                  <strong>GitHub Flavored Markdown</strong>
                  <p className="text-gray-600">License: CC-BY-SA 4.0</p>
                </div>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Acknowledgments</h2>
            <ul className="list-disc list-inside text-gray-600 space-y-2">
              <li><strong>Anthropic</strong> - For the Claude AI models powering content generation</li>
              <li><strong>OpenAI</strong> - For inspiring accessible AI-powered developer tools</li>
              <li><strong>The Rust Foundation</strong> - For mdBook&apos;s excellent documentation tooling</li>
              <li><strong>Tom Christie</strong> - For MkDocs and its ecosystem</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">License Compliance</h2>
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <h3 className="font-semibold text-green-800 mb-2">All Clear</h3>
              <p className="text-sm text-green-700">
                Training Builder uses only libraries and tools that are compatible with proprietary/commercial use.
                No licensing issues were found.
              </p>
            </div>

            <h3 className="text-lg font-semibold mb-3">What This Means</h3>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>
                <strong>MPL-2.0 (mdBook):</strong> Any modifications to mdBook source code must be released under MPL-2.0.
                Using ideas/patterns from mdBook does not require license compliance.
              </li>
              <li>
                <strong>Apache 2.0 (HonKit):</strong> Requires attribution if distributing HonKit code.
                Using ideas/patterns does not require compliance.
              </li>
              <li>
                <strong>BSD (MkDocs, PyPDF2, ReportLab):</strong> Requires copyright notice retention in source/binary distributions.
              </li>
              <li>
                <strong>GPL-2.0 (Pandoc):</strong> Using pandoc as a command-line tool does not affect Training Builder&apos;s license.
                If we were to distribute pandoc or link to its code, GPL-2.0 would apply.
              </li>
            </ul>
          </section>

          <div className="mt-8 p-4 bg-gray-50 rounded-lg text-sm text-gray-600 text-center">
            <p><strong>Last Updated:</strong> November 18, 2025</p>
            <p className="mt-2">
              For licensing questions or concerns, please contact the development team.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
