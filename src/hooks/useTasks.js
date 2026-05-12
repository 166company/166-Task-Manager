import { useEffect } from 'react'
import { useTaskStore } from '../store/taskStore'
import { useRealtimeStore } from './useRealtime'

export const useTasks = (projectId) => {
  const { fetchTasks, tasks, loading } = useTaskStore()

  useEffect(() => {
    if (projectId) fetchTasks(projectId)
  }, [projectId, fetchTasks])

  return { tasks, loading }
}
