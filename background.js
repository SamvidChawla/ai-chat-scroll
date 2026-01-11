// Create context menu on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "bookmark-element",
    title: "Bookmark this element",
    contexts: ["all"]
  });
});

// Handle context menu clicks
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  chrome.tabs.sendMessage(tab.id, { action: "bookmark-element" })
    .catch(err => {
      console.warn("Could not send message to content script:", err);
    });
});