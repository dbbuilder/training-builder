'use client';

import { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';

interface OutlineEditorProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const EXAMPLE_OUTLINE = `# Full-Stack Web Development Course
# 20 chapters covering modern web development

course:
  title: "Full-Stack Web Development with React and Node.js"
  description: "Comprehensive course covering frontend, backend, and deployment"
  duration: "120 hours"
  level: "Intermediate"

chapters:
  - number: 1
    title: "Introduction to Full-Stack Development & Project Overview"
    duration: "2 hours"
    topics:
      - What is full-stack development
      - Modern web architecture
      - Tools and environment setup
      - Course roadmap

  - number: 2
    title: "JavaScript Fundamentals & ES6+ Features"
    duration: "4 hours"
    topics:
      - Modern JavaScript syntax
      - Arrow functions and destructuring
      - Promises and async/await
      - Modules and imports

  - number: 3
    title: "React Fundamentals & Component Architecture"
    duration: "6 hours"
    topics:
      - JSX and components
      - Props and state
      - Lifecycle methods
      - Hooks (useState, useEffect)

  # Add 17 more chapters...
`;

export default function OutlineEditor({
  value,
  onChange,
  readOnly = false,
}: OutlineEditorProps) {
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor) => {
    editorRef.current = editor;
  };

  const handleLoadExample = () => {
    onChange(EXAMPLE_OUTLINE);
  };

  const handleDownload = () => {
    const blob = new Blob([value], { type: 'text/yaml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'course-outline.yaml';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center justify-between p-3 bg-gray-100 border-b border-gray-300">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Course Outline (YAML)</span>
          {readOnly && (
            <span className="px-2 py-1 text-xs bg-yellow-100 text-yellow-800 rounded">
              Read Only
            </span>
          )}
        </div>
        <div className="flex gap-2">
          {!readOnly && value.trim() === '' && (
            <button
              onClick={handleLoadExample}
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
            >
              Load Example
            </button>
          )}
          <button
            onClick={handleDownload}
            className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
            disabled={value.trim() === ''}
          >
            Download YAML
          </button>
        </div>
      </div>

      {/* Monaco Editor */}
      <div className="flex-1 relative">
        <Editor
          height="100%"
          defaultLanguage="yaml"
          value={value}
          onChange={(newValue) => onChange(newValue || '')}
          onMount={handleEditorDidMount}
          theme="vs-light"
          options={{
            readOnly,
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            rulers: [80],
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
            tabSize: 2,
            insertSpaces: true,
          }}
        />
      </div>

      {/* Help Text */}
      {!readOnly && (
        <div className="p-3 bg-blue-50 border-t border-blue-200 text-sm text-blue-800">
          <strong>Tip:</strong> Define your course structure in YAML format. Include
          chapter titles, topics, and durations. The AI will generate complete content
          for each chapter.
        </div>
      )}
    </div>
  );
}
