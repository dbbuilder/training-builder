# Training Builder Web UI - Architecture

## System Overview

**Full-stack web application** for creating AI-generated training curricula with outline editing, live generation monitoring, preview, and export.

### Tech Stack

**Frontend (Vercel):**
- Next.js 14 (App Router)
- React 18 + TypeScript
- Tailwind CSS
- Zustand (state management)
- React Query (API caching)
- Monaco Editor (outline editing)
- Markdown preview (react-markdown)

**Backend Options:**

1. **Option A: Serverless (Vercel/Railway/Render)**
   - Next.js API routes on Vercel
   - PostgreSQL (Neon/Supabase) for job storage
   - WebSockets via Pusher/Ably for real-time updates
   - File storage: Vercel Blob / AWS S3

2. **Option B: Self-Hosted (DigitalOcean/Hetzner)**
   - Express.js API server
   - PostgreSQL
   - WebSockets (Socket.io)
   - Local file storage

**Recommended: Option A** (Serverless on Vercel + Neon PostgreSQL + Pusher)

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Vercel)                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Outline   │  │ Generation │  │  Preview   │            │
│  │  Editor    │→ │  Monitor   │→ │  & Export  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            ↓ API calls
┌─────────────────────────────────────────────────────────────┐
│              Backend API (Vercel Serverless)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │ Outline API  │  │ Generation   │  │  Export API  │      │
│  │ (CRUD)       │  │ Orchestrator │  │  (ZIP)       │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  PostgreSQL  │  │    Pusher    │  │ Vercel Blob  │      │
│  │   (Neon)     │  │  (WebSocket) │  │  (Storage)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  AI Providers (BYOK)                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Claude     │  │   OpenAI     │  │   Gemini     │      │
│  │  Haiku 3.5   │  │  GPT-4o Mini │  │  Flash 2.0   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

---

## User Flow

### 1. Setup & Configuration
```
User lands → Configure API Keys → Select AI Model → Set Budget
```

### 2. Outline Management
```
Create Project → Edit Curriculum YAML →
  ┌─ Manual edit (Monaco Editor)
  └─ AI-assisted (suggest chapters, topics)
```

### 3. Approval & Generation
```
Review Outline → Approve → Start Generation →
  ┌─ Real-time progress (WebSocket)
  ├─ Cost tracking (live updates)
  └─ Error handling (retry failed chapters)
```

### 4. Preview & Export
```
Generation Complete →
  ┌─ Preview chapters (markdown viewer)
  ├─ Download individual files
  └─ Export all (ZIP download)
```

---

## Database Schema

```sql
-- Projects (curriculum outlines)
CREATE TABLE projects (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL, -- From session/auth
  name VARCHAR(255) NOT NULL,
  description TEXT,
  curriculum_yaml TEXT NOT NULL, -- YAML outline
  ai_model VARCHAR(50) NOT NULL, -- 'claude-haiku', 'gpt4o-mini', 'gemini-flash'
  budget_limit DECIMAL(10,2),
  status VARCHAR(50), -- 'draft', 'approved', 'generating', 'completed', 'failed'
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Generation jobs
CREATE TABLE generation_jobs (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  status VARCHAR(50), -- 'pending', 'running', 'completed', 'failed'
  total_chapters INTEGER,
  completed_chapters INTEGER,
  failed_chapters INTEGER,
  current_batch INTEGER,
  total_cost DECIMAL(10,4),
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT
);

-- Chapter generations (individual progress tracking)
CREATE TABLE chapter_generations (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES generation_jobs(id),
  chapter_number INTEGER,
  status VARCHAR(50), -- 'pending', 'generating', 'completed', 'failed'
  file_sizes JSONB, -- { "book-chapter": 20480, "exercises": 12288, ... }
  warnings JSONB, -- Array of warning messages
  cost DECIMAL(10,4),
  duration_seconds INTEGER,
  started_at TIMESTAMP,
  completed_at TIMESTAMP,
  error_message TEXT
);

-- Generated files (stored in blob storage, metadata here)
CREATE TABLE generated_files (
  id UUID PRIMARY KEY,
  job_id UUID REFERENCES generation_jobs(id),
  chapter_number INTEGER,
  file_type VARCHAR(50), -- 'book-chapter', 'exercises', 'quiz', etc.
  file_name VARCHAR(255),
  blob_url TEXT, -- Vercel Blob URL
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

-- API keys (encrypted, user-provided)
CREATE TABLE api_keys (
  id UUID PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL,
  provider VARCHAR(50), -- 'anthropic', 'openai', 'google'
  encrypted_key TEXT NOT NULL, -- AES-256 encrypted
  created_at TIMESTAMP DEFAULT NOW()
);
```

---

## API Endpoints

### Outline Management
```
POST   /api/projects              # Create new project
GET    /api/projects              # List user's projects
GET    /api/projects/:id          # Get project details
PUT    /api/projects/:id          # Update project (outline, config)
DELETE /api/projects/:id          # Delete project
POST   /api/projects/:id/validate # Validate YAML outline
```

### AI Key Management
```
POST   /api/keys                  # Store encrypted API key
GET    /api/keys                  # List available providers
DELETE /api/keys/:provider        # Remove API key
POST   /api/keys/test             # Test API key validity
```

### Generation
```
POST   /api/projects/:id/generate # Start generation job
GET    /api/jobs/:id              # Get job status
POST   /api/jobs/:id/cancel       # Cancel running job
GET    /api/jobs/:id/chapters     # Get all chapter statuses
GET    /api/jobs/:id/cost         # Get real-time cost tracking
```

### Preview & Export
```
GET    /api/files/:id             # Get file content (markdown)
GET    /api/files/:id/download    # Download single file
POST   /api/jobs/:id/export       # Generate ZIP of all files
GET    /api/exports/:id           # Download ZIP file
```

### WebSocket Events (Pusher)
```
Channel: private-job-{jobId}

Events:
  chapter.started     { chapter: 1, status: 'generating' }
  chapter.progress    { chapter: 1, step: '3/7', message: 'Generating exercises...' }
  chapter.completed   { chapter: 1, status: 'completed', files: {...}, cost: 0.12 }
  chapter.failed      { chapter: 1, error: 'API rate limit' }
  job.completed       { total_cost: 2.45, duration: 1850 }
  cost.updated        { current_cost: 1.23, budget_remaining: 3.77 }
```

---

## File Structure

```
training-builder-web/
├── app/                          # Next.js 14 App Router
│   ├── page.tsx                  # Landing page
│   ├── dashboard/
│   │   └── page.tsx              # Project list
│   ├── projects/
│   │   ├── new/
│   │   │   └── page.tsx          # Create project
│   │   ├── [id]/
│   │   │   ├── page.tsx          # Project overview
│   │   │   ├── edit/
│   │   │   │   └── page.tsx      # Outline editor
│   │   │   ├── generate/
│   │   │   │   └── page.tsx      # Generation monitor
│   │   │   └── preview/
│   │   │       └── page.tsx      # Preview & export
│   ├── api/
│   │   ├── projects/             # Project CRUD
│   │   ├── keys/                 # API key management
│   │   ├── jobs/                 # Generation jobs
│   │   ├── files/                # File management
│   │   └── exports/              # ZIP exports
│   └── layout.tsx                # Root layout
├── components/
│   ├── OutlineEditor.tsx         # Monaco-based YAML editor
│   ├── GenerationMonitor.tsx     # Real-time progress display
│   ├── ChapterPreview.tsx        # Markdown viewer
│   ├── CostTracker.tsx           # Live cost display
│   ├── ModelSelector.tsx         # AI model dropdown
│   └── KeyManagement.tsx         # API key input/management
├── lib/
│   ├── db.ts                     # Database client (Neon)
│   ├── pusher.ts                 # Pusher client
│   ├── blob.ts                   # Vercel Blob helpers
│   ├── generators/               # Port of existing generators
│   │   ├── chapter-generator.ts
│   │   ├── exercise-generator.ts
│   │   └── ...
│   ├── ai-providers/
│   │   ├── anthropic.ts          # Claude client
│   │   ├── openai.ts             # OpenAI client
│   │   └── google.ts             # Gemini client
│   └── crypto.ts                 # API key encryption
├── stores/
│   └── useProjectStore.ts        # Zustand state management
├── types/
│   └── index.ts                  # TypeScript types
└── package.json
```

---

## Key Features

### 1. Outline Editor (Multi-stage)

**Stage 1: Basic Info**
```yaml
courseTitle: "Parts-Co Full-Stack E-Commerce Training"
courseDescription: "Build a complete e-commerce platform"
targetAudience: "Intermediate developers"
estimatedHours: 40
```

**Stage 2: Chapter Structure**
```yaml
chapters:
  - number: 1
    title: "Introduction to Full-Stack Development"
    learningObjectives:
      - "Understand full-stack architecture"
      - "Set up development environment"
```

**Stage 3: AI-Assisted Expansion**
- Click "Suggest Topics" → AI generates detailed topics
- Click "Expand Learning Objectives" → AI adds objectives
- Manual refinement allowed

**Stage 4: Final Review & Approval**
- Validation checks (YAML syntax, required fields)
- Preview generated structure
- Cost estimation
- Approve → Lock outline → Start generation

### 2. Real-Time Generation Monitor

```
┌─────────────────────────────────────────────────────┐
│  Generation Progress                                │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ 35%       │
│                                                     │
│  Batch 2/5  ⚡ Parallel: 4 chapters                │
│                                                     │
│  ✅ Chapter 1  (6.4min, $0.12)                     │
│  ✅ Chapter 2  (6.8min, $0.13)                     │
│  ✅ Chapter 3  (7.1min, $0.14)                     │
│  ✅ Chapter 4  (6.5min, $0.12)                     │
│  🔄 Chapter 5  [Step 4/7: Generating exercises...] │
│  🔄 Chapter 6  [Step 2/7: Generating intro...]     │
│  🔄 Chapter 7  [Step 5/7: Generating quiz...]      │
│  🔄 Chapter 8  [Step 3/7: Generating content...]   │
│  ⏳ Chapter 9-20 (pending)                         │
│                                                     │
│  Cost: $0.85 / $5.00                               │
│  Estimated completion: 18 minutes                  │
└─────────────────────────────────────────────────────┘
```

### 3. Chapter Preview

Split view:
- Left: Chapter list (tree view)
- Right: Markdown preview with syntax highlighting
- Download buttons for individual files
- "Export All" button for ZIP

### 4. Model Selection & BYOK

```
┌─────────────────────────────────────────┐
│  AI Model Configuration                 │
├─────────────────────────────────────────┤
│  Model:    ● Claude 3.5 Haiku           │
│            ○ GPT-4o Mini                │
│            ○ Gemini 2.0 Flash           │
│                                         │
│  API Key:  ●●●●●●●●●●●●●●●●  [Test]    │
│            ✅ Valid (tested 2m ago)     │
│                                         │
│  Budget:   $5.00  [Prevent overruns]   │
│                                         │
│  Parallel: [4] chapters at once         │
└─────────────────────────────────────────┘
```

---

## Deployment

### Frontend (Vercel)
```bash
vercel deploy
# Auto-deploy from GitHub main branch
```

### Database (Neon PostgreSQL)
```bash
# Free tier: 0.5 GB storage, 1 compute unit
# Serverless, auto-scaling
```

### WebSockets (Pusher)
```bash
# Free tier: 200k messages/day, 100 connections
# Or use Ably (200k realtime messages/month)
```

### File Storage (Vercel Blob)
```bash
# Free tier: 1 GB storage, 10 GB bandwidth
# Or use AWS S3
```

---

## Cost Estimate (Infrastructure)

**Free Tier (Hobby):**
- Vercel: Free (100 GB bandwidth)
- Neon: Free (0.5 GB)
- Pusher: Free (200k msgs/day)
- Vercel Blob: Free (1 GB)
- **Total: $0/month**

**Paid (Production):**
- Vercel Pro: $20/month
- Neon Scale: $19/month (3 GB)
- Pusher Startup: $49/month (500k msgs/day)
- Vercel Blob: ~$5/month (10 GB)
- **Total: ~$93/month**

---

## Security

1. **API Key Encryption**
   - AES-256-GCM encryption
   - Keys never stored in plaintext
   - Encrypted at rest in database

2. **CORS**
   - Restrict API calls to Vercel domain

3. **Rate Limiting**
   - Vercel Edge Functions: 1000 req/min per IP
   - Prevent abuse

4. **Session Management**
   - NextAuth.js for authentication
   - Or simple session cookies (no auth for BYOK version)

---

## Next Steps

1. **Set up Next.js project** with TypeScript + Tailwind
2. **Create database schema** on Neon
3. **Build outline editor** with Monaco
4. **Port generators** to TypeScript
5. **Implement API routes** for CRUD operations
6. **Add WebSocket integration** with Pusher
7. **Build generation orchestrator**
8. **Create preview UI** with markdown viewer
9. **Implement ZIP export**
10. **Deploy to Vercel**

**Time Estimate:** 2-3 days for MVP, 1 week for full production version.
