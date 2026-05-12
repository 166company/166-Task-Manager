import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
} from '@tanstack/react-table'
import { ArrowUpDown, ArrowUp, ArrowDown, Eye, EyeOff } from 'lucide-react'
import { useTaskStore } from '../../../store/taskStore'
import { useUIStore } from '../../../store/uiStore'
import Avatar from '../../ui/Avatar'
import { StatusBadge, PriorityBadge, LabelBadge } from '../../ui/Badge'
import { formatDate, dueDateColor } from '../../../utils/dateUtils'

const columnHelper = createColumnHelper()

export default function TableView() {
  const { t } = useTranslation()
  const tasks = useTaskStore(s => s.getFilteredTasks())
  const { openTaskModal } = useUIStore()
  const [sorting, setSorting] = useState([])
  const [columnVisibility, setColumnVisibility] = useState({})
  const [rowSelection, setRowSelection] = useState({})

  const columns = [
    columnHelper.display({
      id: 'select',
      size: 40,
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllRowsSelected()}
          onChange={table.getToggleAllRowsSelectedHandler()}
          className="rounded"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={row.getToggleSelectedHandler()}
          onClick={e => e.stopPropagation()}
          className="rounded"
        />
      ),
    }),
    columnHelper.accessor('title', {
      header: t('task.title'),
      cell: info => (
        <span className="font-medium text-gray-900 dark:text-gray-100">{info.getValue()}</span>
      ),
    }),
    columnHelper.accessor('status', {
      header: t('task.status'),
      cell: info => <StatusBadge status={info.getValue()} />,
    }),
    columnHelper.accessor('priority', {
      header: t('task.priority'),
      cell: info => <PriorityBadge priority={info.getValue()} />,
    }),
    columnHelper.accessor('assignee', {
      header: t('task.assignee'),
      cell: info => info.getValue()
        ? <div className="flex items-center gap-2"><Avatar user={info.getValue()} size="xs" /><span className="text-sm">{info.getValue().full_name}</span></div>
        : <span className="text-gray-400 text-sm">—</span>,
      enableSorting: false,
    }),
    columnHelper.accessor('due_date', {
      header: t('task.dueDate'),
      cell: info => info.getValue()
        ? <span className={`text-sm ${dueDateColor(info.getValue())}`}>{formatDate(info.getValue())}</span>
        : <span className="text-gray-400 text-sm">—</span>,
    }),
    columnHelper.accessor('labels', {
      header: t('task.labels'),
      cell: info => (
        <div className="flex flex-wrap gap-1">
          {(info.getValue() || []).map(l => <LabelBadge key={l.id} label={l} />)}
        </div>
      ),
      enableSorting: false,
    }),
  ]

  const table = useReactTable({
    data: tasks,
    columns,
    state: { sorting, columnVisibility, rowSelection },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    enableRowSelection: true,
  })

  const selectedCount = Object.keys(rowSelection).length

  return (
    <div className="p-4 flex flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div>
          {selectedCount > 0 && (
            <span className="text-sm text-primary-600 font-medium">{selectedCount} seçildi</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {table.getAllLeafColumns().filter(c => c.id !== 'select').map(col => (
            <button
              key={col.id}
              onClick={col.getToggleVisibilityHandler()}
              className={`flex items-center gap-1 text-xs px-2 py-1 rounded border transition-colors
                ${col.getIsVisible()
                  ? 'border-primary-300 text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-200 dark:border-gray-600 text-gray-400'}`}
            >
              {col.getIsVisible() ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
              {col.id}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map(hg => (
              <tr key={hg.id} className="border-b border-gray-200 dark:border-gray-700">
                {hg.headers.map(header => (
                  <th
                    key={header.id}
                    className="text-left px-4 py-3 font-medium text-gray-500 dark:text-gray-400 whitespace-nowrap"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <div
                        className={`flex items-center gap-1 ${header.column.getCanSort() ? 'cursor-pointer select-none hover:text-gray-900 dark:hover:text-white' : ''}`}
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getCanSort() && (
                          header.column.getIsSorted() === 'asc' ? <ArrowUp className="w-3 h-3" />
                          : header.column.getIsSorted() === 'desc' ? <ArrowDown className="w-3 h-3" />
                          : <ArrowUpDown className="w-3 h-3 opacity-40" />
                        )}
                      </div>
                    )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map(row => (
              <tr
                key={row.id}
                onClick={() => openTaskModal(row.original.id)}
                className="border-b border-gray-100 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors"
              >
                {row.getVisibleCells().map(cell => (
                  <td key={cell.id} className="px-4 py-3 whitespace-nowrap">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
            {table.getRowModel().rows.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="text-center py-12 text-gray-400">
                  {t('task.noTasks')}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
