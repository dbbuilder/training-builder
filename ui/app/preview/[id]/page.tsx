'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProjectStore } from '@/stores/projectStore';
import ChapterPreview from '@/components/ChapterPreview';

export default function PreviewPage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { projects } = useProjectStore();
  const [project, setProject] = useState<any>(null);

  useEffect(() => {
    const foundProject = projects.find((p) => p.id === projectId);
    if (!foundProject) {
      router.push('/dashboard');
      return;
    }
    setProject(foundProject);
  }, [projectId, projects, router]);

  const handleExport = () => {
    // Simulate ZIP export
    alert('Export functionality coming soon! This will download a ZIP file with all content.');
  };

  const handleBackToDashboard = () => {
    router.push('/dashboard');
  };

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">⏳</div>
          <p className="text-gray-600">Loading...</p>
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
            onClick={handleBackToDashboard}
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Dashboard
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-900">{project.name}</h1>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                ✓ Completed
              </span>
              <span>•</span>
              <span>{project.chapters?.length || 0} chapters</span>
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleExport}
            className="px-6 py-2 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-colors"
          >
            📦 Export to ZIP
          </button>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 overflow-hidden">
        <ChapterPreview chapters={project.chapters || []} />
      </div>

      {/* Footer Stats */}
      <div className="p-3 bg-white border-t border-gray-200 flex justify-between text-sm text-gray-600">
        <div>
          Generated: {project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'N/A'}
        </div>
        <div>
          Model: {project.model}
        </div>
        <div>
          Total Chapters: {project.chapters?.length || 0}
        </div>
      </div>
    </div>
  );
}
