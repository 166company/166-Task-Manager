import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useProjectStore } from '../store/projectStore'
import { useTaskStore } from '../store/taskStore'
import { useUIStore } from '../store/uiStore'
import { useRealtime } from '../hooks/useRealtime'
import Sidebar from '../components/layout/Sidebar'
import Header from '../components/layout/Header'
import ViewSwitcher from '../components/layout/ViewSwitcher'
import KanbanBoard from '../components/views/KanbanView/KanbanBoard'
import ListView from '../components/views/ListView/ListView'
import TableView from '../components/views/TableView/TableView'
import CalendarView from '../components/views/CalendarView/CalendarView'
import GanttChart from '../components/views/GanttView/GanttChart'
import MindMap from '../components/views/MindMapView/MindMap'
import TaskModal from '../components/task/TaskModal'
import Modal from '../components/ui/Modal'
import TaskForm from '../components/task/TaskForm'

const VIEW_COMPONENTS = {
  kanban: KanbanBoard,
  list: ListView,
  table: TableView,
  calendar: CalendarView,
  gantt: GanttChart,
  mindmap: MindMap,
}

export default function ProjectPage() {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const { projects, setCurrentProject, fetchMembers, currentWorkspace } = useProjectStore()
  const { fetchTasks, clearTasks } = useTaskStore()
  const { activeView, taskModalOpen, createTaskModal, createTaskStatus, closeCreateTaskModal } = useUIStore()

  useRealtime(projectId)

  // Validate project belongs to current workspace
  useEffect(() => {
    if (!projects.length) return
    const project = projects.find(p => p.id === projectId)
    if (project) {
      setCurrentProject(project)
    } else {
      clearTasks()
      navigate('/dashboard', { replace: true })
    }
  }, [projectId, projects])

  // Fetch tasks only when projectId changes (not workspace)
  useEffect(() => {
    if (!projectId) return
    clearTasks()
    fetchTasks(projectId)
  }, [projectId])

  // Fetch members when workspace changes
  useEffect(() => {
    if (currentWorkspace) fetchMembers(currentWorkspace.id)
  }, [currentWorkspace])

  const ActiveView = VIEW_COMPONENTS[activeView] || KanbanBoard

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <ViewSwitcher />
        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
          {/* key={projectId} forces full remount on project change */}
          <ActiveView key={projectId} />
        </div>
      </div>

      {taskModalOpen && <TaskModal />}

      <Modal open={createTaskModal} onClose={closeCreateTaskModal} title="Yeni tapşırıq" size="md">
        <TaskForm initialStatus={createTaskStatus} onClose={closeCreateTaskModal} />
      </Modal>
    </div>
  )
}
