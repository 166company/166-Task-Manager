import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, ChevronDown, ChevronRight, Plus, Settings,
  LogOut, CheckSquare, Clock, AlertCircle, CheckCircle2,
  ChevronLeft, ChevronsUpDown, Building2, Pencil,
} from 'lucide-react'
import { useTaskStore } from '../../store/taskStore'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { ICONS } from '../ui/IconPicker'
import { useAuthStore } from '../../store/authStore'
import { useProjectStore } from '../../store/projectStore'
import { useUIStore } from '../../store/uiStore'
import Avatar from '../ui/Avatar'
import CreateWorkspaceModal from '../workspace/CreateWorkspaceModal'
import EditWorkspaceModal from '../workspace/EditWorkspaceModal'
import CreateProjectModal from '../workspace/CreateProjectModal'

export default function Sidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, signOut } = useAuthStore()
  const {
    workspaces, currentWorkspace, projects,
    setCurrentWorkspace, setCurrentProject, currentProject,
    fetchWorkspaces,
  } = useProjectStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const [projectsOpen, setProjectsOpen] = useState(true)
  const [wsMenuOpen, setWsMenuOpen] = useState(false)
  const [showCreateWs, setShowCreateWs] = useState(false)
  const [showEditWs, setShowEditWs] = useState(false)
  const [showCreateProject, setShowCreateProject] = useState(false)

  useEffect(() => {
    if (user && workspaces.length === 0) fetchWorkspaces(user.id)
  }, [user])

  const { tasks, setFilters, clearFilters } = useTaskStore()
  const myTaskCount = tasks.filter(t => t.assignee_id === user?.id && t.status !== 'done').length
  const overdueCount = tasks.filter(t => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length

  const handleSmartList = (key) => {
    if (!currentProject) return
    clearFilters()
    if (key === 'myTasks') setFilters({ assignee: [user?.id] })
    else if (key === 'today') setFilters({ dateRange: 'today' })
    else if (key === 'overdue') setFilters({ dateRange: 'overdue' })
    else if (key === 'completed') setFilters({ status: ['done'] })
  }

  const smartLists = [
    { key: 'myTasks', icon: CheckSquare, label: t('nav.myTasks'), count: myTaskCount },
    { key: 'today', icon: Clock, label: t('nav.today') },
    { key: 'overdue', icon: AlertCircle, label: t('nav.overdue'), danger: true, count: overdueCount },
    { key: 'completed', icon: CheckCircle2, label: t('nav.completed') },
  ]

  if (sidebarCollapsed) {
    return (
      <div className="w-14 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
        <div className="p-2 border-b border-gray-200 dark:border-gray-700">
          <button onClick={toggleSidebar} className="w-10 h-10 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700">
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-64 flex flex-col border-r border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 shrink-0">
      {/* Workspace Switcher */}
      <div className="relative border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => setWsMenuOpen(v => !v)}
          className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
        >
          {currentWorkspace ? (
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: currentWorkspace.color || '#4F46E5' }}
            >
              {(() => { const ic = ICONS.find(i => i.iconName === currentWorkspace.icon); return ic ? <FontAwesomeIcon icon={ic} style={{ color: currentWorkspace.icon_color || '#FFFFFF', fontSize: 14 }} /> : <span className="text-base">{currentWorkspace.icon || '🏢'}</span> })()}
            </div>
          ) : (
            <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center shrink-0">
              <span className="text-white font-bold text-sm">166</span>
            </div>
          )}
          <div className="flex-1 text-left min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
              {currentWorkspace?.name || 'Workspace seç'}
            </p>
            <p className="text-xs text-gray-400">Task Manager</p>
          </div>
          <ChevronsUpDown className="w-4 h-4 text-gray-400 shrink-0" />
        </button>

        {/* Workspace dropdown */}
        {wsMenuOpen && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl rounded-b-xl overflow-hidden">
            {workspaces.map(ws => {
              const wsIcon = ICONS.find(i => i.iconName === ws.icon)
              return (
                <div key={ws.id} className={`flex items-center group ${currentWorkspace?.id === ws.id ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''}`}>
                  <button
                    onClick={() => { setCurrentWorkspace(ws); setWsMenuOpen(false); navigate('/dashboard') }}
                    className="flex-1 flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ backgroundColor: ws.color || '#4F46E5' }}>
                      {wsIcon
                        ? <FontAwesomeIcon icon={wsIcon} style={{ color: ws.icon_color || '#FFFFFF', fontSize: 12 }} />
                        : <span className="text-sm">{ws.icon || '🏢'}</span>
                      }
                    </div>
                    <span className="text-sm font-medium text-gray-900 dark:text-white truncate">{ws.name}</span>
                    {currentWorkspace?.id === ws.id && <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 ml-auto" />}
                  </button>
                  <button
                    onClick={() => { setCurrentWorkspace(ws); setShowEditWs(true); setWsMenuOpen(false) }}
                    className="px-2 py-2.5 opacity-0 group-hover:opacity-100 text-gray-400 hover:text-gray-600 transition-all"
                  >
                    <Pencil className="w-3.5 h-3.5" />
                  </button>
                </div>
              )
            })}
            <div className="border-t border-gray-100 dark:border-gray-700">
              <button
                onClick={() => { setShowCreateWs(true); setWsMenuOpen(false) }}
                className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors font-medium"
              >
                <Plus className="w-4 h-4" />
                Yeni workspace yarat
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {/* Dashboard */}
        <div className="px-2 mb-2">
          <button
            onClick={() => { navigate('/dashboard'); setWsMenuOpen(false) }}
            className={`sidebar-item w-full ${location.pathname === '/dashboard' ? 'active' : ''}`}
          >
            <LayoutDashboard className="w-4 h-4" />
            {t('nav.dashboard')}
          </button>
        </div>

        {/* Smart Lists */}
        <div className="px-2 mb-4">
          <p className="px-3 mb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Smart</p>
          {smartLists.map(item => (
            <button
              key={item.key}
              onClick={() => handleSmartList(item.key)}
              className={`sidebar-item w-full ${item.danger ? 'hover:text-red-500' : ''}`}
            >
              <item.icon className="w-4 h-4" />
              <span className="flex-1 text-left">{item.label}</span>
              {item.count > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${item.danger ? 'bg-red-100 text-red-600' : 'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                  {item.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Projects */}
        {currentWorkspace ? (
          <div className="px-2">
            <div className="flex items-center justify-between px-3 mb-1">
              <button
                onClick={() => setProjectsOpen(v => !v)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-200"
              >
                {projectsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
                Layihələr
              </button>
              <button
                onClick={() => setShowCreateProject(true)}
                className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                title="Yeni layihə"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {projectsOpen && (
              <>
                {projects.map(project => (
                  <button
                    key={project.id}
                    onClick={() => { setCurrentProject(project); navigate(`/project/${project.id}`) }}
                    className={`sidebar-item w-full ${currentProject?.id === project.id ? 'active' : ''}`}
                  >
                    <span className="text-base">{project.icon}</span>
                    <span className="truncate flex-1">{project.name}</span>
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: project.color }} />
                  </button>
                ))}
                {projects.length === 0 && (
                  <button
                    onClick={() => setShowCreateProject(true)}
                    className="sidebar-item w-full text-gray-400 border border-dashed border-gray-200 dark:border-gray-700 mt-1"
                  >
                    <Plus className="w-4 h-4" />
                    İlk layihəni yarat
                  </button>
                )}
              </>
            )}
          </div>
        ) : (
          <div className="px-4 py-3">
            <div className="rounded-xl border border-dashed border-gray-200 dark:border-gray-700 p-4 text-center">
              <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
              <p className="text-xs text-gray-400 mb-3">Workspace yaradın və ya seçin</p>
              <button
                onClick={() => setShowCreateWs(true)}
                className="btn-primary text-xs px-3 py-1.5 w-full justify-center"
              >
                <Plus className="w-3.5 h-3.5" />
                Workspace yarat
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-2 py-2 border-t border-gray-200 dark:border-gray-700">
        <button onClick={() => navigate('/settings')} className="sidebar-item w-full">
          <Settings className="w-4 h-4" />
          {t('nav.settings')}
        </button>
        <button onClick={() => navigate('/profile')} className="sidebar-item w-full">
          <Avatar user={profile || user} size="xs" />
          <span className="truncate">{profile?.full_name || user?.email}</span>
        </button>
        <button onClick={signOut} className="sidebar-item w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20">
          <LogOut className="w-4 h-4" />
          {t('auth.logout')}
        </button>
      </div>

      {showCreateWs && <CreateWorkspaceModal onClose={() => setShowCreateWs(false)} />}
      {showEditWs && currentWorkspace && <EditWorkspaceModal workspace={currentWorkspace} onClose={() => setShowEditWs(false)} />}
      {showCreateProject && currentWorkspace && <CreateProjectModal onClose={() => setShowCreateProject(false)} />}
    </div>
  )
}
