// Assign IDs on click if missing (helps persist ID if user clicked it before)
document.addEventListener("contextmenu", (e) => {
  const el = e.target;
  if (!el.dataset.aiId) el.dataset.aiId = `${Date.now()}-${Math.random()}`;
}, true); // Use capture to ensure we get it before the menu opens

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  
  if (msg.action === "bookmark-element") {

    let el = document.activeElement; 
    
    if (!el) return;
    if (!el.dataset.aiId) el.dataset.aiId = `${Date.now()}-${Math.random()}`;

    const key = location.origin + location.pathname;
    const id = el.dataset.aiId;

    const text = (el.innerText || "").slice(0, 50).replace(/\s+/g, ' ').trim() || "No text content";

    chrome.storage.local.get({ bookmarks: {} }, (data) => {
      const bookmarks = data.bookmarks;
      if (!bookmarks[key]) bookmarks[key] = [];
      
      // Avoid duplicates
      if (!bookmarks[key].some(b => b.id === id)) {
        bookmarks[key].push({ id, text });
      }
      
      chrome.storage.local.set({ bookmarks });
    });
  }

  if (msg.action === "scroll-to-element") {
    const node = document.querySelector(`[data-ai-id='${msg.id}']`);
    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });

      node.style.outline = "2px solid red";
      setTimeout(() => node.style.outline = "", 2000);
    } else {
      console.warn("Element with AI ID not found on this page.");
    }
  }
});