'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useProjectStore } from '@/stores/projectStore';

export default function DashboardPage() {
  const { projects, deleteProject } = useProjectStore();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-bold text-gray-900">Training Projects</h1>
            <p className="text-gray-600 mt-2">Manage your AI-generated training courses</p>
          </div>
          <Link
            href="/create"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            + New Project
          </Link>
        </div>

        {/* Projects Grid */}
        {projects.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h2 className="text-2xl font-semibold mb-2">No projects yet</h2>
            <p className="text-gray-600 mb-6">Create your first training course to get started</p>
            <Link
              href="/create"
              className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
            >
              Create Project
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={() => deleteProject(project.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  onDelete,
}: {
  project: any;
  onDelete: () => void;
}) {
  const statusColors = {
    draft: 'bg-gray-100 text-gray-700',
    generating: 'bg-blue-100 text-blue-700',
    completed: 'bg-green-100 text-green-700',
    error: 'bg-red-100 text-red-700',
  };

  const statusIcons = {
    draft: '📝',
    generating: '⚙️',
    completed: '✅',
    error: '❌',
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow p-6">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
          <span
            className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
              statusColors[project.status]
            }`}
          >
            {statusIcons[project.status]} {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
          </span>
        </div>
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-600 transition-colors"
          title="Delete project"
        >
          🗑️
        </button>
      </div>

      <div className="space-y-2 text-sm text-gray-600 mb-4">
        <div>
          <span className="font-medium">Model:</span> {project.model}
        </div>
        <div>
          <span className="font-medium">Chapters:</span> {project.chapters?.length || 0}
        </div>
        <div>
          <span className="font-medium">Updated:</span>{' '}
          {new Date(project.updatedAt).toLocaleDateString()}
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href={`/edit/${project.id}`}
          className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors text-center"
        >
          {project.status === 'draft' ? 'Edit Outline' : 'View Project'}
        </Link>
        {project.status === 'completed' && (
          <button className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors">
            📦 Export
          </button>
        )}
      </div>
    </div>
  );
}
