import { create } from 'zustand'
import { taskService } from '../services/taskService'

export const useTaskStore = create((set, get) => ({
  tasks: [],
  selectedTask: null,
  loading: false,
  filters: {
    status: [],
    priority: [],
    assignee: [],
    labels: [],
    search: '',
    dateRange: null,
  },

  clearTasks: () => set({ tasks: [], selectedTask: null }),

  fetchTasks: async (projectId) => {
    set({ loading: true, tasks: [] })
    const tasks = await taskService.getTasks(projectId)
    set({ tasks, loading: false })
  },

  fetchTask: async (id) => {
    const task = await taskService.getTask(id)
    set({ selectedTask: task })
    return task
  },

  setSelectedTask: (task) => set({ selectedTask: task }),

  createTask: async (taskData) => {
    const task = await taskService.createTask(taskData)
    set(state => ({ tasks: [...state.tasks, task] }))
    return task
  },

  updateTask: async (id, updates) => {
    const updated = await taskService.updateTask(id, updates)
    set(state => ({
      tasks: state.tasks.map(t => t.id === id ? { ...t, ...updated } : t),
      selectedTask: state.selectedTask?.id === id
        ? { ...state.selectedTask, ...updated }
        : state.selectedTask,
    }))
    return updated
  },

  deleteTask: async (id) => {
    await taskService.deleteTask(id)
    set(state => ({
      tasks: state.tasks.filter(t => t.id !== id),
      selectedTask: state.selectedTask?.id === id ? null : state.selectedTask,
    }))
  },

  reorderTasks: async (taskUpdates) => {
    set(state => {
      const taskMap = new Map(taskUpdates.map(u => [u.id, u]))
      return {
        tasks: state.tasks.map(t => taskMap.has(t.id) ? { ...t, ...taskMap.get(t.id) } : t),
      }
    })
    await taskService.reorderTasks(taskUpdates)
  },

  addTaskLocally: (task) => {
    set(state => {
      if (state.tasks.find(t => t.id === task.id)) return state
      return { tasks: [...state.tasks, { ...task, labels: [] }] }
    })
  },

  updateTaskLocally: (updated) => {
    set(state => ({
      tasks: state.tasks.map(t => t.id === updated.id ? { ...t, ...updated } : t),
    }))
  },

  removeTaskLocally: (id) => {
    set(state => ({ tasks: state.tasks.filter(t => t.id !== id) }))
  },

  setFilters: (filters) => set(state => ({ filters: { ...state.filters, ...filters } })),

  clearFilters: () => set({
    filters: { status: [], priority: [], assignee: [], labels: [], search: '', dateRange: null },
  }),

  getFilteredTasks: () => {
    const { tasks, filters } = get()
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1)

    return tasks.filter(task => {
      if (filters.search && !task.title.toLowerCase().includes(filters.search.toLowerCase())) return false
      if (filters.status.length && !filters.status.includes(task.status)) return false
      if (filters.priority.length && !filters.priority.includes(task.priority)) return false
      if (filters.assignee.length && !filters.assignee.includes(task.assignee_id)) return false
      if (filters.dateRange === 'today') {
        const due = task.due_date ? new Date(task.due_date) : null
        if (!due || due < today || due >= tomorrow) return false
      }
      if (filters.dateRange === 'overdue') {
        const due = task.due_date ? new Date(task.due_date) : null
        if (!due || due >= today || task.status === 'done') return false
      }
      return true
    })
  },
}))
