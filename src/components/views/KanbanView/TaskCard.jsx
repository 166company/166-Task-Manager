import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Calendar, MessageSquare, Paperclip, CheckSquare } from 'lucide-react'
import { useUIStore } from '../../../store/uiStore'
import Avatar from '../../ui/Avatar'
import { LabelBadge } from '../../ui/Badge'
import { formatDate, dueDateColor } from '../../../utils/dateUtils'
import { PRIORITIES } from '../../../utils/constants'

export default function TaskCard({ task }) {
  const { openTaskModal } = useUIStore()
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const priority = PRIORITIES.find(p => p.value === task.priority)

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => openTaskModal(task.id)}
      className="card p-3 cursor-pointer hover:shadow-md transition-all group select-none"
    >
      {/* Priority indicator */}
      <div
        className="w-full h-0.5 rounded-full mb-3"
        style={{ backgroundColor: priority?.color || '#9CA3AF' }}
      />

      {/* Labels */}
      {task.labels?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {task.labels.map(label => (
            <LabelBadge key={label.id} label={label} />
          ))}
        </div>
      )}

      {/* Title */}
      <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-3 line-clamp-2">
        {task.title}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-gray-400">
          {task.due_date && (
            <span className={`flex items-center gap-1 text-xs ${dueDateColor(task.due_date, task.status === 'done')}`}>
              <Calendar className="w-3 h-3" />
              {formatDate(task.due_date, 'MMM d')}
            </span>
          )}
          {task.subtask_count > 0 && (
            <span className="flex items-center gap-1 text-xs">
              <CheckSquare className="w-3 h-3" />
              {task.subtask_count}
            </span>
          )}
        </div>
        {task.assignee && <Avatar user={task.assignee} size="xs" />}
      </div>
    </div>
  )
}
