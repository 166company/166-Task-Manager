import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { useTaskStore } from '../../store/taskStore'
import { useProjectStore } from '../../store/projectStore'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { STATUSES, PRIORITIES } from '../../utils/constants'
import Avatar from '../ui/Avatar'

export default function TaskForm({ onClose, initialStatus = 'todo', parentTaskId = null }) {
  const { t } = useTranslation()
  const { createTask } = useTaskStore()
  const { currentProject, members, labels } = useProjectStore()
  const { user } = useAuthStore()
  const { closeCreateTaskModal } = useUIStore()

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: initialStatus,
    priority: 'medium',
    assignee_id: null,
    due_date: '',
    start_date: '',
    selectedLabels: [],
  })
  const [loading, setLoading] = useState(false)

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim() || !currentProject) return
    setLoading(true)
    try {
      await createTask({
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        priority: form.priority,
        assignee_id: form.assignee_id || null,
        due_date: form.due_date || null,
        start_date: form.start_date || null,
        project_id: currentProject.id,
        created_by: user.id,
        parent_task_id: parentTaskId,
        order_index: 9999,
      })
      toast.success(t('success.created'))
      closeCreateTaskModal()
      onClose?.()
    } catch (err) {
      toast.error(err.message || t('errors.generic'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <Input
        label={t('task.title')}
        value={form.title}
        onChange={e => set('title', e.target.value)}
        placeholder="Tapşırığın başlığını yazın..."
        autoFocus
        required
      />

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{t('task.status')}</label>
          <select
            value={form.status}
            onChange={e => set('status', e.target.value)}
            className="input"
          >
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{t('task.priority')}</label>
          <select
            value={form.priority}
            onChange={e => set('priority', e.target.value)}
            className="input"
          >
            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{t('task.startDate')}</label>
          <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} className="input" />
        </div>
        <div className="flex-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{t('task.dueDate')}</label>
          <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} className="input" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{t('task.assignee')}</label>
        <select
          value={form.assignee_id || ''}
          onChange={e => set('assignee_id', e.target.value || null)}
          className="input"
        >
          <option value="">— Seçilməyib —</option>
          {members.map(m => (
            <option key={m.user_id} value={m.user_id}>
              {m.profile?.full_name || m.profile?.email}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{t('task.description')}</label>
        <textarea
          value={form.description}
          onChange={e => set('description', e.target.value)}
          placeholder="Tapşırıq haqqında ətraflı..."
          rows={3}
          className="input resize-none"
        />
      </div>

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="secondary" onClick={() => { onClose?.(); closeCreateTaskModal() }}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={loading}>
          {t('common.create')}
        </Button>
      </div>
    </form>
  )
}
