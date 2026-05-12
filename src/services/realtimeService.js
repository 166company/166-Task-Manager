import { supabase } from './supabase'

export const realtimeService = {
  subscribeToTasks(projectId, onInsert, onUpdate, onDelete) {
    return supabase
      .channel(`tasks:${projectId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`,
      }, payload => onInsert(payload.new))
      .on('postgres_changes', {
        event: 'UPDATE',
        schema: 'public',
        table: 'tasks',
        filter: `project_id=eq.${projectId}`,
      }, payload => onUpdate(payload.new))
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'tasks',
      }, payload => onDelete(payload.old.id))
      .subscribe()
  },

  subscribeToComments(taskId, onInsert, onDelete) {
    return supabase
      .channel(`comments:${taskId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `task_id=eq.${taskId}`,
      }, payload => onInsert(payload.new))
      .on('postgres_changes', {
        event: 'DELETE',
        schema: 'public',
        table: 'comments',
      }, payload => onDelete(payload.old.id))
      .subscribe()
  },

  unsubscribe(channel) {
    supabase.removeChannel(channel)
  },
}
