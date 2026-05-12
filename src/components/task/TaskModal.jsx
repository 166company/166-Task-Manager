import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import {
  Trash2, Calendar, User, Flag, Tag, AlignLeft,
  CheckSquare, MessageSquare, Paperclip, Clock,
} from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useTaskStore } from '../../store/taskStore'
import { useProjectStore } from '../../store/projectStore'
import { useAuthStore } from '../../store/authStore'
import Modal from '../ui/Modal'
import { StatusBadge, PriorityBadge } from '../ui/Badge'
import Avatar from '../ui/Avatar'
import Comments from './Comments'
import Subtasks from './Subtasks'
import Attachments from './Attachments'
import { STATUSES, PRIORITIES } from '../../utils/constants'
import { formatDate } from '../../utils/dateUtils'

const TABS = ['task.description', 'task.subtasks', 'task.comments', 'task.attachments']

export default function TaskModal() {
  const { t } = useTranslation()
  const { taskModalOpen, taskModalId, closeTaskModal } = useUIStore()
  const { fetchTask, selectedTask, updateTask, deleteTask, setSelectedTask } = useTaskStore()
  const { members, labels } = useProjectStore()
  const { user } = useAuthStore()
  const [tab, setTab] = useState(0)
  const [task, setTask] = useState(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (taskModalOpen && taskModalId) {
      fetchTask(taskModalId).then(t => setTask(t))
    } else {
      setTask(null)
    }
  }, [taskModalOpen, taskModalId])

  useEffect(() => {
    if (selectedTask?.id === taskModalId) setTask(selectedTask)
  }, [selectedTask, taskModalId])

  if (!taskModalOpen) return null

  const update = async (field, value) => {
    if (!task) return
    setSaving(true)
    try {
      const updated = await updateTask(task.id, { [field]: value })
      setTask(t => ({ ...t, ...updated }))
    } catch {
      toast.error(t('errors.generic'))
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!task || !confirm('Bu tapşırığı silmək istədiyinizə əminsiniz?')) return
    await deleteTask(task.id)
    closeTaskModal()
    toast.success(t('success.deleted'))
  }

  if (!task) {
    return (
      <Modal open onClose={closeTaskModal} size="full">
        <div className="flex items-center justify-center h-64 text-gray-400">Yüklənir...</div>
      </Modal>
    )
  }

  return (
    <Modal open onClose={closeTaskModal} size="full">
      <div className="flex h-full">
        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Title */}
          <div className="px-6 pt-5 pb-4 border-b border-gray-200 dark:border-gray-700">
            <textarea
              defaultValue={task.title}
              onBlur={e => { if (e.target.value !== task.title) update('title', e.target.value) }}
              className="w-full text-xl font-semibold text-gray-900 dark:text-white bg-transparent resize-none outline-none focus:bg-gray-50 dark:focus:bg-gray-700 rounded-lg px-2 py-1 -ml-2"
              rows={1}
            />
          </div>

          {/* Tabs */}
          <div className="flex gap-0 border-b border-gray-200 dark:border-gray-700 px-6">
            {TABS.map((tabKey, i) => (
              <button
                key={tabKey}
                onClick={() => setTab(i)}
                className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                  tab === i
                    ? 'border-primary-600 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {t(tabKey)}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
            {tab === 0 && (
              <div>
                <textarea
                  defaultValue={task.description || ''}
                  onBlur={e => { if (e.target.value !== (task.description || '')) update('description', e.target.value) }}
                  placeholder="Tapşırıq haqqında ətraflı yazın..."
                  rows={8}
                  className="w-full input resize-none text-sm"
                />
              </div>
            )}

            {tab === 1 && (
              <Subtasks
                taskId={task.id}
                subtasks={task.subtasks || []}
                onSubtaskAdded={sub => setTask(t => ({ ...t, subtasks: [...(t.subtasks || []), sub] }))}
                onSubtaskUpdated={updated => setTask(t => ({ ...t, subtasks: (t.subtasks || []).map(s => s.id === updated.id ? updated : s) }))}
                onSubtaskDeleted={id => setTask(t => ({ ...t, subtasks: (t.subtasks || []).filter(s => s.id !== id) }))}
              />
            )}

            {tab === 2 && (
              <Comments
                taskId={task.id}
                comments={task.comments || []}
                onCommentAdded={c => setTask(t => ({ ...t, comments: [...(t.comments || []), c] }))}
                onCommentDeleted={id => setTask(t => ({ ...t, comments: (t.comments || []).filter(c => c.id !== id) }))}
              />
            )}

            {tab === 3 && (
              <Attachments
                taskId={task.id}
                attachments={task.attachments || []}
                onAttachmentAdded={a => setTask(t => ({ ...t, attachments: [...(t.attachments || []), a] }))}
                onAttachmentDeleted={id => setTask(t => ({ ...t, attachments: (t.attachments || []).filter(a => a.id !== id) }))}
              />
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-64 border-l border-gray-200 dark:border-gray-700 p-4 space-y-4 overflow-y-auto shrink-0">
          {/* Status */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1.5">{t('task.status')}</p>
            <select
              value={task.status}
              onChange={e => update('status', e.target.value)}
              className="input text-sm"
            >
              {STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
            </select>
          </div>

          {/* Priority */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1.5">{t('task.priority')}</p>
            <select
              value={task.priority}
              onChange={e => update('priority', e.target.value)}
              className="input text-sm"
            >
              {PRIORITIES.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
            </select>
          </div>

          {/* Assignee */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1.5">{t('task.assignee')}</p>
            <select
              value={task.assignee_id || ''}
              onChange={e => update('assignee_id', e.target.value || null)}
              className="input text-sm"
            >
              <option value="">— Seçilməyib —</option>
              {members.map(m => (
                <option key={m.user_id} value={m.user_id}>
                  {m.profile?.full_name || m.profile?.email}
                </option>
              ))}
            </select>
          </div>

          {/* Dates */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1.5">{t('task.startDate')}</p>
            <input
              type="date"
              value={task.start_date ? task.start_date.slice(0, 10) : ''}
              onChange={e => update('start_date', e.target.value || null)}
              className="input text-sm"
            />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1.5">{t('task.dueDate')}</p>
            <input
              type="date"
              value={task.due_date ? task.due_date.slice(0, 10) : ''}
              onChange={e => update('due_date', e.target.value || null)}
              className="input text-sm"
            />
          </div>

          {/* Labels */}
          {labels.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase mb-1.5">{t('task.labels')}</p>
              <div className="flex flex-wrap gap-1">
                {labels.map(label => {
                  const active = task.labels?.some(l => l.id === label.id)
                  return (
                    <button
                      key={label.id}
                      onClick={() => {/* label toggle handled by taskService */}}
                      className={`px-2 py-0.5 rounded-full text-xs font-medium text-white transition-all ${active ? 'opacity-100' : 'opacity-30 hover:opacity-60'}`}
                      style={{ backgroundColor: label.color }}
                    >
                      {label.name}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* Creator */}
          {task.creator && (
            <div>
              <p className="text-xs font-medium text-gray-400 uppercase mb-1.5">Yaradan</p>
              <div className="flex items-center gap-2">
                <Avatar user={task.creator} size="xs" />
                <span className="text-xs text-gray-600 dark:text-gray-300">{task.creator.full_name}</span>
              </div>
            </div>
          )}

          {/* Created at */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase mb-1">{t('task.activity')}</p>
            <p className="text-xs text-gray-500">{formatDate(task.created_at, 'MMM d, yyyy HH:mm')}</p>
          </div>

          {/* Delete */}
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={handleDelete}
              className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors w-full"
            >
              <Trash2 className="w-4 h-4" />
              {t('task.delete')}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  )
}
