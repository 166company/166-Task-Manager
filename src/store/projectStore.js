import { create } from 'zustand'
import { projectService } from '../services/projectService'

export const useProjectStore = create((set, get) => ({
  workspaces: [],
  currentWorkspace: null,
  projects: [],
  currentProject: null,
  members: [],
  labels: [],
  loading: false,

  fetchWorkspaces: async (userId) => {
    set({ loading: true })
    const workspaces = await projectService.getWorkspaces(userId)
    const current = workspaces[0] || null
    set({ workspaces, currentWorkspace: current, loading: false })
    if (current) get().fetchProjects(current.id)
  },

  setCurrentWorkspace: (workspace) => {
    set({ currentWorkspace: workspace, currentProject: null, projects: [] })
    get().fetchProjects(workspace.id)
    get().fetchMembers(workspace.id)
  },

  createWorkspace: async (name, description, ownerId, color, icon) => {
    const ws = await projectService.createWorkspace(name, description, ownerId, color, icon)
    set(state => ({ workspaces: [...state.workspaces, ws], currentWorkspace: ws }))
    return ws
  },

  updateWorkspace: async (id, updates) => {
    const ws = await projectService.updateWorkspace(id, updates)
    set(state => ({
      workspaces: state.workspaces.map(w => w.id === id ? ws : w),
      currentWorkspace: state.currentWorkspace?.id === id ? ws : state.currentWorkspace,
    }))
  },

  deleteWorkspace: async (id) => {
    await projectService.deleteWorkspace(id)
    set(state => {
      const workspaces = state.workspaces.filter(w => w.id !== id)
      return { workspaces, currentWorkspace: workspaces[0] || null }
    })
  },

  fetchProjects: async (workspaceId) => {
    const projects = await projectService.getProjects(workspaceId)
    set({ projects })
  },

  setCurrentProject: (project) => {
    set({ currentProject: project })
    if (project) get().fetchLabels(project.id)
  },

  createProject: async (workspaceId, data, createdBy) => {
    const project = await projectService.createProject(
      workspaceId, data.name, data.description, data.color, data.icon, createdBy
    )
    set(state => ({ projects: [...state.projects, project] }))
    return project
  },

  updateProject: async (id, updates) => {
    const project = await projectService.updateProject(id, updates)
    set(state => ({
      projects: state.projects.map(p => p.id === id ? project : p),
      currentProject: state.currentProject?.id === id ? project : state.currentProject,
    }))
  },

  deleteProject: async (id) => {
    await projectService.deleteProject(id)
    set(state => ({
      projects: state.projects.filter(p => p.id !== id),
      currentProject: state.currentProject?.id === id ? null : state.currentProject,
    }))
  },

  fetchMembers: async (workspaceId) => {
    const members = await projectService.getWorkspaceMembers(workspaceId)
    set({ members })
  },

  inviteMember: async (workspaceId, email, role) => {
    await projectService.inviteMember(workspaceId, email, role)
    get().fetchMembers(workspaceId)
  },

  fetchLabels: async (projectId) => {
    const labels = await projectService.getLabels(projectId)
    set({ labels })
  },

  createLabel: async (projectId, name, color) => {
    const label = await projectService.createLabel(projectId, name, color)
    set(state => ({ labels: [...state.labels, label] }))
    return label
  },
}))
