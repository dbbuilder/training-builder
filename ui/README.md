# Training Builder Web UI

Modern web interface for the AI-powered Training Builder system. Generate comprehensive training courses using your own API keys with Claude, GPT-4, or Gemini.

## Features

- **BYOK (Bring Your Own Key)**: Use your own API keys - never stored on our servers
- **Multi-Model Support**: Choose between Claude Haiku 3.5, GPT-4o Mini, or Gemini Flash 2.0
- **Visual Outline Editor**: Monaco-powered YAML editor with syntax highlighting
- **Real-Time Monitoring**: Watch your content generate in real-time
- **Preview & Export**: Review all generated content and export to ZIP
- **Mobile Responsive**: Works on desktop, tablet, and mobile devices

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19 + TypeScript 5.9
- **Styling**: Tailwind CSS 4.1
- **Editor**: Monaco Editor 4.7
- **State**: Zustand 5.0 with persistence
- **Markdown**: React Markdown 9.1

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- API key from one of the supported providers:
  - Anthropic Claude (https://console.anthropic.com)
  - OpenAI (https://platform.openai.com)
  - Google Gemini (https://ai.google.dev)

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open browser to http://localhost:3000
```

### Build for Production

```bash
# Create optimized production build
npm run build

# Start production server
npm start

# Deploy to Vercel (recommended)
vercel deploy
```

## Project Structure

```
training-builder-ui/
├── app/                    # Next.js App Router pages
│   ├── page.tsx           # Landing page
│   ├── dashboard/         # Project dashboard
│   ├── create/            # New project creation
│   ├── edit/[id]/         # Outline editor
│   ├── generate/[id]/     # Generation monitor
│   └── preview/[id]/      # Content preview & export
├── components/            # React components
│   ├── OutlineEditor.tsx  # Monaco YAML editor
│   ├── GenerationMonitor.tsx  # Real-time progress
│   └── ChapterPreview.tsx # Markdown viewer
├── stores/                # Zustand state management
│   └── projectStore.ts    # Project CRUD & persistence
├── types/                 # TypeScript definitions
│   └── index.ts          # Type definitions
└── lib/                   # Utility functions
    └── utils.ts          # Helper functions
```

## Usage Guide

### 1. Create a Project

1. Click "New Project" on the dashboard
2. Enter project name
3. Select AI model (Claude, GPT-4, or Gemini)
4. Enter your API key
5. Optionally save key for future use

### 2. Design Your Outline

Use the YAML editor to define your course structure:

```yaml
course:
  title: "Full-Stack Web Development"
  description: "Complete course"
  duration: "120 hours"

chapters:
  - number: 1
    title: "Introduction to Full-Stack Development"
    duration: "2 hours"
    topics:
      - What is full-stack development
      - Modern web architecture
      - Tools and setup

  - number: 2
    title: "JavaScript Fundamentals"
    # ...
```

### 3. Generate Content

1. Click "Validate" to check outline format
2. Click "Generate Content"
3. Monitor real-time progress
4. View live logs and chapter status

### 4. Preview & Export

1. Review generated content by chapter
2. Switch between components (Book, Exercises, Quiz, etc.)
3. Export everything to ZIP file

## Component Overview

### OutlineEditor

Monaco-powered YAML editor with:
- Syntax highlighting
- Auto-save (2 second debounce)
- Example templates
- Download to file
- Read-only mode support

### GenerationMonitor

Real-time progress tracking:
- Overall progress bar
- Per-chapter status grid
- Live generation logs
- Cost estimation
- Animated status indicators

### ChapterPreview

Markdown content viewer:
- Chapter navigation sidebar
- Component tabs (Book, Exercises, Quiz, etc.)
- ReactMarkdown rendering
- Syntax highlighting for code blocks
- Responsive layout

## API Integration (Future)

Currently uses mock data for demonstration. Production integration will include:

1. **Backend API Routes** (`/api/*`)
   - POST /api/generate - Start generation job
   - GET /api/status/:jobId - Check generation status
   - GET /api/content/:jobId/:chapter - Fetch content

2. **WebSocket Updates** (Pusher)
   - Real-time progress updates
   - Live log streaming
   - Chapter completion notifications

3. **Database** (Neon PostgreSQL)
   - Project persistence
   - Generation history
   - Usage analytics

## Environment Variables

Create `.env.local`:

```bash
# Not needed for current BYOK approach
# Future backend integration:
# ANTHROPIC_API_KEY=your-key
# OPENAI_API_KEY=your-key
# GOOGLE_API_KEY=your-key
# DATABASE_URL=postgresql://...
# PUSHER_APP_ID=your-app-id
```

## Deployment

### Vercel (Recommended)

```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## Development

### Code Style

- TypeScript strict mode enabled
- ESLint with Next.js config
- Prettier for formatting (recommended)

### Testing (TODO)

```bash
# Unit tests
npm test

# E2E tests
npm run test:e2e

# Coverage
npm run test:coverage
```

## Performance

### Build Optimization

- Automatic code splitting
- Image optimization (next/image)
- Font optimization (next/font)
- CSS purging (Tailwind)

### Runtime Performance

- Client-side state persistence
- Debounced auto-save
- Lazy loading for Monaco Editor
- Virtualized chapter lists (for 100+ chapters)

## Troubleshooting

### Monaco Editor Not Loading

Ensure webpack config in `next.config.js` includes:

```javascript
webpack: (config, { isServer }) => {
  if (!isServer) {
    config.resolve.fallback = {
      fs: false,
      net: false,
      tls: false,
    };
  }
  return config;
}
```

### Tailwind Styles Not Applying

Verify `tailwind.config.js` content paths:

```javascript
content: [
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
]
```

### localStorage Persistence Issues

Check browser privacy settings - localStorage must be enabled.

## Roadmap

### v1.1 - Backend Integration (Week 2)
- [ ] Port Node.js generators to TypeScript
- [ ] Create Next.js API routes
- [ ] Set up Neon PostgreSQL
- [ ] Implement Pusher WebSocket

### v1.2 - Enhanced Features (Week 3)
- [ ] Dark mode theme
- [ ] Export to multiple formats (PDF, DOCX)
- [ ] Template library
- [ ] Collaborative editing

### v1.3 - Enterprise (Month 2)
- [ ] User authentication
- [ ] Team workspaces
- [ ] Usage analytics
- [ ] Admin dashboard

## Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests (when testing is set up)
5. Submit a pull request

## License

MIT License - See LICENSE file for details

## Support

- **Documentation**: See docs in `/docs` folder
- **Issues**: GitHub Issues
- **Email**: support@training-builder.com (future)

## Credits

Built with:
- [Next.js](https://nextjs.org)
- [Monaco Editor](https://microsoft.github.io/monaco-editor/)
- [Tailwind CSS](https://tailwindcss.com)
- [Zustand](https://github.com/pmndrs/zustand)
- [React Markdown](https://github.com/remarkjs/react-markdown)

## Backend Integration

This UI connects to the Training Builder backend at `/mnt/d/dev2/claude-agent-sdk/training-builder`.

See backend README for:
- Content generation pipeline
- Multi-pass architecture
- Cost tracking
- Quality workflows (Check/Edit, Revise & Extend, Polish, Markdown Formatting)
