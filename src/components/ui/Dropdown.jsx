import { useState, useRef, useEffect } from 'react'
import { ChevronDown } from 'lucide-react'

export default function Dropdown({ trigger, items, align = 'left', className = '' }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const alignClass = align === 'right' ? 'right-0' : 'left-0'

  return (
    <div ref={ref} className={`relative ${className}`}>
      <div onClick={() => setOpen(v => !v)}>{trigger}</div>
      {open && (
        <div className={`absolute ${alignClass} top-full mt-1 z-50 min-w-[160px] card shadow-lg py-1`}>
          {items.map((item, i) =>
            item === 'divider' ? (
              <div key={i} className="my-1 border-t border-gray-200 dark:border-gray-700" />
            ) : (
              <button
                key={i}
                onClick={() => { item.onClick?.(); setOpen(false) }}
                disabled={item.disabled}
                className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-40 ${item.danger ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20' : 'text-gray-700 dark:text-gray-300'}`}
              >
                {item.icon && <span className="w-4 h-4">{item.icon}</span>}
                {item.label}
              </button>
            )
          )}
        </div>
      )}
    </div>
  )
}
