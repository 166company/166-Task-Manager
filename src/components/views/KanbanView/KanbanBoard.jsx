import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { useTaskStore } from '../../../store/taskStore'
import { STATUSES } from '../../../utils/constants'
import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'

export default function KanbanBoard() {
  const { getFilteredTasks, reorderTasks } = useTaskStore()
  const [activeTask, setActiveTask] = useState(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const tasks = getFilteredTasks()

  const getColumnTasks = (statusValue) =>
    tasks
      .filter(t => t.status === statusValue)
      .sort((a, b) => a.order_index - b.order_index)

  const handleDragStart = ({ active }) => {
    setActiveTask(tasks.find(t => t.id === active.id))
  }

  const handleDragEnd = async ({ active, over }) => {
    setActiveTask(null)
    if (!over) return

    const activeTask = tasks.find(t => t.id === active.id)
    if (!activeTask) return

    const newStatus = STATUSES.find(s => s.value === over.id)?.value || activeTask.status
    const targetTask = tasks.find(t => t.id === over.id)
    const targetStatus = targetTask?.status || newStatus

    const columnTasks = getColumnTasks(targetStatus)
    let newIndex = columnTasks.length

    if (targetTask && targetTask.id !== active.id) {
      newIndex = columnTasks.findIndex(t => t.id === over.id)
    }

    const updates = columnTasks
      .filter(t => t.id !== active.id)
      .toSpliced(newIndex, 0, activeTask)
      .map((t, i) => ({ id: t.id, order_index: i, status: targetStatus }))

    if (activeTask.status !== targetStatus) {
      updates.push({ id: activeTask.id, order_index: newIndex, status: targetStatus })
    }

    await reorderTasks(updates)
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5 p-6 overflow-x-auto h-full scrollbar-thin">
        {STATUSES.map(status => (
          <KanbanColumn
            key={status.value}
            status={status}
            tasks={getColumnTasks(status.value)}
          />
        ))}
      </div>

      <DragOverlay>
        {activeTask && (
          <div className="rotate-2 shadow-2xl">
            <TaskCard task={activeTask} />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  )
}
