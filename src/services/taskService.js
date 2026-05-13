import { supabase } from './supabase'

export const taskService = {
  async getTasks(projectId) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`
        *,
        assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url, email),
        creator:profiles!tasks_created_by_fkey(id, full_name, avatar_url),
        task_labels(label:labels(*)),
        subtasks:tasks!tasks_parent_task_id_fkey(id, title, status)
      `)
      .eq('project_id', projectId)
      .is('parent_task_id', null)
      .order('order_index', { ascending: true })
    if (error) throw error
    return data.map(t => ({
      ...t,
      labels: t.task_labels?.map(tl => tl.label) || [],
      subtask_count: t.subtasks?.length || 0,
    }))
  },

  async getTask(id) {
    const { data, error } = await supabase
      .from('tasks')
      .select(`*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url, email), creator:profiles!tasks_created_by_fkey(id, full_name, avatar_url), task_labels(label:labels(*))`)
      .eq('id', id)
      .single()
    if (error) throw error

    const [subtasksRes, commentsRes, attachmentsRes] = await Promise.all([
      supabase.from('tasks')
        .select('*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url)')
        .eq('parent_task_id', id).order('order_index'),
      supabase.from('comments')
        .select('*, user:profiles(id, full_name, avatar_url)')
        .eq('task_id', id).order('created_at'),
      supabase.from('attachments').select('*').eq('task_id', id),
    ])

    return {
      ...data,
      labels: data.task_labels?.map(tl => tl.label).filter(Boolean) || [],
      subtasks: subtasksRes.data || [],
      comments: commentsRes.data || [],
      attachments: attachmentsRes.data || [],
      activities: [],
    }
  },

  async createTask(taskData) {
    const id = crypto.randomUUID()
    const { error } = await supabase
      .from('tasks')
      .insert({ ...taskData, id })
    if (error) throw error

    const { data, error: selErr } = await supabase
      .from('tasks')
      .select('*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url, email)')
      .eq('id', id)
      .single()
    if (selErr) throw selErr
    return { ...data, labels: [] }
  },

  async updateTask(id, updates) {
    const { data, error } = await supabase
      .from('tasks')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()
    if (error) throw error
    return data
  },

  async deleteTask(id) {
    const { error } = await supabase.from('tasks').delete().eq('id', id)
    if (error) throw error
  },

  async reorderTasks(taskUpdates) {
    const promises = taskUpdates.map(({ id, order_index, status }) =>
      supabase.from('tasks').update({ order_index, status }).eq('id', id)
    )
    await Promise.all(promises)
  },

  async addLabel(taskId, labelId) {
    const { error } = await supabase
      .from('task_labels')
      .insert({ task_id: taskId, label_id: labelId })
    if (error && error.code !== '23505') throw error
  },

  async removeLabel(taskId, labelId) {
    const { error } = await supabase
      .from('task_labels')
      .delete()
      .eq('task_id', taskId)
      .eq('label_id', labelId)
    if (error) throw error
  },

  async addComment(taskId, userId, content) {
    const { data, error } = await supabase
      .from('comments')
      .insert({ task_id: taskId, user_id: userId, content })
      .select('*, user:profiles(id, full_name, avatar_url)')
      .single()
    if (error) throw error
    return data
  },

  async deleteComment(id) {
    const { error } = await supabase.from('comments').delete().eq('id', id)
    if (error) throw error
  },

  async getSubtasks(parentTaskId) {
    const { data, error } = await supabase
      .from('tasks')
      .select('*, assignee:profiles!tasks_assignee_id_fkey(id, full_name, avatar_url)')
      .eq('parent_task_id', parentTaskId)
      .order('order_index', { ascending: true })
    if (error) throw error
    return data
  },

  async logActivity(taskId, userId, action, details = {}) {
    await supabase.from('activities').insert({
      task_id: taskId,
      user_id: userId,
      action,
      details,
    })
  },

  async getDependencies(projectId) {
    const { data, error } = await supabase
      .from('task_dependencies')
      .select('*')
      .in('task_id', (
        await supabase.from('tasks').select('id').eq('project_id', projectId)
      ).data?.map(t => t.id) || [])
    if (error) return []
    return data
  },

  async addDependency(taskId, dependsOnTaskId, type = 'FS') {
    const { data, error } = await supabase
      .from('task_dependencies')
      .insert({ task_id: taskId, depends_on_task_id: dependsOnTaskId, type })
      .select()
      .single()
    if (error) throw error
    return data
  },
}
