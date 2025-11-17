'use client';

import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

interface ChapterPreviewProps {
  chapters: any[];
}

const MOCK_CONTENT = {
  'book-chapter': `# Chapter 1: Introduction to Full-Stack Development

## What is Full-Stack Development?

Full-stack development refers to the practice of working on both the frontend (client-side) and backend (server-side) of web applications...

\`\`\`javascript
// Example: Simple Express server
const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello, Full-Stack!');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
\`\`\`

## Key Concepts

- **Frontend**: User interface, HTML/CSS/JavaScript
- **Backend**: Server logic, databases, APIs
- **DevOps**: Deployment, monitoring, CI/CD`,

  exercises: `# Exercises - Chapter 1

## Exercise 1: Set Up Development Environment

**Difficulty:** Medium
**Estimated Time:** 45 minutes

**Learning Objectives:**
- Install Node.js and npm
- Set up Visual Studio Code
- Create your first Node.js application

**Instructions:**

1. Download and install Node.js from nodejs.org
2. Verify installation: \`node --version\`
3. Create a new directory: \`mkdir hello-world\`
4. Initialize npm: \`npm init -y\`
5. Create index.js with a simple console.log

**Success Criteria:**
- Node.js version 18+ installed
- NPM working correctly
- Successfully run your first Node.js script`,

  quiz: `# Quiz - Chapter 1

## Question 1
**What does "full-stack" mean in web development?**

A) Only frontend development
B) Only backend development
C) Both frontend and backend development ✓
D) Database administration only

**Explanation:** Full-stack development encompasses both client-side (frontend) and server-side (backend) development.

## Question 2
**Which of the following is a frontend technology?**

A) MongoDB
B) React ✓
C) Express
D) PostgreSQL`,
};

export default function ChapterPreview({ chapters }: ChapterPreviewProps) {
  const [selectedChapter, setSelectedChapter] = useState(1);
  const [selectedComponent, setSelectedComponent] = useState('book-chapter');

  const components = [
    { id: 'book-chapter', label: 'Book Chapter', icon: '📖' },
    { id: 'exercises', label: 'Exercises', icon: '✏️' },
    { id: 'quiz', label: 'Quiz', icon: '❓' },
    { id: 'qa', label: 'Q&A', icon: '💬' },
    { id: 'topics', label: 'Topics', icon: '📋' },
    { id: 'instructor', label: 'Instructor Keys', icon: '🔑' },
  ];

  return (
    <div className="flex h-full">
      {/* Sidebar - Chapter List */}
      <div className="w-64 bg-gray-100 border-r border-gray-300 overflow-y-auto">
        <div className="p-4">
          <h3 className="font-semibold text-gray-700 mb-3">Chapters</h3>
          <div className="space-y-1">
            {chapters.slice(0, 20).map((chapter) => (
              <button
                key={chapter.number}
                onClick={() => setSelectedChapter(chapter.number)}
                className={`w-full text-left px-3 py-2 rounded transition-colors ${
                  selectedChapter === chapter.number
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-200 text-gray-700'
                }`}
              >
                <div className="font-medium">Ch. {chapter.number}</div>
                <div className="text-xs opacity-80 truncate">{chapter.title}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Component Tabs */}
        <div className="flex border-b border-gray-300 bg-white">
          {components.map((component) => (
            <button
              key={component.id}
              onClick={() => setSelectedComponent(component.id)}
              className={`px-4 py-3 font-medium transition-colors border-b-2 ${
                selectedComponent === component.id
                  ? 'border-blue-600 text-blue-600'
                  : 'border-transparent text-gray-600 hover:text-gray-900'
              }`}
            >
              {component.icon} {component.label}
            </button>
          ))}
        </div>

        {/* Content Display */}
        <div className="flex-1 overflow-y-auto bg-white p-8">
          <div className="max-w-4xl mx-auto">
            <div className="prose prose-slate max-w-none">
              <ReactMarkdown>
                {MOCK_CONTENT[selectedComponent as keyof typeof MOCK_CONTENT] ||
                  '# Content not available\n\nThis component has not been generated yet.'}
              </ReactMarkdown>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
