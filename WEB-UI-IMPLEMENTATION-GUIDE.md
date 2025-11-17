# Training Builder Web UI - Implementation Guide

## Quick Start (15 minutes to MVP)

### 1. Create Next.js Project
```bash
cd /mnt/d/dev2/claude-agent-sdk
npx create-next-app@latest training-builder-web \
  --typescript \
  --tailwind \
  --app \
  --no-src-dir \
  --import-alias "@/*" \
  --eslint

cd training-builder-web
```

### 2. Install Dependencies
```bash
npm install \
  zustand \
  @tanstack/react-query \
  react-markdown \
  @monaco-editor/react \
  js-yaml \
  @anthropic-ai/sdk \
  openai \
  @google/generative-ai \
  pusher-js \
  pusher \
  @vercel/postgres \
  @vercel/blob \
  jszip \
  file-saver

npm install -D \
  @types/js-yaml \
  @types/file-saver
```

### 3. Environment Variables
Create `.env.local`:
```bash
# Database (Neon PostgreSQL)
POSTGRES_URL="postgres://..."
POSTGRES_PRISMA_URL="postgres://..."
POSTGRES_URL_NON_POOLING="postgres://..."

# Pusher (WebSocket)
NEXT_PUBLIC_PUSHER_KEY="your_pusher_key"
PUSHER_SECRET="your_pusher_secret"
PUSHER_APP_ID="your_app_id"
NEXT_PUBLIC_PUSHER_CLUSTER="us2"

# Vercel Blob (File Storage)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Encryption key for API keys
ENCRYPTION_KEY="your_32_char_random_string_here"
```

---

## Project Structure Setup

### File Tree
```
training-builder-web/
├── app/
│   ├── page.tsx                    # Landing/dashboard
│   ├── layout.tsx                  # Root layout
│   ├── globals.css                 # Tailwind styles
│   ├── projects/
│   │   ├── page.tsx                # Project list
│   │   ├── new/
│   │   │   └── page.tsx            # Create project
│   │   └── [id]/
│   │       ├── page.tsx            # Project overview
│   │       ├── edit/
│   │       │   └── page.tsx        # Outline editor
│   │       ├── generate/
│   │       │   └── page.tsx        # Generation monitor
│   │       └── preview/
│   │           └── page.tsx        # Preview & export
│   └── api/
│       ├── projects/
│       │   ├── route.ts            # GET, POST projects
│       │   ├── [id]/
│       │   │   ├── route.ts        # GET, PUT, DELETE project
│       │   │   └── generate/
│       │       └── route.ts    # POST start generation
│       ├── jobs/
│       │   └── [id]/
│       │       ├── route.ts        # GET job status
│       │       └── export/
│       │           └── route.ts    # POST create ZIP
│       ├── keys/
│       │   └── route.ts            # API key management
│       └── files/
│           └── [id]/
│               └── route.ts        # GET file content
├── components/
│   ├── OutlineEditor.tsx           # Monaco YAML editor
│   ├── GenerationMonitor.tsx       # Real-time progress
│   ├── ChapterPreview.tsx          # Markdown viewer
│   ├── CostTracker.tsx             # Live cost display
│   ├── ModelSelector.tsx           # AI model dropdown
│   ├── KeyManagement.tsx           # API key setup
│   └── ui/                         # shadcn/ui components
│       ├── button.tsx
│       ├── card.tsx
│       ├── progress.tsx
│       └── ...
├── lib/
│   ├── db.ts                       # Database client
│   ├── pusher.ts                   # WebSocket client
│   ├── blob.ts                     # File storage
│   ├── crypto.ts                   # Encryption utils
│   ├── generators/                 # Port from training-builder
│   │   ├── chapter-generator.ts
│   │   ├── exercise-generator.ts
│   │   └── instructor-keys-generator.ts
│   └── ai-providers/
│       ├── anthropic.ts            # Claude client
│       ├── openai.ts               # OpenAI client
│       └── google.ts               # Gemini client
├── stores/
│   └── useProjectStore.ts          # Zustand state
├── types/
│   └── index.ts                    # TypeScript types
└── sql/
    └── schema.sql                  # Database schema
```

---

## Core Implementation Files

### 1. Database Schema (`sql/schema.sql`)

```sql
-- Create tables
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  curriculum_yaml TEXT NOT NULL,
  ai_model VARCHAR(50) NOT NULL DEFAULT 'claude-haiku',
  budget_limit DECIMAL(10,2) DEFAULT 5.00,
  status VARCHAR(50) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'pending',
  total_chapters INTEGER,
  completed_chapters INTEGER DEFAULT 0,
  failed_chapters INTEGER DEFAULT 0,
  current_batch INTEGER DEFAULT 0,
  total_cost DECIMAL(10,4) DEFAULT 0,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT
);

CREATE TABLE chapter_generations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES generation_jobs(id) ON DELETE CASCADE,
  chapter_number INTEGER,
  status VARCHAR(50) DEFAULT 'pending',
  file_sizes JSONB,
  warnings JSONB,
  cost DECIMAL(10,4),
  duration_seconds INTEGER,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT
);

CREATE TABLE generated_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID REFERENCES generation_jobs(id) ON DELETE CASCADE,
  chapter_number INTEGER,
  file_type VARCHAR(50),
  file_name VARCHAR(255),
  blob_url TEXT,
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR(255) NOT NULL,
  provider VARCHAR(50),
  encrypted_key TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, provider)
);

CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_jobs_project ON generation_jobs(project_id);
CREATE INDEX idx_chapters_job ON chapter_generations(job_id);
CREATE INDEX idx_files_job ON generated_files(job_id);
```

### 2. TypeScript Types (`types/index.ts`)

```typescript
export interface Project {
  id: string;
  userId: string;
  name: string;
  description?: string;
  curriculumYaml: string;
  aiModel: 'claude-haiku' | 'gpt4o-mini' | 'gemini-flash';
  budgetLimit: number;
  status: 'draft' | 'approved' | 'generating' | 'completed' | 'failed';
  createdAt: Date;
  updatedAt: Date;
}

export interface GenerationJob {
  id: string;
  projectId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  totalChapters: number;
  completedChapters: number;
  failedChapters: number;
  currentBatch: number;
  totalCost: number;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
}

export interface ChapterGeneration {
  id: string;
  jobId: string;
  chapterNumber: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  fileSizes?: Record<string, number>;
  warnings?: string[];
  cost?: number;
  durationSeconds?: number;
  startedAt?: Date;
  completedAt?: Date;
  errorMessage?: string;
}

export interface GeneratedFile {
  id: string;
  jobId: string;
  chapterNumber: number;
  fileType: string;
  fileName: string;
  blobUrl: string;
  fileSize: number;
  createdAt: Date;
}

export interface CurriculumConfig {
  courseTitle: string;
  courseDescription: string;
  targetAudience: string;
  estimatedHours: number;
  chapters: ChapterConfig[];
  technologyStack: {
    frontend: { framework: string; library: string };
    backend: { framework: string; api: string };
    database: { name: string; orm: string };
  };
}

export interface ChapterConfig {
  number: number;
  title: string;
  part: string;
  learningObjectives: string[];
  topicsLearned: string[];
  prerequisites: string[];
}
```

### 3. Database Client (`lib/db.ts`)

```typescript
import { sql } from '@vercel/postgres';

export const db = {
  async query<T = any>(text: string, params: any[] = []): Promise<T[]> {
    const result = await sql.query(text, params);
    return result.rows as T[];
  },

  async queryOne<T = any>(text: string, params: any[] = []): Promise<T | null> {
    const result = await sql.query(text, params);
    return result.rows[0] as T || null;
  }
};

// Project queries
export const projectQueries = {
  async create(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>) {
    return db.queryOne<Project>(
      `INSERT INTO projects (user_id, name, description, curriculum_yaml, ai_model, budget_limit, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [project.userId, project.name, project.description, project.curriculumYaml,
       project.aiModel, project.budgetLimit, project.status]
    );
  },

  async findById(id: string) {
    return db.queryOne<Project>(
      'SELECT * FROM projects WHERE id = $1',
      [id]
    );
  },

  async findByUser(userId: string) {
    return db.query<Project>(
      'SELECT * FROM projects WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    );
  },

  async update(id: string, updates: Partial<Project>) {
    const fields = Object.keys(updates).map((key, i) => `${key} = $${i + 2}`).join(', ');
    return db.queryOne<Project>(
      `UPDATE projects SET ${fields}, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [id, ...Object.values(updates)]
    );
  },

  async delete(id: string) {
    await db.query('DELETE FROM projects WHERE id = $1', [id]);
  }
};
```

### 4. Outline Editor Component (`components/OutlineEditor.tsx`)

```typescript
'use client';

import { Editor } from '@monaco-editor/react';
import { useState } from 'react';
import * as yaml from 'js-yaml';
import { Button } from '@/components/ui/button';
import { CurriculumConfig } from '@/types';

export function OutlineEditor({
  initialYaml,
  onSave
}: {
  initialYaml: string;
  onSave: (yaml: string) => void;
}) {
  const [content, setContent] = useState(initialYaml);
  const [error, setError] = useState<string | null>(null);

  const validateYaml = () => {
    try {
      const parsed = yaml.load(content) as CurriculumConfig;

      // Validate required fields
      if (!parsed.courseTitle) throw new Error('courseTitle is required');
      if (!parsed.chapters || parsed.chapters.length === 0) {
        throw new Error('At least one chapter is required');
      }

      setError(null);
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Invalid YAML');
      return false;
    }
  };

  const handleSave = () => {
    if (validateYaml()) {
      onSave(content);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center p-4 border-b">
        <h2 className="text-lg font-semibold">Curriculum Outline Editor</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={validateYaml}>
            Validate
          </Button>
          <Button onClick={handleSave}>
            Save & Approve
          </Button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      <div className="flex-1">
        <Editor
          height="100%"
          defaultLanguage="yaml"
          value={content}
          onChange={(value) => setContent(value || '')}
          theme="vs-dark"
          options={{
            minimap: { enabled: false },
            fontSize: 14,
            lineNumbers: 'on',
            scrollBeyondLastLine: false,
            automaticLayout: true,
          }}
        />
      </div>
    </div>
  );
}
```

### 5. Generation Monitor (`components/GenerationMonitor.tsx`)

```typescript
'use client';

import { useEffect, useState } from 'react';
import Pusher from 'pusher-js';
import { Progress } from '@/components/ui/progress';
import { Card } from '@/components/ui/card';

interface ChapterProgress {
  chapter: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  step?: string;
  cost?: number;
  duration?: number;
}

export function GenerationMonitor({ jobId }: { jobId: string }) {
  const [chapters, setChapters] = useState<ChapterProgress[]>([]);
  const [totalCost, setTotalCost] = useState(0);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const pusher = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
    });

    const channel = pusher.subscribe(`private-job-${jobId}`);

    channel.bind('chapter.started', (data: any) => {
      setChapters(prev => prev.map(ch =>
        ch.chapter === data.chapter
          ? { ...ch, status: 'generating' }
          : ch
      ));
    });

    channel.bind('chapter.progress', (data: any) => {
      setChapters(prev => prev.map(ch =>
        ch.chapter === data.chapter
          ? { ...ch, step: data.message }
          : ch
      ));
    });

    channel.bind('chapter.completed', (data: any) => {
      setChapters(prev => prev.map(ch =>
        ch.chapter === data.chapter
          ? { ...ch, status: 'completed', cost: data.cost, duration: data.duration }
          : ch
      ));
      setProgress(prev => prev + (100 / chapters.length));
    });

    channel.bind('cost.updated', (data: any) => {
      setTotalCost(data.current_cost);
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe(`private-job-${jobId}`);
    };
  }, [jobId, chapters.length]);

  return (
    <Card className="p-6">
      <h2 className="text-2xl font-bold mb-4">Generation Progress</h2>

      <Progress value={progress} className="mb-6" />

      <div className="space-y-2">
        {chapters.map(ch => (
          <div key={ch.chapter} className="flex items-center justify-between p-3 bg-gray-50 rounded">
            <div className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${
                ch.status === 'completed' ? 'bg-green-500' :
                ch.status === 'generating' ? 'bg-blue-500 animate-pulse' :
                ch.status === 'failed' ? 'bg-red-500' :
                'bg-gray-300'
              }`} />
              <span className="font-medium">Chapter {ch.chapter}</span>
              {ch.step && <span className="text-sm text-gray-600">{ch.step}</span>}
            </div>
            <div className="text-sm text-gray-600">
              {ch.cost && `$${ch.cost.toFixed(3)}`}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t">
        <div className="flex justify-between text-lg">
          <span className="font-semibold">Total Cost:</span>
          <span>${totalCost.toFixed(2)}</span>
        </div>
      </div>
    </Card>
  );
}
```

---

## Deployment Steps

### 1. Set up Neon Database
```bash
# Go to https://neon.tech
# Create new project: "training-builder"
# Copy connection string to .env.local
# Run schema.sql in Neon SQL Editor
```

### 2. Set up Pusher
```bash
# Go to https://pusher.com
# Create new app: "training-builder"
# Copy credentials to .env.local
```

### 3. Deploy to Vercel
```bash
# Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/yourusername/training-builder-web.git
git push -u origin main

# Connect to Vercel
vercel link
vercel env pull
vercel deploy --prod
```

---

## Next Steps Priority

1. ✅ Architecture defined
2. ⏭️ Create Next.js project
3. ⏭️ Set up database schema
4. ⏭️ Build outline editor
5. ⏭️ Port generators to TypeScript
6. ⏭️ Implement API routes
7. ⏭️ Add WebSocket integration
8. ⏭️ Build generation orchestrator
9. ⏭️ Create preview UI
10. ⏭️ Deploy to Vercel

**Total Time:** 2-3 days for working MVP with all features.
