import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  LayoutDashboard, ChevronDown, ChevronRight, Plus, Settings,
  User, LogOut, FolderOpen, LayoutGrid, Calendar, Users,
  CheckSquare, Clock, AlertCircle, CheckCircle2, ChevronLeft,
} from 'lucide-react'
import { useAuthStore } from '../../store/authStore'
import { useProjectStore } from '../../store/projectStore'
import { useUIStore } from '../../store/uiStore'
import Avatar from '../ui/Avatar'
import CreateWorkspaceModal from '../workspace/CreateWorkspaceModal'
import CreateProjectModal from '../workspace/CreateProjectModal'

export default function Sidebar() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const { user, profile, signOut } = useAuthStore()
  const { workspaces, currentWorkspace, projects, setCurrentWorkspace, setCurrentProject, currentProject } = useProjectStore()
  const { sidebarCollapsed, toggleSidebar } = useUIStore()
  const [wsOpen, setWsOpen] = useState(true)
  const [showCreateWs, setShowCreateWs] = useState(false)
  const [showCreateProject, setShowCreateProject] = useState(false)

  const smartLists = [
    { key: 'myTasks', icon: CheckSquare, label: t('nav.myTasks') },
    { key: 'today', icon: Clock, label: t('nav.today') },
    { key: 'overdue', icon: AlertCircle, label: t('nav.overdue'), danger: true },
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
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
            <span className="text-white font-bold text-sm">166</span>
          </div>
          <span className="font-semibold text-gray-900 dark:text-white text-sm">Task Manager</span>
        </div>
        <button onClick={toggleSidebar} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-700">
          <ChevronLeft className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-thin py-2">
        {/* Dashboard */}
        <div className="px-2 mb-2">
          <button
            onClick={() => navigate('/dashboard')}
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
            <button key={item.key} className={`sidebar-item w-full ${item.danger ? 'hover:text-red-500' : ''}`}>
              <item.icon className="w-4 h-4" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Workspace & Projects */}
        <div className="px-2">
          <div className="flex items-center justify-between px-3 mb-1">
            <button
              onClick={() => setWsOpen(v => !v)}
              className="flex items-center gap-1 text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-600 dark:hover:text-gray-200"
            >
              {wsOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              {currentWorkspace?.name || 'Workspace'}
            </button>
            <button
              onClick={() => setShowCreateProject(true)}
              className="p-0.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400"
              title="Yeni layihə"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {wsOpen && projects.map(project => (
            <button
              key={project.id}
              onClick={() => { setCurrentProject(project); navigate(`/project/${project.id}`) }}
              className={`sidebar-item w-full ${currentProject?.id === project.id ? 'active' : ''}`}
            >
              <span className="text-base">{project.icon}</span>
              <span className="truncate">{project.name}</span>
              <span
                className="ml-auto w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: project.color }}
              />
            </button>
          ))}

          {workspaces.length > 0 && (
            <button
              onClick={() => setShowCreateWs(true)}
              className="sidebar-item w-full text-gray-400 mt-1"
            >
              <Plus className="w-4 h-4" />
              Workspace yarat
            </button>
          )}
        </div>
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
      {showCreateProject && <CreateProjectModal onClose={() => setShowCreateProject(false)} />}
    </div>
  )
}
