import { useState, useRef, useEffect } from 'react'

interface Option {
  id: string
  label: string
  sublabel?: string
}

interface SearchSelectProps {
  options: Option[]
  value: string
  onChange: (id: string) => void
  placeholder?: string
}

export default function SearchSelect({
  options, value, onChange, placeholder = 'Selecciona...'
}: SearchSelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find(o => o.id === value)

  const filtered = options.filter(o =>
    o.label.toLowerCase().includes(search.toLowerCase())
  )

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node))
        setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl border text-sm transition-colors ${
          value
            ? 'border-[#0F6E56] bg-[#f8fffc]'
            : 'border-gray-200 bg-gray-50'
        }`}
      >
        <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
          value ? 'bg-[#E1F5EE] text-[#0F6E56]' : 'bg-gray-100 text-gray-400'
        }`}>
          {selected ? selected.label.charAt(0) : '+'}
        </div>
        <span className={`flex-1 text-left ${value ? 'text-gray-900 font-medium' : 'text-gray-400'}`}>
          {selected ? selected.label : placeholder}
        </span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
          stroke={value ? '#0F6E56' : '#bbb'} strokeWidth="2" strokeLinecap="round">
          <polyline points={open ? "18 15 12 9 6 15" : "6 9 12 15 18 9"}/>
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute top-full left-0 right-0 mt-1.5 bg-white border border-gray-100 rounded-xl shadow-lg z-50 overflow-hidden">
          {/* Search */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-gray-50">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
              stroke="#bbb" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Cerca..."
              autoFocus
              className="flex-1 text-sm focus:outline-none text-gray-700 placeholder:text-gray-300"
            />
          </div>

          {/* Options */}
          <div className="max-h-48 overflow-y-auto p-1.5">
            {filtered.length === 0 ? (
              <p className="text-xs text-gray-400 text-center py-3">Sense resultats</p>
            ) : (
              filtered.map(o => {
                const isSelected = o.id === value
                return (
                  <button
                    key={o.id}
                    type="button"
                    onClick={() => {
                      onChange(o.id)
                      setOpen(false)
                      setSearch('')
                    }}
                    className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg transition-colors ${
                      isSelected ? 'bg-[#E1F5EE]' : 'hover:bg-gray-50'
                    }`}
                  >
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium flex-shrink-0 ${
                      isSelected ? 'bg-[#0F6E56] text-white' : 'bg-gray-100 text-gray-500'
                    }`}>
                      {o.label.charAt(0)}
                    </div>
                    <div className="flex-1 text-left">
                      <p className={`text-sm font-medium ${isSelected ? 'text-[#085041]' : 'text-gray-900'}`}>
                        {o.label}
                      </p>
                      {o.sublabel && (
                        <p className="text-xs text-gray-400">{o.sublabel}</p>
                      )}
                    </div>
                    {isSelected && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                        stroke="#0F6E56" strokeWidth="2.5" strokeLinecap="round">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                  </button>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}