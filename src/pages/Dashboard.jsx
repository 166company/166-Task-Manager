import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { LayoutGrid, CheckCircle2, Clock, AlertCircle, Plus } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { useProjectStore } from '../store/projectStore'
import { supabase } from '../services/supabase'
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
  const [allTasks, setAllTasks] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (user) fetchWorkspaces(user.id)
  }, [user])

  // Fetch all tasks for current workspace's projects
  useEffect(() => {
    if (!projects.length) return
    setLoading(true)
    const projectIds = projects.map(p => p.id)
    supabase
      .from('tasks')
      .select('id, status, due_date, project_id, assignee_id, title')
      .in('project_id', projectIds)
      .is('parent_task_id', null)
      .then(({ data, error }) => {
        if (!error && data) setAllTasks(data)
        setLoading(false)
      })
  }, [projects])

  const myTasks = allTasks.filter(t => t.assignee_id === user?.id)
  const overdueTasks = allTasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done')
  const doneTasks = allTasks.filter(t => t.status === 'done')
  const inProgress = allTasks.filter(t => t.status === 'in_progress')

  if (!loading && workspaces.length === 0) {
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
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{t('nav.dashboard')}</h2>
            {currentWorkspace && (
              <p className="text-sm text-gray-400">{currentWorkspace.name}</p>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={LayoutGrid} label="Ümumi tapşırıq" value={allTasks.length} color="bg-primary-600" />
            <StatCard icon={Clock} label="İcra edilir" value={inProgress.length} color="bg-blue-500" />
            <StatCard icon={AlertCircle} label="Gecikmiş" value={overdueTasks.length} color="bg-red-500" />
            <StatCard icon={CheckCircle2} label="Tamamlandı" value={doneTasks.length} color="bg-green-500" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Projects */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Layihələr</h3>
              {loading ? (
                <div className="flex items-center justify-center h-20 text-gray-400 text-sm">Yüklənir...</div>
              ) : (
                <div className="space-y-3">
                  {projects.map(p => {
                    const projectTasks = allTasks.filter(t => t.project_id === p.id)
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
                            <span className="text-xs text-gray-400 ml-2 shrink-0">{done}/{projectTasks.length} · {pct}%</span>
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
              )}
            </div>

            {/* Status breakdown */}
            <div className="card p-5">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Status üzrə</h3>
              <div className="space-y-3">
                {STATUSES.map(s => {
                  const count = allTasks.filter(t => t.status === s.value).length
                  const pct = allTasks.length > 0 ? (count / allTasks.length) * 100 : 0
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

            {/* My Tasks */}
            {myTasks.length > 0 && (
              <div className="card p-5 lg:col-span-2">
                <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Mənim tapşırıqlarım ({myTasks.length})</h3>
                <div className="space-y-2">
                  {myTasks.slice(0, 8).map(t => {
                    const proj = projects.find(p => p.id === t.project_id)
                    const status = STATUSES.find(s => s.value === t.status)
                    return (
                      <div
                        key={t.id}
                        onClick={() => navigate(`/project/${t.project_id}`)}
                        className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors"
                      >
                        <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: status?.color }} />
                        <span className="flex-1 text-sm text-gray-800 dark:text-gray-200 truncate">{t.title}</span>
                        <span className="text-xs text-gray-400 shrink-0">{proj?.icon} {proj?.name}</span>
                        {t.due_date && (
                          <span className={`text-xs shrink-0 ${new Date(t.due_date) < new Date() ? 'text-red-500' : 'text-gray-400'}`}>
                            {new Date(t.due_date).toLocaleDateString('az')}
                          </span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
