import { useState, useCallback } from 'react'

export default function ColorPicker({ value, onChange }) {
  const [hex, setHex] = useState(value || '#4F46E5')
  const [mode, setMode] = useState('hex')
  const [r, setR] = useState(() => parseInt((value || '#4F46E5').slice(1, 3), 16))
  const [g, setG] = useState(() => parseInt((value || '#4F46E5').slice(3, 5), 16))
  const [b, setB] = useState(() => parseInt((value || '#4F46E5').slice(5, 7), 16))

  const hexToRgb = (h) => {
    const clean = h.replace('#', '')
    if (clean.length !== 6) return null
    return {
      r: parseInt(clean.slice(0, 2), 16),
      g: parseInt(clean.slice(2, 4), 16),
      b: parseInt(clean.slice(4, 6), 16),
    }
  }

  const rgbToHex = (r, g, b) =>
    '#' + [r, g, b].map(v => Math.max(0, Math.min(255, v)).toString(16).padStart(2, '0')).join('')

  const handleHexInput = (val) => {
    setHex(val)
    const clean = val.startsWith('#') ? val : '#' + val
    if (/^#[0-9A-Fa-f]{6}$/.test(clean)) {
      const rgb = hexToRgb(clean)
      if (rgb) { setR(rgb.r); setG(rgb.g); setB(rgb.b) }
      onChange(clean)
    }
  }

  const handleNativeColor = (val) => {
    setHex(val)
    const rgb = hexToRgb(val)
    if (rgb) { setR(rgb.r); setG(rgb.g); setB(rgb.b) }
    onChange(val)
  }

  const handleRgbChange = (nr, ng, nb) => {
    const newHex = rgbToHex(nr, ng, nb)
    setHex(newHex)
    onChange(newHex)
  }

  const PRESETS = [
    '#4F46E5', '#7C3AED', '#9333EA', '#C026D3', '#DB2777', '#E11D48',
    '#DC2626', '#EA580C', '#D97706', '#CA8A04', '#65A30D', '#16A34A',
    '#059669', '#0D9488', '#0891B2', '#0284C7', '#2563EB', '#4338CA',
    '#111827', '#374151', '#6B7280', '#9CA3AF', '#F9FAFB', '#FFFFFF',
  ]

  return (
    <div className="space-y-3">
      {/* Native color picker + preview */}
      <div className="flex items-center gap-3">
        <label className="relative cursor-pointer">
          <div
            className="w-12 h-12 rounded-xl border-2 border-gray-200 dark:border-gray-600 shadow-sm cursor-pointer hover:scale-105 transition-transform"
            style={{ backgroundColor: value || hex }}
          />
          <input
            type="color"
            value={value || hex}
            onChange={e => handleNativeColor(e.target.value)}
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
          />
        </label>
        <div className="flex-1">
          <p className="text-xs text-gray-500 mb-1">Rəngi seçmək üçün klikləyin</p>
          <div
            className="h-2 rounded-full"
            style={{ background: 'linear-gradient(to right, #ff0000, #ff8000, #ffff00, #00ff00, #00ffff, #0000ff, #8000ff, #ff0080)' }}
          />
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => setMode('hex')}
          className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${mode === 'hex' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          HEX
        </button>
        <button
          type="button"
          onClick={() => setMode('rgb')}
          className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${mode === 'rgb' ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700'}`}
        >
          RGB
        </button>
      </div>

      {mode === 'hex' ? (
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm font-mono">#</span>
          <input
            value={hex.replace('#', '')}
            onChange={e => handleHexInput('#' + e.target.value)}
            placeholder="4F46E5"
            maxLength={6}
            className="input font-mono text-sm uppercase"
          />
        </div>
      ) : (
        <div className="flex gap-2">
          {[['R', r, setR, (v) => handleRgbChange(v, g, b)],
            ['G', g, setG, (v) => handleRgbChange(r, v, b)],
            ['B', b, setB, (v) => handleRgbChange(r, g, v)]].map(([label, val, setter, handler]) => (
            <div key={label} className="flex-1">
              <label className="text-xs text-gray-500 block mb-1">{label}</label>
              <input
                type="number"
                min={0}
                max={255}
                value={val}
                onChange={e => { const v = parseInt(e.target.value) || 0; setter(v); handler(v) }}
                className="input text-sm text-center p-1"
              />
            </div>
          ))}
        </div>
      )}

      {/* Preset colors */}
      <div>
        <p className="text-xs text-gray-400 mb-1.5">Hazır rənglər</p>
        <div className="flex flex-wrap gap-1.5">
          {PRESETS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => { handleNativeColor(c) }}
              className={`w-6 h-6 rounded-full border-2 transition-all hover:scale-110 ${(value || hex) === c ? 'border-gray-500 scale-110' : 'border-transparent'}`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
