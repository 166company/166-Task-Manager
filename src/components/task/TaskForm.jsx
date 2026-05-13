import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { AlertCircle } from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'
import { useProjectStore } from '../../store/projectStore'
import { useAuthStore } from '../../store/authStore'
import { useUIStore } from '../../store/uiStore'
import { projectService } from '../../services/projectService'
import Input from '../ui/Input'
import Button from '../ui/Button'
import { STATUSES, PRIORITIES } from '../../utils/constants'

export default function TaskForm({ onClose, initialStatus = 'todo', parentTaskId = null }) {
  const { t } = useTranslation()
  const { createTask } = useTaskStore()
  const { workspaces, currentWorkspace, currentProject, members, fetchMembers } = useProjectStore()
  const { user } = useAuthStore()
  const { closeCreateTaskModal } = useUIStore()

  const [selectedWorkspace, setSelectedWorkspace] = useState(currentWorkspace?.id || '')
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState(currentProject?.id || '')
  const [loadingProjects, setLoadingProjects] = useState(false)

  const [form, setForm] = useState({
    title: '',
    description: '',
    status: initialStatus,
    priority: 'medium',
    assignee_id: null,
    due_date: '',
    start_date: '',
  })
  const [loading, setLoading] = useState(false)

  // Load projects when workspace changes
  useEffect(() => {
    if (!selectedWorkspace) return
    setLoadingProjects(true)
    projectService.getProjects(selectedWorkspace)
      .then(p => {
        setProjects(p)
        if (!selectedProject || !p.find(pr => pr.id === selectedProject)) {
          setSelectedProject(p[0]?.id || '')
        }
      })
      .finally(() => setLoadingProjects(false))
    fetchMembers(selectedWorkspace)
  }, [selectedWorkspace])

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.title.trim()) {
      toast.error('Başlıq mütləq daxil edilməlidir')
      return
    }
    if (!selectedWorkspace) {
      toast.error('Workspace seçilməlidir')
      return
    }
    if (!selectedProject) {
      toast.error('Layihə seçilməlidir')
      return
    }

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
        project_id: selectedProject,
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
        label={t('task.title') + ' *'}
        value={form.title}
        onChange={e => set('title', e.target.value)}
        placeholder="Tapşırığın başlığını yazın..."
        autoFocus
        required
      />

      {/* Workspace + Project - Required */}
      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-200 dark:border-indigo-800">
        <div>
          <label className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 block mb-1 uppercase tracking-wide">
            Workspace <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedWorkspace}
            onChange={e => { setSelectedWorkspace(e.target.value); setSelectedProject('') }}
            required
            className="input text-sm"
          >
            <option value="">Seçin...</option>
            {workspaces.map(w => (
              <option key={w.id} value={w.id}>{w.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="text-xs font-semibold text-indigo-700 dark:text-indigo-300 block mb-1 uppercase tracking-wide">
            Layihə <span className="text-red-500">*</span>
          </label>
          <select
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
            required
            disabled={!selectedWorkspace || loadingProjects}
            className="input text-sm disabled:opacity-50"
          >
            <option value="">Seçin...</option>
            {projects.map(p => (
              <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{t('task.status')}</label>
          <select value={form.status} onChange={e => set('status', e.target.value)} className="input">
            {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{t('task.priority')}</label>
          <select value={form.priority} onChange={e => set('priority', e.target.value)} className="input">
            {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{t('task.startDate')}</label>
          <input type="date" value={form.start_date} onChange={e => set('start_date', e.target.value)} className="input" />
        </div>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{t('task.dueDate')}</label>
          <input type="date" value={form.due_date} onChange={e => set('due_date', e.target.value)} className="input" />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">{t('task.assignee')}</label>
        <select value={form.assignee_id || ''} onChange={e => set('assignee_id', e.target.value || null)} className="input">
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
