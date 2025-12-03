import { Note } from "@/lib/types";
import { useEffect, useState } from "react";
import AddNoteForm from "./AddNoteForm";
import "./App.css";

interface HybridLocator {
  cssPath: string;
  textSnippet: {
    before: string;
    selected: string;
    after: string;
  };
}

function generateCssPath(el: Element | null): string {
  if (!el || !(el instanceof Element)) return "";
  const path: string[] = [];

  while (el && el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();

    if (el.id) {
      selector += `#${el.id}`;
      path.unshift(selector);
      break;
    } else {
      // Count siblings of the same type
      const parent = el.parentElement;
      if (parent) {
        const siblings = Array.from(parent.children).filter(
          (child) => child.nodeName === el?.nodeName,
        );
        if (siblings.length > 1) {
          const index = siblings.indexOf(el) + 1;
          selector += `:nth-of-type(${index})`;
        }
      }
    }

    path.unshift(selector);
    el = el.parentElement!;
  }

  return path.join(" > ");
}

function generateHybridLocator(range: Range): HybridLocator {
  const node =
    range.startContainer.nodeType === 3
      ? range.startContainer.parentElement
      : (range.startContainer as Element);

  const cssPath = generateCssPath(node);

  const fullText = range.startContainer.textContent || "";
  const start = range.startOffset;
  const end = range.endOffset;

  return {
    cssPath,
    textSnippet: {
      before: fullText.slice(Math.max(0, start - 30), start),
      selected: fullText.slice(start, end),
      after: fullText.slice(end, end + 30),
    },
  };
}

function restoreHighlight(locator: HybridLocator) {
  return applyStyleToDomLocator(
    locator,
    {
      backgroundColor: "yellow",
      color: "black",
      fontWeight: "bold",
    },
    [
      "bg-yellow-300",
      "underline",
      "decoration-2",
      "decoration-yellow-500",
      "rounded-sm",
    ],
  );
}

function applyStyleToDomLocator(
  locator: HybridLocator,
  styles: Partial<CSSStyleDeclaration>,
  classes: string[] = [],
) {
  let el = document.querySelector(locator.cssPath);

  // If element not found, try to find it using text context
  if (!el) {
    console.warn("Element not found for CSS path:", locator.cssPath);
    console.log("Attempting fallback search using text context...");

    // Try to find element by searching for the text content
    const allElements = document.querySelectorAll(
      "p, div, span, h1, h2, h3, h4, h5, h6, li, td, th",
    );
    for (const element of allElements) {
      const text = element.textContent || "";
      const contextString =
        locator.textSnippet.before +
        locator.textSnippet.selected +
        locator.textSnippet.after;
      if (text.includes(contextString)) {
        console.log("✓ Found element using text context fallback");
        el = element;
        break;
      }
    }

    if (!el) {
      console.error("Element not found even with fallback");
      return false;
    }
  }

  // Get all text content from the element
  const fullText = el.textContent || "";

  // Normalize the search text (trim spaces for better matching)
  const searchText = locator.textSnippet.selected.trim();

  // Try to find the text using context clues
  const beforeText = locator.textSnippet.before;
  const afterText = locator.textSnippet.after;

  // Build a context string to search for
  const contextString = beforeText + locator.textSnippet.selected + afterText;
  const contextIndex = fullText.indexOf(contextString);

  let targetStartIndex = -1;

  if (contextIndex !== -1) {
    // Found with full context
    targetStartIndex = contextIndex + beforeText.length;
  } else {
    // Fallback: search for just the selected text
    targetStartIndex = fullText.indexOf(locator.textSnippet.selected);

    if (targetStartIndex === -1) {
      // Try with trimmed version
      targetStartIndex = fullText.indexOf(searchText);
    }
  }

  if (targetStartIndex === -1) {
    console.warn("Could not find text in element:", searchText);
    return false;
  }

  // Now walk through text nodes and apply highlight
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  let currentOffset = 0;
  const targetEndIndex = targetStartIndex + locator.textSnippet.selected.length;

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    const text = node.data;
    const nodeStart = currentOffset;
    const nodeEnd = currentOffset + text.length;

    // Check if this text node contains part of our target range
    if (nodeEnd > targetStartIndex && nodeStart < targetEndIndex) {
      const highlightStart = Math.max(0, targetStartIndex - nodeStart);
      const highlightEnd = Math.min(text.length, targetEndIndex - nodeStart);

      const before = document.createTextNode(text.slice(0, highlightStart));
      const target = document.createElement("span");
      const after = document.createTextNode(text.slice(highlightEnd));

      // Add CSS styles
      Object.assign(target.style, styles);

      // Add Tailwind classes
      classes.forEach((c) => target.classList.add(c));

      target.textContent = text.slice(highlightStart, highlightEnd);

      const parent = node.parentNode!;

      if (before.length > 0) parent.insertBefore(before, node);
      parent.insertBefore(target, node);
      if (after.length > 0) parent.insertBefore(after, node);
      parent.removeChild(node);

      console.log("✓ Successfully applied highlight");
      return true;
    }

    currentOffset = nodeEnd;
  }

  console.warn("Could not apply highlight - text node not found in range");
  return false;
}

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

        console.log(
          `Restoring highlights for ${currentUrl}. Found ${notes.length} total notes.`,
        );

        const notesForThisPage = notes.filter((n) => n.url === currentUrl);
        console.log(`Notes for this page: ${notesForThisPage.length}`);

        notesForThisPage.forEach((note) => {
          try {
            const locator: HybridLocator = JSON.parse(note.domLocator);
            console.log("Attempting to restore:", locator);
            const success = restoreHighlight(locator);
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
