'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useProjectStore } from '@/stores/projectStore';
import GenerationMonitor from '@/components/GenerationMonitor';
import type { Chapter } from '@/types';

export default function GeneratePage() {
  const router = useRouter();
  const params = useParams();
  const projectId = params.id as string;

  const { projects, updateProject } = useProjectStore();
  const [project, setProject] = useState<any>(null);
  const [chapters, setChapters] = useState<Chapter[]>([]);

  useEffect(() => {
    const foundProject = projects.find((p) => p.id === projectId);
    if (!foundProject) {
      router.push('/dashboard');
      return;
    }

    setProject(foundProject);

    // Parse chapters from outline (simple heuristic)
    const chapterMatches = foundProject.outline.match(
      /- number: (\d+)\s+title: "([^"]+)"/g
    );

    if (chapterMatches) {
      const parsedChapters: Chapter[] = chapterMatches.map((match) => {
        const numberMatch = match.match(/number: (\d+)/);
        const titleMatch = match.match(/title: "([^"]+)"/);

        return {
          number: parseInt(numberMatch?.[1] || '0'),
          title: titleMatch?.[1] || 'Untitled',
          status: 'pending',
          components: [],
        };
      });

      setChapters(parsedChapters);
    }
  }, [projectId, projects, router]);

  const handleComplete = () => {
    if (!project) return;

    updateProject(project.id, {
      status: 'completed',
      chapters,
    });

    router.push(`/preview/${project.id}`);
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{project.name}</h1>
          <p className="text-gray-600 mt-2">
            Generating {chapters.length} chapters using {project.model}
          </p>
        </div>

        {/* Generation Monitor */}
        <GenerationMonitor
          projectId={projectId}
          chapters={chapters}
          onComplete={handleComplete}
        />
      </div>
    </div>
  );
}
