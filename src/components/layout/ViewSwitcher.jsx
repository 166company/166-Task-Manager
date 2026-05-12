import { useTranslation } from 'react-i18next'
import { LayoutGrid, List, Table2, CalendarDays, GanttChart, Network } from 'lucide-react'
import { useUIStore } from '../../store/uiStore'

const VIEWS = [
  { value: 'kanban', icon: LayoutGrid, labelKey: 'views.kanban' },
  { value: 'list', icon: List, labelKey: 'views.list' },
  { value: 'table', icon: Table2, labelKey: 'views.table' },
  { value: 'calendar', icon: CalendarDays, labelKey: 'views.calendar' },
  { value: 'gantt', icon: GanttChart, labelKey: 'views.gantt' },
  { value: 'mindmap', icon: Network, labelKey: 'views.mindmap' },
]

export default function ViewSwitcher() {
  const { t } = useTranslation()
  const { activeView, setActiveView } = useUIStore()

  return (
    <div className="flex items-center gap-1 px-4 py-2 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 overflow-x-auto scrollbar-thin shrink-0">
      {VIEWS.map(view => (
        <button
          key={view.value}
          onClick={() => setActiveView(view.value)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors
            ${activeView === view.value
              ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400'
              : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700'
            }`}
        >
          <view.icon className="w-4 h-4" />
          {t(view.labelKey)}
        </button>
      ))}
    </div>
  )
}
