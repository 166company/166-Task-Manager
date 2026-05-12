import { STATUSES, PRIORITIES } from '../../utils/constants'

export function StatusBadge({ status }) {
  const s = STATUSES.find(s => s.value === status)
  return (
    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700">
      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: s?.color }} />
      {s?.label || status}
    </span>
  )
}

export function PriorityBadge({ priority }) {
  const p = PRIORITIES.find(p => p.value === priority)
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: p?.color }}
    >
      {p?.label || priority}
    </span>
  )
}

export function LabelBadge({ label }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white"
      style={{ backgroundColor: label.color }}
    >
      {label.name}
    </span>
  )
}
