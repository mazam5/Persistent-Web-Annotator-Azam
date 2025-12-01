import { Note } from "@/lib/types";
import { useEffect, useState } from "react";

export default function NotesList() {
  const [allNotes, setAllNotes] = useState<Note[]>([]);

  useEffect(() => {
    if (chrome?.storage?.local) {
      chrome.storage.local.get(null, (items) => {
        setAllNotes(Object.values(items) as Note[]);
      });
    }
  }, []);

  return (
    <div className="p-4 space-y-3">
      {allNotes.length === 0 ? (
        <div className="text-gray-500 text-sm italic">No notes found.</div>
      ) : (
        <ul className="space-y-2">
          {allNotes.map((note, i) => (
            <li
              key={i}
              className="border border-gray-200 rounded-xl p-3 shadow-sm hover:shadow transition bg-white"
            >
              <div className="text-lg font-semibold">{note.content}</div>
              <div className="text-xs text-gray-400 mt-1">{new Date(note.createdAt).toLocaleString()}</div>
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
            </li>
          ))}
        </ul>
      )
      }
    </div >
  );
}
