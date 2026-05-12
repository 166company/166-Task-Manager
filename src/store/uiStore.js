import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useUIStore = create(
  persist(
    (set) => ({
      theme: window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light',
      language: 'az',
      sidebarCollapsed: false,
      activeView: 'kanban',
      taskModalOpen: false,
      taskModalId: null,
      createTaskModal: false,
      createTaskStatus: 'todo',

      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set(state => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      setLanguage: (language) => set({ language }),
      toggleSidebar: () => set(state => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setActiveView: (view) => set({ activeView: view }),

      openTaskModal: (taskId) => set({ taskModalOpen: true, taskModalId: taskId }),
      closeTaskModal: () => set({ taskModalOpen: false, taskModalId: null }),

      openCreateTaskModal: (status = 'todo') => set({ createTaskModal: true, createTaskStatus: status }),
      closeCreateTaskModal: () => set({ createTaskModal: false }),
    }),
    {
      name: '166-ui-prefs',
      partialize: (state) => ({
        theme: state.theme,
        language: state.language,
        sidebarCollapsed: state.sidebarCollapsed,
        activeView: state.activeView,
      }),
    }
  )
)
