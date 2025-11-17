'use client';

import { useEffect, useState } from 'react';
import type { Chapter, ChapterComponent } from '@/types';

interface GenerationMonitorProps {
  projectId: string;
  chapters: Chapter[];
  onComplete: () => void;
}

export default function GenerationMonitor({
  projectId,
  chapters,
  onComplete,
}: GenerationMonitorProps) {
  const [progress, setProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(1);
  const [currentComponent, setCurrentComponent] = useState('');
  const [logs, setLogs] = useState<string[]>([]);

  // Simulate generation progress (in production, use WebSocket)
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.random() * 5;
        if (next >= 100) {
          clearInterval(interval);
          onComplete();
          return 100;
        }
        return next;
      });

      // Simulate log messages
      const components = [
        'PowerPoint',
        'Book Chapter',
        'Exercises',
        'Q&A',
        'Quiz',
        'Topics',
        'Instructor Materials',
      ];
      const randomComponent = components[Math.floor(Math.random() * components.length)];
      setCurrentComponent(randomComponent);

      if (Math.random() > 0.7) {
        setLogs((prev) => [
          ...prev.slice(-20), // Keep last 20 logs
          `[${new Date().toLocaleTimeString()}] ${randomComponent}: ${
            ['Generating...', 'Processing...', 'Completed'][
              Math.floor(Math.random() * 3)
            ]
          }`,
        ]);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [onComplete]);

  const completedChapters = Math.floor((progress / 100) * chapters.length);

  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Generating Content</h2>
          <span className="text-3xl font-bold text-blue-600">{progress.toFixed(0)}%</span>
        </div>

        <div className="relative w-full h-6 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-500 to-indigo-600 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>

        <div className="mt-4 flex justify-between text-sm text-gray-600">
          <span>Chapter {currentChapter} of {chapters.length}</span>
          <span>Current: {currentComponent || 'Starting...'}</span>
        </div>
      </div>

      {/* Chapter Status Grid */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Chapter Status</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {chapters.slice(0, 20).map((chapter) => {
            const isCompleted = chapter.number <= completedChapters;
            const isCurrent = chapter.number === currentChapter;

            return (
              <div
                key={chapter.number}
                className={`p-4 rounded-lg border-2 transition-all ${
                  isCompleted
                    ? 'border-green-500 bg-green-50'
                    : isCurrent
                    ? 'border-blue-500 bg-blue-50 animate-pulse'
                    : 'border-gray-200 bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-semibold text-gray-700">
                    Ch. {chapter.number}
                  </span>
                  {isCompleted && <span className="text-green-600">✓</span>}
                  {isCurrent && <span className="text-blue-600">⚙️</span>}
                  {!isCompleted && !isCurrent && <span className="text-gray-400">○</span>}
                </div>
                <p className="text-xs text-gray-600 line-clamp-2">{chapter.title}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Live Logs */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Generation Log</h3>
        <div className="bg-gray-900 rounded-lg p-4 h-64 overflow-y-auto font-mono text-sm">
          {logs.length === 0 ? (
            <div className="text-gray-500">Waiting for logs...</div>
          ) : (
            logs.map((log, i) => (
              <div key={i} className="text-green-400 mb-1">
                {log}
              </div>
            ))
          )}
        </div>
      </div>

      {/* Cost Estimation */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="font-semibold text-blue-900">Estimated Cost</h4>
            <p className="text-sm text-blue-700">
              Based on {chapters.length} chapters
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-blue-900">
              ${((chapters.length * 0.16).toFixed(2))}
            </div>
            <div className="text-sm text-blue-700">
              ~${(0.16).toFixed(2)}/chapter
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
