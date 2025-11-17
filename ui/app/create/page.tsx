'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useProjectStore } from '@/stores/projectStore';
import type { AIModel } from '@/types';

export default function CreateProjectPage() {
  const router = useRouter();
  const { addProject, apiConfig, setAPIConfig } = useProjectStore();

  const [projectName, setProjectName] = useState('');
  const [selectedModel, setSelectedModel] = useState<AIModel>('claude-haiku-3.5');
  const [apiKey, setApiKey] = useState('');
  const [saveKey, setSaveKey] = useState(false);

  const handleCreate = () => {
    if (!projectName.trim() || !apiKey.trim()) {
      alert('Please provide both project name and API key');
      return;
    }

    // Save API config if requested
    if (saveKey) {
      setAPIConfig({ model: selectedModel, apiKey });
    }

    // Create new project
    const newProject = {
      id: crypto.randomUUID(),
      name: projectName,
      outline: '',
      model: selectedModel,
      apiKey,
      status: 'draft' as const,
      createdAt: new Date(),
      updatedAt: new Date(),
      chapters: [],
    };

    addProject(newProject);
    router.push(`/edit/${newProject.id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Create New Project</h1>
          <p className="text-gray-600 mt-2">Set up your AI-powered training course generation</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Project Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Project Name
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="e.g., Full-Stack Web Development Course"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* AI Model Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              AI Model
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <ModelOption
                id="claude"
                name="claude-haiku-3.5"
                title="Claude Haiku 3.5"
                description="Fast & efficient"
                cost="~$3/course"
                selected={selectedModel === 'claude-haiku-3.5'}
                onSelect={() => setSelectedModel('claude-haiku-3.5')}
              />
              <ModelOption
                id="gpt"
                name="gpt-4o-mini"
                title="GPT-4o Mini"
                description="OpenAI's latest"
                cost="~$2/course"
                selected={selectedModel === 'gpt-4o-mini'}
                onSelect={() => setSelectedModel('gpt-4o-mini')}
              />
              <ModelOption
                id="gemini"
                name="gemini-flash-2.0"
                title="Gemini Flash 2.0"
                description="Google's fast model"
                cost="~$2/course"
                selected={selectedModel === 'gemini-flash-2.0'}
                onSelect={() => setSelectedModel('gemini-flash-2.0')}
              />
            </div>
          </div>

          {/* API Key */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={getAPIKeyPlaceholder(selectedModel)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="mt-2 text-sm text-gray-600">
              Your API key is stored locally and never sent to our servers.
            </p>
            <label className="flex items-center mt-3">
              <input
                type="checkbox"
                checked={saveKey}
                onChange={(e) => setSaveKey(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">
                Remember this API key for future projects
              </span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              onClick={() => router.push('/dashboard')}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Project
            </button>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="font-semibold text-blue-900 mb-2">How it works</h3>
          <ol className="list-decimal list-inside space-y-1 text-sm text-blue-800">
            <li>Create a YAML outline defining your course structure</li>
            <li>Generate content for each chapter automatically</li>
            <li>Preview and refine the generated materials</li>
            <li>Export to multiple formats (markdown, PDF, LMS packages)</li>
          </ol>
        </div>
      </div>
    </div>
  );
}

function ModelOption({
  id,
  name,
  title,
  description,
  cost,
  selected,
  onSelect,
}: {
  id: string;
  name: string;
  title: string;
  description: string;
  cost: string;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <div
      onClick={onSelect}
      className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
        selected
          ? 'border-blue-600 bg-blue-50'
          : 'border-gray-200 hover:border-blue-300'
      }`}
    >
      <input
        type="radio"
        id={id}
        name="model"
        checked={selected}
        onChange={onSelect}
        className="mb-2"
      />
      <label htmlFor={id} className="cursor-pointer">
        <h4 className="font-semibold text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600">{description}</p>
        <p className="text-sm font-semibold text-blue-600 mt-1">{cost}</p>
      </label>
    </div>
  );
}

function getAPIKeyPlaceholder(model: AIModel): string {
  switch (model) {
    case 'claude-haiku-3.5':
      return 'sk-ant-api03-...';
    case 'gpt-4o-mini':
      return 'sk-proj-...';
    case 'gemini-flash-2.0':
      return 'AIza...';
    default:
      return 'Enter your API key';
  }
}
