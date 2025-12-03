# Persistent Web Annotator by Azam

This is a Chrome Extension which can be used to select an important text from any webpage and add a note to it. All these notes are saved locally in Chrome's Storage.

## Features

- Select any text add a note to it.
- Saved notes can be viewed from Chrome Extension Popup or Sidebar
- Notes contains Note Title, Important Text, Tab's URL, note created time.

## Technologies Used

- [React](https://reactjs.org/)
- [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/)
- [CRXJS](https://crxjs.dev/vite-plugin)
- [TailwindCSS](https://tailwindcss.com/)

## Installation (Developer Mode)

### Step 1: Clone/Download the Project

```bash
git clone https://github.com/mazam5/Persistent-Web-Annotator-Azam
cd Persistent-Web-Annotator-Azam
```

### Step 2: Install Dependencies

```bash
npm install
```

### Step 3: Build the Extension

```bash
npm run build
```

This creates a dist folder containing the compiled extension files.

### Step 4: Load in Chrome

1. Open Chrome and navigate to chrome://extensions/

2. Enable Developer mode (toggle in top-right corner)

3. Click "Load unpacked"

4. Select the `dist` folder from your project

5. The Persistent Annotator extension should now appear in your extensions list

### Step 5: Verify Installation

- You should see the ContextMemo icon in your browser toolbar

- Right-click on any selected text to see "Add ContextMemo" in the context menu

## Usage Instructions

### Adding a Note

1. Select text on any webpage
2. Right-click and choose "Add ContextMemo"
3. Enter your note (4-16 characters)
4. Click Save

### Viewing Notes

1. Click the Persistent Annotator extension icon
   - Sidebar: View notes from all pages
2. View notes for current page

3. Toggle "Show All" to see notes from all pages

4. Search by URL, note content, or selected text

### Managing Notes

- Delete: Click trash icon next to any note

- Export: Click download button to export as JSON

- Navigate: Click URL to open original page

## DOM Selection & Anchoring Strategy

### Hybrid Locator System

The extension uses a **dual-anchor approach** to reliably locate text selections even when the DOM changes:

#### 1. CSS Path (Structural Anchor)

```typescript
// Generates a CSS selector path to the element containing the selection
// Example: div.container > div.content > p:nth-of-type(2)
function generateCssPath(el: Element): string {
  // Walks up DOM tree, using IDs when available
  // Falls back to :nth-of-type() for sibling positioning
}
```

#### 2. Text Range Snapshot (Content Anchor)

```typescript
interface TextSnippet {
  before: string // 30 chars before selection
  selected: string // The actual selected text
  after: string // 30 chars after selection
}
```

#### 3. Fallback Recovery Strategy

When restoring highlights:

```typescript
// Primary attempt: Use CSS path
let el = document.querySelector(locator.cssPath)

// Fallback: Search by text context if CSS fails
if (!el) {
  const contextString = before + selected + after
  // Scan all text elements for matching content
}
```

#### 4. Text Node Precision

The system walks through text nodes to apply highlights exactly where needed:

```typescript
const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT)
// Calculates exact character offsets within text nodes
// Wraps selected text in <span> with highlighting
```

## Data Structure & Storage

### Note Object Schema

```typescript
interface Note {
  id: string // Unique identifier (crypto.randomUUID())
  url: string // Page URL where note was created
  content: string // User's note text (4-16 chars limit)
  domLocator: string // JSON string of HybridLocator
  createdAt: number // Timestamp (Date.now())
}

interface HybridLocator {
  cssPath: string // CSS selector path
  textSnippet: {
    before: string // Context before selection
    selected: string // Selected text
    after: string // Context after selection
  }
}
```

### Storage Mechanism

```typescript
// All notes stored in chrome.storage.local
chrome.storage.local.set({ notes: Note[] });

// Storage limits:
// - chrome.storage.local: Up to 10MB
// - No quota management needed for typical usage
```

### Data Flow

1. Creation:

```text
User selects text → Right-click → Context menu →
Generate locator → Open editor → Save to storage
```

2. Note Retrieval:

```text
Page loads → Query storage → Filter by URL →
Parse locators → Restore highlights
```

3. Deletion:

```text
Delete in popup → Remove from storage →
Send message to content script → Remove highlight
```

### Persistence Features

- Automatic restoration: Highlights reappear when revisiting pages

- Cross-session persistence: Notes survive browser restarts

- URL-based filtering: Default view shows current page notes only

- Export capability: Notes can be exported as JSON

### Key Components

1. Service Worker (Background Script)
   - Manages context menu
   - Coordinates messages between popup and content scripts
   - Listens for storage changes

2. Content Script (content/App.tsx)
   - Injected into every page
   - Handles text selection and DOM manipulation
   - Restores highlights on page load
   - Manages note editor overlay

3. Popup (NotesList.tsx)
   - Displays filtered notes
   - Provides search and export functionality
   - Handles note deletion
4. Sidebar (NotesList.tsx)
   - Displays filtered notes
   - Provides search and export functionality
   - Handles note deletion

5. Helper Functions
   - generateHybridLocator(): Creates dual-anchor locators
   - restoreHighlight(): Reapplies styles to saved selections
   - applyStyleToDomLocator(): Handles styling with Tailwind/inline fallback

## Documentation

- [React Documentation](https://reactjs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [CRXJS Documentation](https://crxjs.dev/vite-plugin)
- [TailwindCSS Documentation](https://tailwindcss.com/)
- [Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/mv3/manifest/)
