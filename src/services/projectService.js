import { supabase } from './supabase'

export const projectService = {
  async getWorkspaces(userId) {
    const { data, error } = await supabase
      .from('workspace_members')
      .select('workspace:workspaces(*)')
      .eq('user_id', userId)
    if (error) throw error
    return data.map(d => d.workspace)
  },

  async createWorkspace(name, description, ownerId, color = '#4F46E5', icon = '🏢') {
    const id = crypto.randomUUID()

    const { error: wsError } = await supabase
      .from('workspaces')
      .insert({ id, name, description, owner_id: ownerId, color, icon })
    if (wsError) throw wsError

    const { error: memberError } = await supabase
      .from('workspace_members')
      .insert({ workspace_id: id, user_id: ownerId, role: 'admin' })
    if (memberError) throw memberError

    const { data, error } = await supabase
      .from('workspaces').select('*').eq('id', id).single()
    if (error) throw error
    return data
  },

  async updateWorkspace(id, updates) {
    const { data, error } = await supabase
      .from('workspaces')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteWorkspace(id) {
    const { error } = await supabase.from('workspaces').delete().eq('id', id)
    if (error) throw error
  },

  async getProjects(workspaceId) {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('workspace_id', workspaceId)
      .eq('archived', false)
      .order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  async createProject(workspaceId, name, description, color, icon, createdBy) {
    const { data, error } = await supabase
      .from('projects')
      .insert({ workspace_id: workspaceId, name, description, color, icon, created_by: createdBy })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async updateProject(id, updates) {
    const { data, error } = await supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteProject(id) {
    const { error } = await supabase.from('projects').delete().eq('id', id)
    if (error) throw error
  },

  async getWorkspaceMembers(workspaceId) {
    const { data, error } = await supabase
      .from('workspace_members')
      .select('*, profile:profiles(*)')
      .eq('workspace_id', workspaceId)
    if (error) throw error
    return data
  },

  async getAllProfiles() {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, full_name, email, avatar_url')
      .order('full_name')
    if (error) throw error
    return data || []
  },

  async inviteMember(workspaceId, userId, role = 'member') {
    const { data, error } = await supabase
      .from('workspace_members')
      .insert({ workspace_id: workspaceId, user_id: userId, role })
      .select()
      .single()
    if (error) throw error
    return data
  },

  async getLabels(projectId) {
    const { data, error } = await supabase
      .from('labels')
      .select('*')
      .eq('project_id', projectId)
    if (error) throw error
    return data
  },

  async createLabel(projectId, name, color) {
    const { data, error } = await supabase
      .from('labels')
      .insert({ project_id: projectId, name, color })
      .select()
      .single()
    if (error) throw error
    return data
  },
}
