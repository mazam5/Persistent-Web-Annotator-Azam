import { format } from 'date-fns'
import {
  ArrowLeftRight,
  ArrowRightLeft,
  Download,
  Trash,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'

export default function NotesList() {
  const [allNotes, setAllNotes] = useState<Note[]>([])
  const [filteredNotes, setFilteredNotes] = useState<Note[]>([])
  const [searchNote, setSearchNote] = useState('')
  const [showAllNotes, setShowAllNotes] = useState(false)
  const [currentUrl, setCurrentUrl] = useState('')
  const [expandedNotes, setExpandedNotes] = useState<{ [id: string]: boolean }>(
    {}
  )

  // Get current tab URL
  useEffect(() => {
    chrome.tabs.query({ active: true, lastFocusedWindow: true }, (tabs) => {
      const url = tabs[0]?.url || ''
      setCurrentUrl(url)

      chrome.storage.local.get(['notes'], (items) => {
        const notes = Array.isArray(items.notes) ? items.notes : []
        setAllNotes(notes)
      })
    })
  }, [])

  // Apply filters
  useEffect(() => {
    const q = searchNote.toLowerCase()

    let visibleNotes = allNotes

    // Filter by URL unless "Show All" is checked
    if (!showAllNotes) {
      visibleNotes = visibleNotes.filter((n) => n.url === currentUrl)
    }

    // Search matches
    visibleNotes = visibleNotes.filter((note) => {
      const content = (note.content || '').toLowerCase()
      const url = (note.url || '').toLowerCase()
      const selectedText = (getSelectedText(note) || '').toLowerCase()

      return content.includes(q) || url.includes(q) || selectedText.includes(q)
    })

    setFilteredNotes(visibleNotes)
  }, [allNotes, searchNote, showAllNotes, currentUrl])

  const getSelectedText = (note: Note) => {
    try {
      const obj = JSON.parse(note.domLocator)
      return obj.textSnippet?.selected || note.content || ''
    } catch {
      return note.content || ''
    }
  }

  const deleteNote = (id: string) => {
    chrome.storage.local.get(['notes'], (items) => {
      const existing = Array.isArray(items.notes) ? items.notes : []
      const updated = existing.filter((n: Note) => n.id !== id)

      chrome.storage.local.set({ notes: updated }, () => {
        setAllNotes(updated)

        // Tell content script to remove highlight
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]?.id) {
            chrome.tabs.sendMessage(tabs[0].id, {
              type: 'REMOVE_HIGHLIGHT',
              noteId: id,
            })
          }
        })
      })
    })
  }
  const selected = (note: Note) => () => {
    try {
      const obj = JSON.parse(note.domLocator)
      return obj.textSnippet?.selected || note.content
    } catch {
      return note.content
    }
  }

  const clearSearch = () => {
    setSearchNote('')
  }

  const handleExportAsJSON = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(filteredNotes))
    const downloadAnchorNode = document.createElement('a')
    downloadAnchorNode.setAttribute('href', dataStr)
    downloadAnchorNode.setAttribute('download', `${currentUrl}.json`)
    document.body.appendChild(downloadAnchorNode)
    downloadAnchorNode.click()
    downloadAnchorNode.remove()
  }

  const calculateTimeAgo = (note: Note) => {
    const now = new Date().getTime()
    const created = new Date(note.createdAt).getTime()
    const diff = now - created

    const seconds = Math.floor(diff / 1000)
    if (seconds < 60) return `${seconds}s ago`

    const minutes = Math.floor(seconds / 60)
    if (minutes < 60) return `${minutes} min ago`

    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`

    const days = Math.floor(hours / 24)
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`

    const weeks = Math.floor(days / 7)
    if (weeks < 4) return `${weeks} week${weeks > 1 ? 's' : ''} ago`

    const months = Math.floor(days / 30)
    if (months < 12) return `${months} month${months > 1 ? 's' : ''} ago`

    const years = Math.floor(days / 365)
    return `${years} year${years > 1 ? 's' : ''} ago`
  }

  const getDisplayText = (note: Note) => {
    let text = selected(note)() || ''

    const isExpanded = expandedNotes[note.id]
    const limit = 30

    if (text.length <= limit) return text

    if (isExpanded) {
      return (
        <>
          {text}{' '}
          <button
            className="ml-1 font-semibold underline"
            onClick={() =>
              setExpandedNotes((prev) => ({ ...prev, [note.id]: false }))
            }
          >
            less
          </button>
        </>
      )
    }

    return (
      <>
        {text.substring(0, limit)}...
        <button
          className="ml-1 text-blue-500 underline"
          onClick={() =>
            setExpandedNotes((prev) => ({ ...prev, [note.id]: true }))
          }
        >
          more
        </button>
      </>
    )
  }

  return (
    <div className="space-y-3">
      {filteredNotes.length === 0 ? (
        <div className="text-center text-2xl font-semibold text-gray-500 italic dark:text-gray-100">
          No notes found.
        </div>
      ) : (
        <>
          <div
            className="flex items-center justify-between gap-4 rounded-xl bg-white p-3 shadow-sm dark:bg-gray-900"
            id="actions"
          >
            {/* Search Input by URL, title, or text */}
            <div className="relative flex-1">
              <input
                title="Search notes by URL, note title, or text"
                type="text"
                placeholder="🔍 by URL, title, or text..."
                value={searchNote}
                onChange={(e) => setSearchNote(e.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 pr-10 text-sm text-gray-700 transition focus:border-blue-500 focus:ring focus:ring-blue-300/40 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
              />
              {searchNote.length > 0 && (
                <button
                  className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-500 transition hover:text-gray-700 dark:text-gray-300 dark:hover:text-gray-100"
                  onClick={clearSearch}
                >
                  <X size={18} />
                </button>
              )}
            </div>

            {/* Toggle Button for show all notes | show current tabs' notes */}
            <button
              title={
                showAllNotes ? "Show Current Tab's Notes" : 'Show All Notes'
              }
              className="flex w-24 items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 shadow-sm transition hover:bg-gray-100 dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
              onClick={() => setShowAllNotes(!showAllNotes)}
            >
              {showAllNotes ? (
                <>
                  <ArrowRightLeft size={18} />
                  <span>Current</span>
                </>
              ) : (
                <>
                  <ArrowLeftRight size={18} />
                  <span>All</span>
                </>
              )}
            </button>

            {/* Download Button */}
            <button
              type="button"
              title="Download as JSON"
              onClick={handleExportAsJSON}
              className="flex items-center gap-2 rounded-lg bg-green-600 px-3 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-green-500 active:scale-95"
            >
              <Download size={18} />
            </button>
          </div>
          <p className="text-center text-sm text-gray-500 dark:text-gray-100">
            {filteredNotes.length} note{filteredNotes.length > 1 && 's'} for{' '}
            {showAllNotes ? 'all tabs' : 'current tab'}
          </p>
          <ol className="space-y-2">
            {filteredNotes.map((note) => (
              <li
                key={note.id}
                className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-gray-600 shadow-sm transition duration-300 ease-in-out hover:shadow dark:bg-gray-800 dark:text-gray-50"
              >
                <div className="flex justify-between">
                  <h2 className="text-xl font-bold italic">{note.content}</h2>
                  <button
                    className="float-right mt-1 rounded p-1 text-sm text-red-500 hover:bg-red-500 hover:text-white"
                    onClick={() => deleteNote(note.id)}
                  >
                    <Trash size={16} />
                  </button>
                </div>

                <p className="mt-1 text-sm">{getDisplayText(note)}</p>

                {note.url && (
                  <a
                    href={note.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-block text-sm break-all text-blue-500 underline"
                  >
                    {note.url}
                  </a>
                )}

                <div
                  className="mt-1 text-xs text-gray-400"
                  title={format(note.createdAt, 'dd-MMM-yyyy H:mm')}
                >
                  {calculateTimeAgo(note)}
                </div>
              </li>
            ))}
          </ol>
        </>
      )}
    </div>
  )
}
