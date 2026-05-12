import { useState } from 'react'
import { ChevronRight, ChevronDown, Calendar, Circle } from 'lucide-react'
import { useUIStore } from '../../../store/uiStore'
import { useTaskStore } from '../../../store/taskStore'
import Avatar from '../../ui/Avatar'
import { StatusBadge, PriorityBadge } from '../../ui/Badge'
import { formatDate, dueDateColor } from '../../../utils/dateUtils'
import { STATUSES } from '../../../utils/constants'

export default function ListItem({ task, depth = 0 }) {
  const { openTaskModal } = useUIStore()
  const { updateTask } = useTaskStore()
  const [expanded, setExpanded] = useState(false)
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(task.title)

  const handleTitleBlur = async () => {
    setEditing(false)
    if (title.trim() && title !== task.title) {
      await updateTask(task.id, { title: title.trim() })
    }
  }

  const handleStatusChange = async (e) => {
    e.stopPropagation()
    const statuses = STATUSES.map(s => s.value)
    const next = statuses[(statuses.indexOf(task.status) + 1) % statuses.length]
    await updateTask(task.id, { status: next })
  }

  return (
    <div className={`${depth > 0 ? 'ml-6 border-l border-gray-200 dark:border-gray-700 pl-4' : ''}`}>
      <div
        className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg group cursor-pointer transition-colors"
        onClick={() => openTaskModal(task.id)}
      >
        {/* Expand/collapse subtasks */}
        <button
          className="w-5 h-5 flex items-center justify-center text-gray-400 shrink-0"
          onClick={e => { e.stopPropagation(); setExpanded(v => !v) }}
        >
          {task.subtask_count > 0
            ? expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
            : <Circle className="w-3 h-3" />
          }
        </button>

        {/* Status dot */}
        <button
          onClick={handleStatusChange}
          className="w-4 h-4 rounded-full border-2 shrink-0 transition-colors"
          style={{
            borderColor: STATUSES.find(s => s.value === task.status)?.color,
            backgroundColor: task.status === 'done' ? STATUSES.find(s => s.value === 'done')?.color : 'transparent',
          }}
          title="Status dəyiş"
        />

        {/* Title */}
        {editing ? (
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onBlur={handleTitleBlur}
            onKeyDown={e => { if (e.key === 'Enter') handleTitleBlur(); if (e.key === 'Escape') { setEditing(false); setTitle(task.title) } }}
            onClick={e => e.stopPropagation()}
            className="flex-1 text-sm bg-transparent border-b border-primary-500 outline-none"
          />
        ) : (
          <span
            className={`flex-1 text-sm ${task.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-gray-100'}`}
            onDoubleClick={e => { e.stopPropagation(); setEditing(true) }}
          >
            {task.title}
          </span>
        )}

        {/* Meta */}
        <div className="flex items-center gap-3 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <PriorityBadge priority={task.priority} />
          {task.due_date && (
            <span className={`flex items-center gap-1 text-xs ${dueDateColor(task.due_date, task.status === 'done')}`}>
              <Calendar className="w-3 h-3" />
              {formatDate(task.due_date, 'MMM d')}
            </span>
          )}
          {task.assignee && <Avatar user={task.assignee} size="xs" />}
        </div>

        <StatusBadge status={task.status} />
      </div>

      {expanded && task.subtasks?.map(sub => (
        <ListItem key={sub.id} task={sub} depth={depth + 1} />
      ))}
    </div>
  )
}
