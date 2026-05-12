import { useEffect } from 'react'
import { realtimeService } from '../services/realtimeService'
import { useTaskStore } from '../store/taskStore'

export const useRealtime = (projectId) => {
  const { addTaskLocally, updateTaskLocally, removeTaskLocally } = useTaskStore()

  useEffect(() => {
    if (!projectId) return

    const channel = realtimeService.subscribeToTasks(
      projectId,
      addTaskLocally,
      updateTaskLocally,
      removeTaskLocally
    )

    return () => realtimeService.unsubscribe(channel)
  }, [projectId])
}

export const useRealtimeStore = () => ({})
