import { useCallback, useMemo } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  addEdge,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useTaskStore } from '../../../store/taskStore'
import { useProjectStore } from '../../../store/projectStore'
import { useUIStore } from '../../../store/uiStore'
import { STATUSES } from '../../../utils/constants'

const statusColors = Object.fromEntries(STATUSES.map(s => [s.value, s.color]))

function buildMindMapLayout(project, tasks) {
  const nodes = []
  const edges = []

  if (!project) return { nodes, edges }

  // Root node
  nodes.push({
    id: 'root',
    data: { label: project.icon + ' ' + project.name },
    position: { x: 400, y: 300 },
    style: {
      background: '#4F46E5',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      padding: '12px 20px',
      fontWeight: 700,
      fontSize: 16,
    },
  })

  const rootTasks = tasks.filter(t => !t.parent_task_id)
  const angleStep = (2 * Math.PI) / Math.max(rootTasks.length, 1)
  const radius = 220

  rootTasks.forEach((task, i) => {
    const angle = i * angleStep - Math.PI / 2
    const x = 400 + radius * Math.cos(angle)
    const y = 300 + radius * Math.sin(angle)

    nodes.push({
      id: task.id,
      data: { label: task.title },
      position: { x, y },
      style: {
        background: statusColors[task.status] || '#9CA3AF',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 14px',
        fontSize: 13,
        maxWidth: 160,
        cursor: 'pointer',
      },
    })

    edges.push({
      id: `root-${task.id}`,
      source: 'root',
      target: task.id,
      style: { stroke: '#E5E7EB', strokeWidth: 2 },
    })

    // Subtasks
    const subs = tasks.filter(t => t.parent_task_id === task.id)
    subs.forEach((sub, j) => {
      const subAngle = angle + (j - (subs.length - 1) / 2) * 0.4
      const subRadius = 140
      const sx = x + subRadius * Math.cos(subAngle)
      const sy = y + subRadius * Math.sin(subAngle)

      nodes.push({
        id: sub.id,
        data: { label: sub.title },
        position: { x: sx, y: sy },
        style: {
          background: 'white',
          color: '#374151',
          border: `2px solid ${statusColors[sub.status] || '#9CA3AF'}`,
          borderRadius: '6px',
          padding: '5px 10px',
          fontSize: 11,
          maxWidth: 130,
        },
      })

      edges.push({
        id: `${task.id}-${sub.id}`,
        source: task.id,
        target: sub.id,
        style: { stroke: '#E5E7EB', strokeWidth: 1.5 },
      })
    })
  })

  return { nodes, edges }
}

export default function MindMap() {
  const tasks = useTaskStore(s => s.tasks)
  const { currentProject } = useProjectStore()
  const { openTaskModal } = useUIStore()

  const { nodes: initialNodes, edges: initialEdges } = useMemo(
    () => buildMindMapLayout(currentProject, tasks),
    [currentProject, tasks]
  )

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  const onNodeDoubleClick = useCallback((_, node) => {
    if (node.id !== 'root') openTaskModal(node.id)
  }, [openTaskModal])

  return (
    <div className="h-full" style={{ minHeight: 500 }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDoubleClick={onNodeDoubleClick}
        fitView
        attributionPosition="bottom-right"
      >
        <Background color="#E5E7EB" gap={24} />
        <Controls />
        <MiniMap />
      </ReactFlow>
    </div>
  )
}
