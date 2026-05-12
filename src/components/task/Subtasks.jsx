import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react'
import { taskService } from '../../services/taskService'
import { useAuthStore } from '../../store/authStore'
import { useProjectStore } from '../../store/projectStore'

export default function Subtasks({ taskId, subtasks = [], onSubtaskAdded, onSubtaskUpdated, onSubtaskDeleted }) {
  const { t } = useTranslation()
  const { user } = useAuthStore()
  const { currentProject } = useProjectStore()
  const [newTitle, setNewTitle] = useState('')
  const [adding, setAdding] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleAdd = async () => {
    if (!newTitle.trim() || !currentProject) return
    setSaving(true)
    try {
      const subtask = await taskService.createTask({
        title: newTitle.trim(),
        project_id: currentProject.id,
        parent_task_id: taskId,
        status: 'todo',
        priority: 'medium',
        created_by: user.id,
        order_index: subtasks.length,
      })
      onSubtaskAdded?.(subtask)
      setNewTitle('')
      setAdding(false)
    } catch {
      toast.error(t('errors.generic'))
    } finally {
      setSaving(false)
    }
  }

  const toggleDone = async (subtask) => {
    const newStatus = subtask.status === 'done' ? 'todo' : 'done'
    try {
      const updated = await taskService.updateTask(subtask.id, { status: newStatus })
      onSubtaskUpdated?.(updated)
    } catch {
      toast.error(t('errors.generic'))
    }
  }

  const handleDelete = async (subtaskId) => {
    try {
      await taskService.deleteTask(subtaskId)
      onSubtaskDeleted?.(subtaskId)
    } catch {
      toast.error(t('errors.generic'))
    }
  }

  const completed = subtasks.filter(s => s.status === 'done').length

  return (
    <div>
      {subtasks.length > 0 && (
        <div className="mb-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500">{completed}/{subtasks.length} tamamlandı</span>
          </div>
          <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all"
              style={{ width: subtasks.length > 0 ? `${(completed / subtasks.length) * 100}%` : '0%' }}
            />
          </div>
        </div>
      )}

      <div className="space-y-1 mb-3">
        {subtasks.map(sub => (
          <div key={sub.id} className="flex items-center gap-2 group py-1">
            <button onClick={() => toggleDone(sub)} className="shrink-0">
              {sub.status === 'done'
                ? <CheckCircle2 className="w-4 h-4 text-green-500" />
                : <Circle className="w-4 h-4 text-gray-400 hover:text-gray-600" />
              }
            </button>
            <span className={`flex-1 text-sm ${sub.status === 'done' ? 'line-through text-gray-400' : 'text-gray-800 dark:text-gray-200'}`}>
              {sub.title}
            </span>
            <button
              onClick={() => handleDelete(sub.id)}
              className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600 transition-all"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {adding ? (
        <div className="flex gap-2">
          <input
            autoFocus
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') handleAdd(); if (e.key === 'Escape') setAdding(false) }}
            placeholder="Alt-tapşırıq başlığı..."
            className="input flex-1 text-sm py-1.5"
          />
          <button onClick={handleAdd} disabled={saving} className="btn-primary text-xs px-3">Əlavə et</button>
          <button onClick={() => setAdding(false)} className="btn-secondary text-xs px-3">İmtina</button>
        </div>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="flex items-center gap-2 text-sm text-gray-400 hover:text-primary-600 transition-colors"
        >
          <Plus className="w-4 h-4" />
          {t('task.addSubtask')}
        </button>
      )}
    </div>
  )
}
