import { useState } from 'react'
import { Gantt, ViewMode } from 'gantt-task-react'
import 'gantt-task-react/dist/index.css'
import { useTaskStore } from '../../../store/taskStore'
import { useUIStore } from '../../../store/uiStore'
import { STATUSES } from '../../../utils/constants'

const statusColors = Object.fromEntries(STATUSES.map(s => [s.value, s.color]))

export default function GanttChart() {
  const tasks = useTaskStore(s => s.tasks)
  const { openTaskModal } = useUIStore()
  const { updateTask } = useTaskStore()
  const [view, setView] = useState(ViewMode.Week)

  const ganttTasks = tasks
    .filter(t => t.start_date && t.due_date)
    .map(t => ({
      id: t.id,
      name: t.title,
      start: new Date(t.start_date),
      end: new Date(t.due_date),
      progress: t.status === 'done' ? 100 : t.status === 'review' ? 75 : t.status === 'in_progress' ? 50 : 0,
      type: 'task',
      styles: {
        progressColor: statusColors[t.status] || '#4F46E5',
        progressSelectedColor: statusColors[t.status] || '#4F46E5',
      },
    }))

  if (ganttTasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-gray-400 p-8">
        <p className="text-4xl mb-3">📈</p>
        <p className="text-sm font-medium">Gantt chartı üçün tapşırıqlara start date və due date təyin edin</p>
      </div>
    )
  }

  return (
    <div className="p-4">
      <div className="flex items-center gap-2 mb-4">
        {[ViewMode.Day, ViewMode.Week, ViewMode.Month].map(v => (
          <button
            key={v}
            onClick={() => setView(v)}
            className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${view === v ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
          >
            {v}
          </button>
        ))}
      </div>

      <div className="card overflow-hidden">
        <Gantt
          tasks={ganttTasks}
          viewMode={view}
          onDoubleClick={task => openTaskModal(task.id)}
          onDateChange={async (task, children) => {
            await updateTask(task.id, {
              start_date: task.start.toISOString(),
              due_date: task.end.toISOString(),
            })
          }}
          listCellWidth="200px"
          ganttHeight={400}
          columnWidth={view === ViewMode.Month ? 150 : view === ViewMode.Week ? 100 : 60}
        />
      </div>
    </div>
  )
}
