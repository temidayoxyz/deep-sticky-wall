import { useEffect, useRef, useState } from 'react'
import { STYLES } from './styles.ts'

interface Note {
  id: string
  text: string
  x: number
  y: number
  color: string
}

interface DragState {
  id: string
  offsetX: number
  offsetY: number
}

interface IconProps {
  size?: number
  active?: boolean
}

const STORAGE_KEY = 'dsh-deep-sticky-wall:notes'
const COLORS = ['#fef08a', '#fde68a', '#bbf7d0', '#bfdbfe', '#fbcfe8', '#ddd6fe']
const NOTE_WIDTH = 224
const NOTE_HEIGHT = 160
const MARGIN = 28

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

function rectanglesOverlap(a: { x: number; y: number }, b: { x: number; y: number }): boolean {
  return Math.abs(a.x - b.x) < NOTE_WIDTH + MARGIN && Math.abs(a.y - b.y) < NOTE_HEIGHT + MARGIN
}

function findEmptySpot(notes: Note[], canvasWidth: number, canvasHeight: number): { x: number; y: number } {
  const gridX = Math.max(1, Math.floor((canvasWidth - NOTE_WIDTH) / (NOTE_WIDTH + MARGIN)))
  const gridY = Math.max(1, Math.floor((canvasHeight - NOTE_HEIGHT) / (NOTE_HEIGHT + MARGIN)))
  for (let row = 0; row < gridY; row++) {
    for (let col = 0; col < gridX; col++) {
      const candidate = {
        x: MARGIN + col * (NOTE_WIDTH + MARGIN),
        y: MARGIN + row * (NOTE_HEIGHT + MARGIN),
      }
      if (!notes.some((note) => rectanglesOverlap(candidate, note))) {
        return candidate
      }
    }
  }
  const last = notes[notes.length - 1]
  return {
    x: (last?.x ?? 0) + NOTE_WIDTH + MARGIN,
    y: last?.y ?? MARGIN,
  }
}

export function StickyIcon(props: IconProps = {}) {
  const size = props.size ?? 18
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M6 3h12a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" fill="#fde68a" />
      <path d="M6 3h12a2 2 0 0 1 2 2v4H4V5a2 2 0 0 1 2-2z" fill="#f59e0b" />
      <path d="M7 12h10M7 16h7" stroke="#92400e" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function StickyWall() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [notes, setNotes] = useState<Note[]>(() => loadNotes())
  const [dragging, setDragging] = useState<DragState | null>(null)
  const [size, setSize] = useState({ width: 3200, height: 2200 })

  useEffect(() => { saveNotes(notes) }, [notes])

  useEffect(() => {
    const style = document.createElement('style')
    style.dataset.plugin = 'dsh-deep-sticky-wall'
    style.textContent = STYLES
    document.head.appendChild(style)
    return () => { style.remove() }
  }, [])

  useEffect(() => {
    const recalc = (): void => {
      const maxX = Math.max(0, ...notes.map((note) => note.x + NOTE_WIDTH + MARGIN * 2))
      const maxY = Math.max(0, ...notes.map((note) => note.y + NOTE_HEIGHT + MARGIN * 2))
      setSize({
        width: Math.max(window.innerWidth, maxX),
        height: Math.max(window.innerHeight, maxY),
      })
    }
    recalc()
  }, [notes])

  const addNote = (): void => {
    const spot = findEmptySpot(notes, size.width, size.height)
    const color = COLORS[Math.floor(Math.random() * COLORS.length)]
    setNotes((prev) => ([...prev, { id: `note-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, text: '', color, ...spot }]))
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
    noteEl.setPointerCapture?.(e.pointerId)
  }

  const handlePointerMove = (e: any): void => {
    if (!dragging || !containerRef.current) return
    const rect = containerRef.current.getBoundingClientRect()
    const x = (e.clientX - rect.left - dragging.offsetX) + containerRef.current.scrollLeft
    const y = (e.clientY - rect.top - dragging.offsetY) + containerRef.current.scrollTop
    setNotes((prev) => prev.map((n) => (
      n.id === dragging.id ? { ...n, x: clamp(x, 0, size.width - NOTE_WIDTH), y: clamp(y, 0, size.height - NOTE_HEIGHT) } : n
    )))
  }

  const handlePointerUp = (): void => setDragging(null)

  return (
    <div className='dsnw-viewport' onPointerMove={handlePointerMove} onPointerUp={handlePointerUp}>
      <div ref={containerRef} className='dsnw-wall' style={{ width: size.width, height: size.height }}>
        <div className='dsnw-toolbar'>
          <button type='button' className='dsnw-button' onClick={addNote}>Add note</button>
          <span style={{ opacity: 0.7, fontSize: 12 }}>{notes.length} note{notes.length === 1 ? '' : 's'}</span>
        </div>
        {notes.length === 0 && (
          <div className='dsnw-empty'>
            <h3>Sticky note wall</h3>
            <p>Click “Add note” to capture an idea. Drag an empty spot to pan the canvas.</p>
          </div>
        )}
        {notes.map((note) => (
          <div
            key={note.id}
            className='dsnw-note'
            onPointerDown={(e) => handlePointerDown(e, note)}
            style={{ left: note.x, top: note.y, background: note.color, width: NOTE_WIDTH, height: NOTE_HEIGHT }}
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
                    type='button'
                    key={color}
                    className='dsnw-color-dot'
                    style={{ background: color }}
                    onClick={() => changeColor(note.id, color)}
                    onPointerDown={(e) => e.stopPropagation()}
                    aria-label='Change color'
                  />
                ))}
              </div>
              <button
                type='button'
                className='dsn-delete'
                onClick={(e) => { e.stopPropagation(); removeNote(note.id) }}
                onPointerDown={(e) => e.stopPropagation()}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
