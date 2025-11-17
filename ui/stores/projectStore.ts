import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { TrainingProject, APIKeyConfig } from '@/types';

interface ProjectStore {
  projects: TrainingProject[];
  currentProject: TrainingProject | null;
  apiConfig: APIKeyConfig | null;

  // Actions
  setProjects: (projects: TrainingProject[]) => void;
  addProject: (project: TrainingProject) => void;
  updateProject: (id: string, updates: Partial<TrainingProject>) => void;
  deleteProject: (id: string) => void;
  setCurrentProject: (project: TrainingProject | null) => void;
  setAPIConfig: (config: APIKeyConfig) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set) => ({
      projects: [],
      currentProject: null,
      apiConfig: null,

      setProjects: (projects) => set({ projects }),

      addProject: (project) =>
        set((state) => ({
          projects: [...state.projects, project],
        })),

      updateProject: (id, updates) =>
        set((state) => ({
          projects: state.projects.map((p) =>
            p.id === id ? { ...p, ...updates, updatedAt: new Date() } : p
          ),
          currentProject:
            state.currentProject?.id === id
              ? { ...state.currentProject, ...updates, updatedAt: new Date() }
              : state.currentProject,
        })),

      deleteProject: (id) =>
        set((state) => ({
          projects: state.projects.filter((p) => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
        })),

      setCurrentProject: (project) => set({ currentProject: project }),

      setAPIConfig: (config) => set({ apiConfig: config }),
    }),
    {
      name: 'training-builder-storage',
      // Only persist projects and apiConfig (not currentProject)
      partialize: (state) => ({
        projects: state.projects,
        apiConfig: state.apiConfig,
      }),
    }
  )
);
