import { forwardRef } from 'react'

const Input = forwardRef(({ label, error, className = '', ...props }, ref) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</label>}
    <input
      ref={ref}
      className={`input ${error ? 'border-red-500 focus:ring-red-400' : ''} ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-500">{error}</p>}
  </div>
))

Input.displayName = 'Input'
export default Input
