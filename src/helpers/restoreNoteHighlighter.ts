import isTailwindAvailable from "./checkTailwindCss";

export function applyStyleToDomLocator(
  locator: HybridLocator,
  noteContent: string,
  noteId: string,
) {
  let el = document.querySelector(locator.cssPath);

  // If element not found, try to find it using text context
  if (!el) {
    console.warn("Element not found for CSS path:", locator.cssPath);

    // Try to find element by searching for the text content
    const allElements = document.querySelectorAll(
      "p, div, span, h1, h2, h3, h4, h5, h6, li, td, th, a, strong, em, code, pre",
    );
    for (const element of allElements) {
      const text = element.textContent || "";
      const contextString =
        locator.textSnippet.before +
        locator.textSnippet.selected +
        locator.textSnippet.after;
      if (text.includes(contextString)) {
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

  // Check if Tailwind is available
  const useTailwind = isTailwindAvailable();
  console.log(
    `Using ${useTailwind ? "Tailwind classes" : "inline styles"} for highlighting`,
  );

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

      // Apply styling based on Tailwind availability
      if (useTailwind) {
        // Use Tailwind classes
        target.className =
          "bg-yellow-300 text-black underline decoration-2 decoration-yellow-500 rounded-sm px-0.5 cursor-pointer";
      } else {
        // Use inline styles
        target.style.backgroundColor = "#fef08a";
        target.style.color = "#000000";
        target.style.textDecoration = "underline";
        target.style.textDecorationColor = "#eab308";
        target.style.textDecorationThickness = "2px";
        target.style.borderRadius = "0.125rem";
        target.style.padding = "0 2px";
        target.style.cursor = "pointer";
      }

      target.setAttribute("data-note-id", noteId);
      target.setAttribute("data-note-content", noteContent);

      target.textContent = text.slice(highlightStart, highlightEnd);

      // Add click event to show popup
      target.addEventListener("click", (e) => {
        e.stopPropagation();
        showNotePopup(noteContent, useTailwind);
      });

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

export function showNotePopup(noteContent: string, useTailwind: boolean) {
  // Remove any existing popup
  const existingPopup = document.getElementById("note-popup-overlay");
  if (existingPopup) {
    existingPopup.remove();
  }

  // Create popup overlay
  const overlay = document.createElement("div");
  overlay.id = "note-popup-overlay";

  // Create popup content
  const popup = document.createElement("div");

  const title = document.createElement("h3");
  title.textContent = noteContent || "No note content";

  const closeButton = document.createElement("button");
  closeButton.textContent = "Close";
  closeButton.addEventListener("click", () => {
    overlay.remove();
  });

  // Apply styling based on Tailwind availability
  if (useTailwind) {
    overlay.className =
      "fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]";
    popup.className = "bg-white rounded-lg shadow-xl p-6 max-w-md w-full mx-4";
    title.className = "text-lg font-semibold mb-4 text-gray-900";
    closeButton.className =
      "bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded transition-colors";
  } else {
    // Overlay styles
    overlay.style.position = "fixed";
    overlay.style.top = "0";
    overlay.style.left = "0";
    overlay.style.right = "0";
    overlay.style.bottom = "0";
    overlay.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    overlay.style.display = "flex";
    overlay.style.alignItems = "center";
    overlay.style.justifyContent = "center";
    overlay.style.zIndex = "9999";

    // Popup styles
    popup.style.backgroundColor = "#ffffff";
    popup.style.borderRadius = "8px";
    popup.style.boxShadow =
      "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)";
    popup.style.padding = "24px";
    popup.style.maxWidth = "28rem";
    popup.style.width = "100%";
    popup.style.margin = "0 16px";

    // Title styles
    title.style.fontSize = "1.125rem";
    title.style.fontWeight = "600";
    title.style.marginBottom = "16px";
    title.style.color = "#111827";

    // Button styles
    closeButton.style.backgroundColor = "#3b82f6";
    closeButton.style.color = "#ffffff";
    closeButton.style.fontWeight = "500";
    closeButton.style.padding = "8px 16px";
    closeButton.style.borderRadius = "4px";
    closeButton.style.border = "none";
    closeButton.style.cursor = "pointer";
    closeButton.style.transition = "background-color 0.2s";

    closeButton.addEventListener("mouseenter", () => {
      closeButton.style.backgroundColor = "#2563eb";
    });
    closeButton.addEventListener("mouseleave", () => {
      closeButton.style.backgroundColor = "#3b82f6";
    });
  }

  popup.appendChild(title);
  popup.appendChild(closeButton);
  overlay.appendChild(popup);

  // Close on overlay click
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) {
      overlay.remove();
    }
  });

  document.body.appendChild(overlay);
}
export function restoreHighlight(
  locator: HybridLocator,
  noteContent: string,
  noteId: string,
) {
  return applyStyleToDomLocator(locator, noteContent, noteId);
}
