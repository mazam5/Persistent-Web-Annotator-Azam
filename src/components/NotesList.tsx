import { Note } from "@/lib/types";
import { Trash } from "lucide-react";
import { useEffect, useState } from "react";
import { format } from 'date-fns';

export default function NotesList() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);
  const [searchNote, setSearchNote] = useState("");
  useEffect(() => {
    chrome.storage.local.get(["notes"], (items) => {
      const notes = Array.isArray(items.notes) ? (items.notes as Note[]) : [];
      setAllNotes(notes);
    });
  }, []);

  useEffect(() => {
    chrome.storage.local.get(["notes"], (items) => {
      const notes = Array.isArray(items.notes) ? (items.notes as Note[]) : [];
      const filteredNotes = notes.filter((note) =>
        note.content.toLowerCase().includes(searchNote.toLowerCase())
      );
      setAllNotes(filteredNotes);
    })
  }, [searchNote]);

  const deleteNote = (id: string) => {
    chrome.storage.local.get(["notes"], (items) => {
      const existing = Array.isArray(items.notes) ? items.notes : [];
      const updated = existing.filter((n: Note) => n.id !== id);

      chrome.storage.local.set({ notes: updated }, () => {
        setAllNotes(updated);
      });
    });
  };

  return (
    <div className="p-4 space-y-3">
      {allNotes.length === 0 ? (
        <div className="text-gray-500 text-sm italic">No notes found.</div>
      ) : (
        <div>
          <input
            type="text"
            placeholder="Search notes..."
            value={searchNote}
            onChange={(e) => setSearchNote(e.target.value)}
            className="w-full p-2 border border-gray-200 rounded"
          />
          <ol className="space-y-2">
            {allNotes.map((note) => (
              <li
                key={note.id}
                className="border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow transition bg-white"
              >
                <div className="flex justify-between">

                  <h2 className="text-lg font-semibold">{note.content}</h2>
                  <span className="text-xs text-gray-400 mt-1">
                    {format(new Date(note.createdAt), 'dd-MMM-yyyy H:mm')}
                  </span>
                </div>
                <div className="bg-gray-800">

                  <code className="text-xs text-gray-400 mt-1">
                    {note.domLocator}
                  </code>
                </div>
                {note.url && (
                  <a
                    href={note.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 text-sm underline mt-1 inline-block"
                  >
                    View Source
                  </a>
                )}

                <button
                  className="text-red-500 text-sm underline mt-1 inline-block float-right"
                  onClick={() => deleteNote(note.id)}
                >
                  <Trash />
                </button>
              </li>
            ))}
          </ol>
        </div>

      )}
    </div>
  );
}
