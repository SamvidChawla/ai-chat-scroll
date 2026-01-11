chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "bookmark-element",
    title: "Bookmark this element",
    contexts: ["all"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (!tab?.id) return;

  // Send to the specific frame where the click happened (vital for iframes)
  // If frameId is missing, default to 0 (main frame)
  const targetFrame = info.frameId || 0;

  chrome.tabs.sendMessage(tab.id, { action: "bookmark-element" }, { frameId: targetFrame })
    .catch(err => {
      // Swallow error if content script isn't ready
      console.warn("Msg failed:", err);
    });
});