// this runs in the background it checks for context when the user right clicks
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "add-contextmemo",
    title: "Add ContextMemo",
    contexts: ["selection"], //only when user selects text
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "add-contextmemo" && tab?.id) {
    chrome.tabs.sendMessage(tab.id, {
      type: "OPEN_EDITOR_AT_SELECTION",
      selection: info.selectionText,
    });
    console.log("memo clicked");
  }
});
