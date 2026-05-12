import { format, formatDistanceToNow, isToday, isTomorrow, isPast, isThisWeek } from 'date-fns'
import { az } from 'date-fns/locale'

export const formatDate = (date, fmt = 'MMM d, yyyy') =>
  date ? format(new Date(date), fmt) : ''

export const formatDateTime = (date) =>
  date ? format(new Date(date), 'MMM d, yyyy HH:mm') : ''

export const formatRelative = (date) =>
  date ? formatDistanceToNow(new Date(date), { addSuffix: true }) : ''

export const isOverdue = (dueDate) =>
  dueDate && isPast(new Date(dueDate)) && !isToday(new Date(dueDate))

export const isDueToday = (dueDate) =>
  dueDate && isToday(new Date(dueDate))

export const isDueSoon = (dueDate) =>
  dueDate && (isToday(new Date(dueDate)) || isTomorrow(new Date(dueDate)))

export const isThisWeekDate = (date) =>
  date && isThisWeek(new Date(date))

export const dueDateColor = (dueDate, completed) => {
  if (completed) return 'text-gray-400'
  if (!dueDate) return 'text-gray-500'
  if (isOverdue(dueDate)) return 'text-red-500'
  if (isDueSoon(dueDate)) return 'text-amber-500'
  return 'text-gray-500'
}
