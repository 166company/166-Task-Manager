import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import toast from 'react-hot-toast'
import { Trash2, Calendar, User, Flag, MessageSquare, Paperclip, CheckSquare, Loader2, X, FolderOpen, Building2 } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'
import { useTaskStore } from '../../store/taskStore'
import { useProjectStore } from '../../store/projectStore'
import { useAuthStore } from '../../store/authStore'
import { projectService } from '../../services/projectService'
import Modal from '../ui/Modal'
import { StatusBadge, PriorityBadge } from '../ui/Badge'
import Avatar from '../ui/Avatar'
import Comments from './Comments'
import Subtasks from './Subtasks'
import Attachments from './Attachments'
import { STATUSES, PRIORITIES } from '../../utils/constants'
import { formatDate } from '../../utils/dateUtils'

function DateInput({ label, value, onChange, icon: Icon }) {
  return (
    <div>
      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{label}</p>
      <label className="group relative flex items-center gap-2 px-3 py-2.5 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-gray-800 cursor-pointer transition-all focus-within:border-indigo-500 focus-within:ring-2 focus-within:ring-indigo-200 dark:focus-within:ring-indigo-800">
        <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
        <span className="flex-1 text-sm text-gray-700 dark:text-gray-200">
          {value ? formatDate(value) : <span className="text-gray-400">Tarix seçin</span>}
        </span>
        {value && (
          <button
            type="button"
            onClick={e => { e.preventDefault(); onChange(null) }}
            className="text-gray-300 hover:text-red-400 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
        <input
          type="date"
          value={value ? value.slice(0, 10) : ''}
          onChange={e => onChange(e.target.value || null)}
          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
        />
      </label>
    </div>
  )
}

const TABS = [
  { key: 'description', label: 'Təsvir', icon: Flag },
  { key: 'subtasks', label: 'Alt-tapşırıqlar', icon: CheckSquare },
  { key: 'comments', label: 'Şərhlər', icon: MessageSquare },
  { key: 'attachments', label: 'Fayllar', icon: Paperclip },
]

export default function TaskModal() {
  const { t } = useTranslation()
  const { taskModalOpen, taskModalId, closeTaskModal } = useUIStore()
  const { fetchTask, updateTask, deleteTask } = useTaskStore()
  const { members, labels, workspaces, projects: currentProjects } = useProjectStore()
  const { user } = useAuthStore()
  const [tab, setTab] = useState('description')
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [allProjects, setAllProjects] = useState([])
  const [editingProject, setEditingProject] = useState(false)
  const [newProjectId, setNewProjectId] = useState('')

  useEffect(() => {
    if (taskModalOpen && taskModalId) {
      setLoading(true)
      setError(null)
      setTask(null)
      setEditingProject(false)
      fetchTask(taskModalId)
        .then(t => { setTask(t); setNewProjectId(t.project_id) })
        .catch(err => setError(err.message || 'Tapşırıq yüklənmədi'))
        .finally(() => setLoading(false))
      // Load all projects for editing
      Promise.all(workspaces.map(w => projectService.getProjects(w.id)))
        .then(results => setAllProjects(results.flat()))
        .catch(() => {})
    } else {
      setTask(null)
      setError(null)
    }
  }, [taskModalOpen, taskModalId])

  if (!taskModalOpen) return null

  const update = async (field, value) => {
    if (!task) return
    try {
      const updated = await updateTask(task.id, { [field]: value })
      setTask(t => ({ ...t, ...updated }))
    } catch {
      toast.error(t('errors.generic'))
    }
  }

  const handleDelete = async () => {
    if (!task || !confirm('Bu tapşırığı silmək istədiyinizə əminsiniz?')) return
    await deleteTask(task.id)
    closeTaskModal()
    toast.success(t('success.deleted'))
  }

  return (
    <Modal open onClose={closeTaskModal} size="full">
      {loading ? (
        <div className="flex items-center justify-center h-64 gap-3 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin text-indigo-500" />
          <span>Yüklənir...</span>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center h-64 gap-3 text-gray-400">
          <p className="text-red-500">{error}</p>
          <button onClick={closeTaskModal} className="text-sm underline">Bağla</button>
        </div>
      ) : task ? (
        <div className="flex h-full min-h-[70vh]">
          {/* Main */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Title */}
            <div className="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-start gap-3 mb-3">
                <StatusBadge status={task.status} />
                <PriorityBadge priority={task.priority} />
              </div>
              <textarea
                defaultValue={task.title}
                onBlur={e => { if (e.target.value !== task.title) update('title', e.target.value) }}
                className="w-full text-xl font-bold text-gray-900 dark:text-white bg-transparent resize-none outline-none focus:bg-gray-50 dark:focus:bg-gray-700/50 rounded-xl px-3 py-2 -ml-3 transition-colors"
                rows={2}
              />
            </div>

            {/* Tabs */}
            <div className="flex border-b border-gray-100 dark:border-gray-700 px-6 shrink-0">
              {TABS.map(t => (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`flex items-center gap-1.5 px-3 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                    tab === t.key
                      ? 'border-indigo-500 text-indigo-600 dark:text-indigo-400'
                      : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                  }`}
                >
                  <t.icon className="w-3.5 h-3.5" />
                  {t.label}
                  {t.key === 'subtasks' && task.subtasks?.length > 0 && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 rounded-full">{task.subtasks.length}</span>
                  )}
                  {t.key === 'comments' && task.comments?.length > 0 && (
                    <span className="text-xs bg-gray-100 dark:bg-gray-700 px-1.5 rounded-full">{task.comments.length}</span>
                  )}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto scrollbar-thin p-6">
              {tab === 'description' && (
                <textarea
                  defaultValue={task.description || ''}
                  onBlur={e => { if (e.target.value !== (task.description || '')) update('description', e.target.value) }}
                  placeholder="Tapşırıq haqqında ətraflı yazın..."
                  rows={10}
                  className="w-full input resize-none text-sm leading-relaxed"
                />
              )}
              {tab === 'subtasks' && (
                <Subtasks
                  taskId={task.id}
                  subtasks={task.subtasks || []}
                  onSubtaskAdded={sub => setTask(t => ({ ...t, subtasks: [...(t.subtasks || []), sub] }))}
                  onSubtaskUpdated={upd => setTask(t => ({ ...t, subtasks: (t.subtasks || []).map(s => s.id === upd.id ? upd : s) }))}
                  onSubtaskDeleted={id => setTask(t => ({ ...t, subtasks: (t.subtasks || []).filter(s => s.id !== id) }))}
                />
              )}
              {tab === 'comments' && (
                <Comments
                  taskId={task.id}
                  comments={task.comments || []}
                  onCommentAdded={c => setTask(t => ({ ...t, comments: [...(t.comments || []), c] }))}
                  onCommentDeleted={id => setTask(t => ({ ...t, comments: (t.comments || []).filter(c => c.id !== id) }))}
                />
              )}
              {tab === 'attachments' && (
                <Attachments
                  taskId={task.id}
                  attachments={task.attachments || []}
                  onAttachmentAdded={a => setTask(t => ({ ...t, attachments: [...(t.attachments || []), a] }))}
                  onAttachmentDeleted={id => setTask(t => ({ ...t, attachments: (t.attachments || []).filter(a => a.id !== id) }))}
                />
              )}
            </div>
          </div>

          {/* Right Sidebar */}
          <div className="w-72 border-l border-gray-100 dark:border-gray-700 overflow-y-auto scrollbar-thin shrink-0 bg-gray-50/50 dark:bg-gray-800/30">
            <div className="p-4 space-y-5">

              {/* Workspace + Project */}
              <div className="pb-3 border-b border-gray-100 dark:border-gray-700">
                {(() => {
                  const proj = allProjects.find(p => p.id === task.project_id) || currentProjects.find(p => p.id === task.project_id)
                  const ws = workspaces.find(w => w.id === proj?.workspace_id)
                  return (
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Building2 className="w-3.5 h-3.5 shrink-0" />
                        <span className="font-medium">{ws?.name || 'Workspace'}</span>
                      </div>
                      {editingProject ? (
                        <div className="flex gap-1">
                          <select
                            value={newProjectId}
                            onChange={e => setNewProjectId(e.target.value)}
                            className="input text-xs flex-1"
                          >
                            {allProjects.map(p => (
                              <option key={p.id} value={p.id}>{p.icon} {p.name}</option>
                            ))}
                          </select>
                          <button
                            onClick={async () => {
                              await update('project_id', newProjectId)
                              setEditingProject(false)
                            }}
                            className="px-2 py-1 bg-indigo-600 text-white text-xs rounded-lg"
                          >✓</button>
                          <button onClick={() => setEditingProject(false)} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-lg">✕</button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setEditingProject(true)}
                          className="flex items-center gap-2 w-full text-left px-2 py-1.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors group"
                        >
                          <FolderOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-200 flex-1">{proj?.icon} {proj?.name || 'Layihə'}</span>
                          <span className="text-xs text-gray-400 opacity-0 group-hover:opacity-100">dəyiş</span>
                        </button>
                      )}
                    </div>
                  )
                })()}
              </div>

              {/* Status */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('task.status')}</p>
                <div className="grid grid-cols-2 gap-1">
                  {STATUSES.map(s => (
                    <button
                      key={s.value}
                      onClick={() => update('status', s.value)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        task.status === s.value
                          ? 'text-white border-transparent'
                          : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                      style={task.status === s.value ? { backgroundColor: s.color, borderColor: s.color } : {}}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('task.priority')}</p>
                <div className="grid grid-cols-2 gap-1">
                  {PRIORITIES.map(p => (
                    <button
                      key={p.value}
                      onClick={() => update('priority', p.value)}
                      className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                        task.priority === p.value
                          ? 'text-white border-transparent'
                          : 'bg-white dark:bg-gray-800 text-gray-500 border-gray-200 dark:border-gray-600 hover:border-gray-300'
                      }`}
                      style={task.priority === p.value ? { backgroundColor: p.color, borderColor: p.color } : {}}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Assignee */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('task.assignee')}</p>
                <div className="space-y-1">
                  <button
                    onClick={() => update('assignee_id', null)}
                    className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${!task.assignee_id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500'}`}
                  >
                    <User className="w-4 h-4" />
                    <span>Seçilməyib</span>
                  </button>
                  {members.map(m => (
                    <button
                      key={m.user_id}
                      onClick={() => update('assignee_id', m.user_id)}
                      className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm transition-colors ${task.assignee_id === m.user_id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600' : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'}`}
                    >
                      <Avatar user={m.profile} size="xs" />
                      <span className="truncate">{m.profile?.full_name || m.profile?.email}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Dates */}
              <DateInput
                label={t('task.startDate')}
                value={task.start_date}
                onChange={v => update('start_date', v)}
                icon={Calendar}
              />
              <DateInput
                label={t('task.dueDate')}
                value={task.due_date}
                onChange={v => update('due_date', v)}
                icon={Calendar}
              />

              {/* Labels */}
              {labels.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">{t('task.labels')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {labels.map(label => {
                      const active = task.labels?.some(l => l.id === label.id)
                      return (
                        <button
                          key={label.id}
                          className={`px-2.5 py-1 rounded-full text-xs font-medium text-white transition-all ${active ? 'opacity-100 scale-105' : 'opacity-40 hover:opacity-70'}`}
                          style={{ backgroundColor: label.color }}
                        >
                          {label.name}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Meta */}
              {task.creator && (
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Yaradan</p>
                  <div className="flex items-center gap-2">
                    <Avatar user={task.creator} size="xs" />
                    <span className="text-xs text-gray-600 dark:text-gray-300">{task.creator.full_name || task.creator.email}</span>
                  </div>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-1">Yaranma tarixi</p>
                <p className="text-xs text-gray-500">{formatDate(task.created_at, 'MMM d, yyyy HH:mm')}</p>
              </div>

              {/* Delete */}
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors w-full px-3 py-2 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  {t('task.delete')}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </Modal>
  )
}
