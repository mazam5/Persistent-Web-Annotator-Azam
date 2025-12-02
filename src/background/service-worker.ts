// Create context menu on install
// this runs in the background it checks for context when the user right clicks
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "add-contextmemo",
    title: "Add ContextMemo",
    contexts: ["selection"], //only when user selects text
  });
});

// When user clicks "Add ContextMemo"
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "add-contextmemo" && tab?.id) {
    // first: Ask content script to get DOM location
    chrome.tabs.sendMessage(tab.id, {
      type: "REQUEST_SELECTION_CONTEXT",
      selectedText: info.selectionText,
    });
  }
});

// Receive DOM locator from content script (App.tsx)
chrome.runtime.onMessage.addListener((msg, sender) => {
  if (msg.type === "SELECTION_CONTEXT_RESULT" && sender.tab?.id) {
    // second: Forward data to the React content script (App.tsx)
    chrome.tabs.sendMessage(sender.tab.id, {
      type: "OPEN_EDITOR_AT_SELECTION",
      selection: msg.selectedText,
      domPath: msg.domPath,
    });
  }
});
