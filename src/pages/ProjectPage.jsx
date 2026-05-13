import { useEffect } from 'react'
import { useParams } from 'react-router-dom'
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
import FilterBar from '../components/layout/FilterBar'

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
  const { projects, setCurrentProject, fetchMembers, currentWorkspace } = useProjectStore()
  const { fetchTasks } = useTaskStore()
  const { activeView, taskModalOpen, createTaskModal, createTaskStatus, closeCreateTaskModal } = useUIStore()

  useRealtime(projectId)

  useEffect(() => {
    const project = projects.find(p => p.id === projectId)
    if (project) setCurrentProject(project)
  }, [projectId, projects])

  useEffect(() => {
    if (projectId) {
      useTaskStore.getState().clearTasks()
      fetchTasks(projectId)
    }
    if (currentWorkspace) {
      fetchMembers(currentWorkspace.id)
    }
  }, [projectId, currentWorkspace])

  const ActiveView = VIEW_COMPONENTS[activeView] || KanbanBoard

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <ViewSwitcher />
        <div className="flex-1 overflow-hidden bg-gray-50 dark:bg-gray-900">
          <ActiveView />
        </div>
      </div>

      {taskModalOpen && <TaskModal />}

      <Modal
        open={createTaskModal}
        onClose={closeCreateTaskModal}
        title="Yeni tapşırıq"
        size="md"
      >
        <TaskForm initialStatus={createTaskStatus} onClose={closeCreateTaskModal} />
      </Modal>
    </div>
  )
}
