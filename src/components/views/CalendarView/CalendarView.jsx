import { useState, useCallback } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { az } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useTaskStore } from '../../../store/taskStore'
import { useUIStore } from '../../../store/uiStore'
import { STATUSES } from '../../../utils/constants'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales: { az },
})

const statusColors = Object.fromEntries(STATUSES.map(s => [s.value, s.color]))

export default function CalendarView() {
  const tasks = useTaskStore(s => s.getFilteredTasks())
  const { openTaskModal } = useUIStore()
  const { updateTask } = useTaskStore()
  const [date, setDate] = useState(new Date())
  const [view, setView] = useState('month')

  const events = tasks
    .filter(t => t.due_date || t.start_date)
    .map(t => ({
      id: t.id,
      title: t.title,
      start: new Date(t.start_date || t.due_date),
      end: new Date(t.due_date || t.start_date),
      resource: t,
    }))

  const handleSelectEvent = useCallback(event => {
    openTaskModal(event.id)
  }, [openTaskModal])

  const handleEventDrop = useCallback(async ({ event, start, end }) => {
    await updateTask(event.id, {
      due_date: end.toISOString(),
      start_date: start.toISOString(),
    })
  }, [updateTask])

  const eventStyleGetter = useCallback(event => ({
    style: {
      backgroundColor: statusColors[event.resource.status] || '#4F46E5',
      border: 'none',
      borderRadius: '4px',
      fontSize: '12px',
      padding: '2px 6px',
    }
  }), [])

  return (
    <div className="p-4 h-full">
      <div className="card p-4 h-full" style={{ minHeight: '500px' }}>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: '100%' }}
          onSelectEvent={handleSelectEvent}
          onEventDrop={handleEventDrop}
          eventPropGetter={eventStyleGetter}
          date={date}
          onNavigate={setDate}
          view={view}
          onView={setView}
          draggableAccessor={() => true}
          resizable
          popup
        />
      </div>
    </div>
  )
}
