import { Note } from "@/lib/types";
import { useEffect, useState } from "react";
import AddNoteForm from "./AddNoteForm";
import "./App.css";

function App() {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState<Note>({
    id: crypto.randomUUID(),
    url: window.location.href,
    content: "",
    domLocator: "",
    createdAt: Date.now(),
  });

  function getCssPath(el: Element | null): string {
    if (!el || !(el instanceof Element)) return "";
    const path: string[] = [];

    while (el && el.nodeType === Node.ELEMENT_NODE) {
      let selector = el.nodeName.toLowerCase();

      if (el.id) {
        selector += `#${el.id}`;
        path.unshift(selector);
        break;
      } else {
        let nth = 1;
        let sib = el;
        while ((sib = sib.previousElementSibling as Element)) nth++;
        selector += `:nth-of-type(${nth})`;
      }

      path.unshift(selector);
      el = el.parentElement!;
    }

    return path.join(" > ");
  }

  useEffect(() => {
    const handler = (msg: any) => {

      // Background requests selection DOM path

      if (msg.type === "REQUEST_SELECTION_CONTEXT") {
        const selection = window.getSelection();
        let domPath: string | null = null;

        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          const node =
            range.startContainer.nodeType === 3
              ? range.startContainer.parentElement
              : (range.startContainer as Element);

          domPath = getCssPath(node);
        }

        chrome.runtime.sendMessage({
          type: "SELECTION_CONTEXT_RESULT",
          selectedText: msg.selectedText,
          domPath,
        });

        return;
      }

      // Background sends final data to open editor

      if (msg.type === "OPEN_EDITOR_AT_SELECTION") {
        setFormData({
          id: crypto.randomUUID(),
          url: window.location.href,
          content: "",
          domLocator: msg.domPath || "",
          createdAt: Date.now(),
        });

        setIsOpen(true);
      }
    };

    chrome.runtime.onMessage.addListener(handler);
    return () => chrome.runtime.onMessage.removeListener(handler);
  }, []);

  useEffect(() => {
    chrome.storage.local.get(["notes"], (result) => {
      console.log("Loaded notes:", result.notes || []);
    });
  }, []);

  const handleCancel = () => {
    setIsOpen(false);
  };
  const handleSave = async (note: Note) => {
    chrome.storage.local.get(["notes"], (result) => {
      const existingNotes: Note[] = Array.isArray(result.notes)
        ? (result.notes as Note[])
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
        <div
          className="fixed inset-0 flex items-center justify-end z-50"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            pointerEvents: "auto",
          }}
        >
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
