import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowUpDown } from 'lucide-react'
import { useTaskStore } from '../../../store/taskStore'
import ListItem from './ListItem'

const SORT_OPTIONS = [
  { value: 'created', label: 'Tarixə görə' },
  { value: 'priority', label: 'Prioritetə görə' },
  { value: 'due', label: 'Son tarixə görə' },
  { value: 'status', label: 'Statusa görə' },
]

const PRIORITY_ORDER = { urgent: 0, high: 1, medium: 2, low: 3 }
const STATUS_ORDER = { todo: 0, in_progress: 1, review: 2, done: 3 }

export default function ListView() {
  const { t } = useTranslation()
  const tasks = useTaskStore(s => s.getFilteredTasks())
  const [sort, setSort] = useState('created')

  const sorted = [...tasks].sort((a, b) => {
    if (sort === 'priority') return (PRIORITY_ORDER[a.priority] || 2) - (PRIORITY_ORDER[b.priority] || 2)
    if (sort === 'due') return (a.due_date || 'z') < (b.due_date || 'z') ? -1 : 1
    if (sort === 'status') return (STATUS_ORDER[a.status] || 0) - (STATUS_ORDER[b.status] || 0)
    return new Date(b.created_at) - new Date(a.created_at)
  })

  return (
    <div className="p-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">{tasks.length} tapşırıq</p>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-gray-400" />
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="text-sm border-none bg-transparent text-gray-600 dark:text-gray-300 outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      {/* List */}
      <div className="space-y-0.5">
        {sorted.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-lg mb-1">📋</p>
            <p className="text-sm">{t('task.noTasks')}</p>
          </div>
        ) : (
          sorted.map(task => <ListItem key={task.id} task={task} />)
        )}
      </div>
    </div>
  )
}
