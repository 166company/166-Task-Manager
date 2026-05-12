import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import { useTaskStore } from '../store/taskStore'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import { STATUSES } from '../utils/constants'

function StatCard({ icon: Icon, label, value, color }) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { workspaces, fetchWorkspaces, projects, currentWorkspace } = useProjectStore()
  const { tasks } = useTaskStore()

  useEffect(() => {
    if (user) fetchWorkspaces(user.id)
  }, [user])

  const myTasks = tasks.filter(t => t.assignee_id === user?.id)
  const overdueTasks = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done')
  const doneTasks = tasks.filter(t => t.status === 'done')
  const inProgress = tasks.filter(t => t.status === 'in_progress')

  if (workspaces.length === 0) {
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Header />
          <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="text-center max-w-sm">
              <div className="text-6xl mb-4">🚀</div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Xoş gəlmisiniz!</h2>
              <p className="text-gray-500 mb-6">İşə başlamaq üçün bir workspace yaradın.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-gray-50 dark:bg-gray-900">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-6">{t('nav.dashboard')}</h2>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={LayoutGrid} label="Ümumi tapşırıq" value={tasks.length} color="bg-primary-600" />
            <StatCard icon={Clock} label="İcra edilir" value={inProgress.length} color="bg-blue-500" />
            <StatCard icon={AlertCircle} label="Gecikmiş" value={overdueTasks.length} color="bg-red-500" />
            <StatCard icon={CheckCircle2} label="Tamamlandı" value={doneTasks.length} color="bg-green-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projects */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Layihələr</h3>
              <div className="space-y-3">
                {projects.map(p => {
                  const projectTasks = tasks.filter(t => t.project_id === p.id)
                  const done = projectTasks.filter(t => t.status === 'done').length
                  const pct = projectTasks.length > 0 ? Math.round((done / projectTasks.length) * 100) : 0
                  return (
                    <div
                      key={p.id}
                      onClick={() => navigate(`/project/${p.id}`)}
                      className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                    >
                      <span className="text-xl">{p.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">{p.name}</span>
                          <span className="text-xs text-gray-400 ml-2">{pct}%</span>
                        </div>
                        <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                          <div
                            className="h-full rounded-full transition-all"
                            style={{ width: `${pct}%`, backgroundColor: p.color }}
                          />
                        </div>
                      </div>
                    </div>
                  )
                })}
                {projects.length === 0 && (
                  <p className="text-sm text-gray-400 text-center py-6">Layihə yoxdur</p>
                )}
              </div>
            </div>

            {/* Status breakdown */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status üzrə</h3>
              <div className="space-y-3">
                {STATUSES.map(s => {
                  const count = tasks.filter(t => t.status === s.value).length
                  const pct = tasks.length > 0 ? (count / tasks.length) * 100 : 0
                  return (
                    <div key={s.value}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                          {s.label}
                        </span>
                        <span className="text-sm text-gray-500">{count}</span>
                      </div>
                      <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-600 rounded-full">
                        <div
                          className="h-full rounded-full transition-all"
                          style={{ width: `${pct}%`, backgroundColor: s.color }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
