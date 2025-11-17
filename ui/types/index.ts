export interface TrainingProject {
  id: string;
  name: string;
  outline: string;
  model: AIModel;
  apiKey: string;
  status: ProjectStatus;
  createdAt: Date;
  updatedAt: Date;
  chapters: Chapter[];
}

export interface Chapter {
  number: number;
  title: string;
  status: ChapterStatus;
  components: ChapterComponent[];
  generatedAt?: Date;
}

export interface ChapterComponent {
  name: string;
  filename: string;
  content?: string;
  status: ComponentStatus;
  size?: number;
  warnings?: string[];
}

export type AIModel = 'claude-haiku-3.5' | 'gpt-4o-mini' | 'gemini-flash-2.0';

export type ProjectStatus = 'draft' | 'generating' | 'completed' | 'error';

export type ChapterStatus = 'pending' | 'generating' | 'completed' | 'error';

export type ComponentStatus = 'pending' | 'generating' | 'completed' | 'error';

export interface GenerationProgress {
  projectId: string;
  currentChapter: number;
  totalChapters: number;
  currentComponent: string;
  progress: number; // 0-100
  message: string;
}

export interface APIKeyConfig {
  model: AIModel;
  apiKey: string;
}
