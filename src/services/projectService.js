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

  async createWorkspace(name, description, ownerId) {
    const { data: ws, error: wsError } = await supabase
      .from('workspaces')
      .insert({ name, description, owner_id: ownerId })
      .select()
      .single()
    if (wsError) throw wsError

    await supabase.from('workspace_members').insert({
      workspace_id: ws.id,
      user_id: ownerId,
      role: 'admin',
    })
    return ws
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

  async inviteMember(workspaceId, email, role = 'member') {
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()
    if (!profile) throw new Error('User not found')

    const { data, error } = await supabase
      .from('workspace_members')
      .insert({ workspace_id: workspaceId, user_id: profile.id, role })
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
