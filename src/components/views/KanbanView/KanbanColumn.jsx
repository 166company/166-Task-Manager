import { useState } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus, ChevronDown, ChevronRight } from 'lucide-react'
import { useUIStore } from '../../../store/uiStore'
import TaskCard from './TaskCard'

export default function KanbanColumn({ status, tasks }) {
  const { openCreateTaskModal } = useUIStore()
  const [collapsed, setCollapsed] = useState(false)
  const { setNodeRef, isOver } = useDroppable({ id: status.value })

  return (
    <div className="flex flex-col w-72 shrink-0">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <button
          onClick={() => setCollapsed(v => !v)}
          className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:text-gray-900 dark:hover:text-white"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          <span
            className="w-2 h-2 rounded-full"
            style={{ backgroundColor: status.color }}
          />
          {status.label}
          <span className="ml-1 text-xs font-normal text-gray-400 bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </button>
        <button
          onClick={() => openCreateTaskModal(status.value)}
          className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          title="Yeni tapşırıq"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {!collapsed && (
        <div
          ref={setNodeRef}
          className={`flex flex-col gap-2 min-h-[100px] p-1 rounded-xl transition-colors ${isOver ? 'bg-primary-50 dark:bg-primary-900/10' : ''}`}
        >
          <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
            {tasks.map(task => <TaskCard key={task.id} task={task} />)}
          </SortableContext>

          <button
            onClick={() => openCreateTaskModal(status.value)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors mt-1"
          >
            <Plus className="w-4 h-4" />
            Tapşırıq əlavə et
          </button>
        </div>
      )}
    </div>
  )
}
