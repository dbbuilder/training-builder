'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProjectStore } from '@/stores/projectStore';
import OutlineEditor from '@/components/OutlineEditor';

export default function EditProjectPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { projects, currentProject, setCurrentProject, updateProject } = useProjectStore();
  const [outline, setOutline] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load project on mount
  useEffect(() => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      router.push('/dashboard');
      return;
    }
    setCurrentProject(project);
    setOutline(project.outline);
  }, [projectId, projects, setCurrentProject, router]);

  // Auto-save (debounced)
  useEffect(() => {
    if (!currentProject) return;

    const timer = setTimeout(() => {
      if (outline !== currentProject.outline) {
        handleSave();
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timer);
  }, [outline, currentProject]);

  const handleSave = async () => {
    if (!currentProject) return;

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 300)); // Simulate save delay

    updateProject(currentProject.id, { outline });
    setLastSaved(new Date());
    setIsSaving(false);
  };

  const handleGenerate = () => {
    if (!currentProject || !outline.trim()) {
      alert('Please create an outline before generating content');
      return;
    }

    // Parse YAML to count chapters (simple heuristic)
    const chapterMatches = outline.match(/- number: (\d+)/g);
    if (!chapterMatches || chapterMatches.length === 0) {
      alert('No chapters found in outline. Please add chapters in YAML format.');
      return;
    }

    // Update project status and navigate to generation page
    updateProject(currentProject.id, {
      status: 'generating',
      outline,
    });

    router.push(`/generate/${currentProject.id}`);
  };

  const handleValidate = () => {
    // Simple YAML validation
    try {
      if (!outline.includes('chapters:')) {
        throw new Error('Missing "chapters:" section');
      }
      if (!outline.match(/- number: \d+/)) {
        throw new Error('No chapters defined. Use "- number: X" format');
      }
      if (!outline.match(/title:/)) {
        throw new Error('Chapters must have "title:" field');
      }

      alert('✓ Outline looks good! Ready to generate.');
    } catch (error: any) {
      alert(`❌ Validation Error: ${error.message}`);
    }
  };

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading project...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{currentProject.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span>Model: {currentProject.model}</span>
              <span>•</span>
              {isSaving ? (
                <span className="text-blue-600">Saving...</span>
              ) : lastSaved ? (
                <span>Saved {lastSaved.toLocaleTimeString()}</span>
              ) : (
                <span>Not saved</span>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleValidate}
            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg font-medium hover:bg-gray-300 transition-colors"
          >
            Validate
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isSaving ? 'Saving...' : 'Save'}
          </button>
          <button
            onClick={handleGenerate}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            🚀 Generate Content
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-hidden">
        <OutlineEditor value={outline} onChange={setOutline} />
      </div>

      {/* Stats Footer */}
      <div className="p-3 bg-white border-t border-gray-200 flex justify-between text-sm text-gray-600">
        <div>
          Lines: {outline.split('\n').length} | Characters: {outline.length}
        </div>
        <div>
          Chapters: {(outline.match(/- number: \d+/g) || []).length}
        </div>
      </div>
    </div>
  );
}
