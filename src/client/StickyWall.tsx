import { useEffect, useRef, useState } from 'react'
import { STYLES } from './styles.ts'

interface Note {
  id: string
  text: string
  x: number
  y: number
  color: string
}

const STORAGE_KEY = 'dsh-deep-sticky-wall:notes'
const COLORS = ['#fef08a', '#fde68a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#ddd6fe']

function loadNotes(): Note[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed.filter((n: any) => typeof n?.id === 'string')
  } catch {
    return []
  }
}

function saveNotes(notes: Note[]): void {
  try { window.localStorage.setItem(STORAGE_KEY, JSON.stringify(notes)) } catch { /* ignore */ }
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function StickyIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" fill="#fde68a" />
      <rect x="4" y="3" width="16" height="4" rx="2" fill="#f59e0b" />
      <line x1="7" y1="10" x2="17" y2="10" stroke="#92400e" strokeWidth="1.2" />
      <line x1="7" y1="13" x2="15" y2="13" stroke="#92400e" strokeWidth="1.2" />
      <line x1="7" y1="16" x2="13" y2="16" stroke="#92400e" strokeWidth="1.2" />
    </svg>
  )
}

export function StickyWall() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [notes, setNotes] = useState<Note[]>(() => loadNotes())
  const [dragging, setDragging] = useState<{ id: string; offsetX: number; offsetY: number } | null>(null)

  useEffect(() => { saveNotes(notes) }, [notes])

  useEffect(() => {
    const style = document.createElement('style')
    style.dataset.plugin = 'dsh-deep-sticky-wall'
    style.textContent = STYLES
    document.head.appendChild(style)
    return () => { style.remove() }
  }, [])

  const addNote = (): void => {
    const id = `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    setNotes((prev) => ([
      ...prev,
      { id, text: '', x: 42, y: 38, color },
    ]))
  }

  const updateText = (id: string, text: string): void => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, text } : n))
  }

  const changeColor = (id: string, color: string): void => {
    setNotes((prev) => prev.map((n) => n.id === id ? { ...n, color } : n))
  }

  const removeNote = (id: string): void => {
    setNotes((prev) => prev.filter((n) => n.id !== id))
  }

  const handlePointerDown = (e: any, note: Note): void => {
    const noteEl = e.currentTarget as HTMLElement
    const noteRect = noteEl.getBoundingClientRect()
    setDragging({
      id: note.id,
      offsetX: e.clientX - noteRect.left,
      offsetY: e.clientY - noteRect.top,
    })
    ;(e.currentTarget as any).setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e: any): void => {
    if (!dragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left - dragging.offsetX) / rect.width) * 100
    const y = ((e.clientY - rect.top - dragging.offsetY) / rect.height) * 100
    setNotes((prev) => prev.map((n) => (
      n.id === dragging.id
        ? { ...n, x: clamp(x, 0, 85), y: clamp(y, 0, 85) }
        : n
    )))
  }

  const handlePointerUp = (): void => setDragging(null)

  return (
    <div
      ref={containerRef}
      className='dsnw-wall'
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      style={{ minHeight: '70vh' }}
    >
      <div className='dsnw-toolbar'>
        <button className='dsnw-button' onClick={addNote}>+ Add note</button>
        <span style={{ opacity: 0.7, fontSize: 12 }}>{notes.length} note{notes.length === 1 ? '' : 's'}</span>
      </div>
      {notes.length === 0 && (
        <div className='dsnw-empty'>
          <h3>Sticky note wall</h3>
          <p>Capture ideas anytime. Click “Add note” to start.</p>
        </div>
      )}
      {notes.map((note) => (
        <div
          key={note.id}
          className='dsnw-note'
          onPointerDown={(e) => handlePointerDown(e, note)}
          style={{ left: `${note.x}%`, top: `${note.y}%`, background: note.color }}
        >
          <textarea
            value={note.text}
            onChange={(e) => updateText(note.id, e.target.value)}
            placeholder='Type an idea…'
            onPointerDown={(e) => e.stopPropagation()}
          />
          <div className='dsn-actions'>
            <div className='dsnw-colors'>
              {COLORS.map((color) => (
                <button
                  key={color}
                  className='dsnw-color-dot'
                  style={{ background: color }}
                  onClick={() => changeColor(note.id, color)}
                  aria-label='Change color'
                  onPointerDown={(e) => e.stopPropagation()}
                />
              ))}
            </div>
            <button className='dsn-delete' onClick={() => removeNote(note.id)}>×</button>
          </div>
        </div>
      ))}
    </div>
  )
}
