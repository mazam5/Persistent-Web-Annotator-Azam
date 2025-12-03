import { useEffect, useState } from "react";
import AddNoteForm from "./AddNoteForm";
import "./App.css";
import { generateHybridLocator } from "@/helpers/domLocator";
import { restoreHighlight } from "@/helpers/restoreNoteHighlighter";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Note>({
    id: crypto.randomUUID(),
    url: window.location.href,
    content: "",
    domLocator: "",
    createdAt: Date.now(),
  });

  useEffect(() => {
    const handler = (msg: any) => {
      if (msg.type === "REQUEST_SELECTION_CONTEXT") {
        const selection = window.getSelection();
        let locator: HybridLocator | null = null;

        if (selection && selection.rangeCount > 0) {
          locator = generateHybridLocator(selection.getRangeAt(0));
        }

        chrome.runtime.sendMessage({
          type: "SELECTION_CONTEXT_RESULT",
          selectedText: msg.selectedText,
          domLocator: locator,
        });
        return;
      }

      if (msg.type === "OPEN_EDITOR_AT_SELECTION") {
        setFormData({
          id: crypto.randomUUID(),
          url: window.location.href,
          content: "",
          domLocator: JSON.stringify(msg.domLocator || {}),
          createdAt: Date.now(),
        });

        setIsOpen(true);
      }
    };

    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  /** Restore highlights whenever page loads */
  useEffect(() => {
    // Add a small delay to ensure DOM is fully loaded
    const timer = setTimeout(() => {
      chrome.storage.local.get(["notes"], (result) => {
        const notes: Note[] = Array.isArray(result.notes) ? result.notes : [];
        const currentUrl = window.location.href;

        const notesForThisPage = notes.filter((n) => n.url === currentUrl);

        notesForThisPage.forEach((note) => {
          try {
            const locator: HybridLocator = JSON.parse(note.domLocator);
            const success = restoreHighlight(locator, note.content, note.id);
            if (success) {
              console.log(`✓ Restored highlight for note: ${note.id}`);
            } else {
              console.warn(
                `✗ Failed to restore highlight for note: ${note.id}`,
              );
            }
          } catch (e) {
            console.error("Failed to restore note highlight:", e, note);
          }
        });
      });
    }, 500); // Wait 500ms for DOM to settle

    return () => clearTimeout(timer);
  }, []);

  const handleCancel = () => setIsOpen(false);

  const handleSave = async (note: Note) => {
    chrome.storage.local.get(["notes"], (result) => {
      const existingNotes: Note[] = Array.isArray(result.notes)
        ? result.notes
        : [];

      const updatedNotes = [...existingNotes, note];

      chrome.storage.local.set({ notes: updatedNotes }, () => {
        console.log("Saved notes:", updatedNotes);
      });
    });

    setIsOpen(false);
  };

  return (
    <div>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50">
          <AddNoteForm
            formData={formData}
            setFormData={setFormData}
            onCancel={handleCancel}
            onSave={handleSave}
          />
        </div>
      )}
    </div>
  );
}

export default App;
