//HELPER: Generate a unique CSS selector
function generateSelector(el) {
  if (el.tagName.toLowerCase() === "html") return "HTML";
  const path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) {
      // If we find an ID, we can stop here as IDs are usually unique
      selector += "#" + el.id;
      path.unshift(selector);
      break; 
    } else {
      let sib = el, nth = 1;
      while (sib = sib.previousElementSibling) {
        if (sib.nodeName.toLowerCase() == selector) nth++;
      }
      if (nth != 1) selector += ":nth-of-type(" + nth + ")";
    }
    path.unshift(selector);
    el = el.parentNode;
  }
  return path.join(" > ");
}

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  // 1. HANDLE BOOKMARKING (Triggered by Context Menu)
  if (msg.action === "bookmark-element") {
    let el = document.activeElement;
    if (!el) return;

    const key = location.origin + location.pathname;
    
    // Create robust identifiers
    const selector = generateSelector(el);
    const cleanText = (el.innerText || "").slice(0, 50).replace(/\s+/g, ' ').trim() || "[No Text]";
    const fullText = (el.innerText || "").trim(); 
    const timestamp = Date.now();

    chrome.storage.local.get({ bookmarks: {} }, (data) => {
      const bookmarks = data.bookmarks;
      if (!bookmarks[key]) bookmarks[key] = [];

      // Avoid duplicates based on selector
      if (!bookmarks[key].some(b => b.selector === selector)) {
        bookmarks[key].push({ 
          id: timestamp,       // Unique ID for the bookmark entry
          selector: selector,  // CSS Path (Primary method)
          text: cleanText,     // Display text for Popup
          fullText: fullText   // Backup search text (Secondary method)
        });
      }
      chrome.storage.local.set({ bookmarks });
    });
  }

  // 2. HANDLE SCROLLING (Triggered by Popup)
  if (msg.action === "scroll-to-element") {
    let node = null;
    
    // Case A: CSS Selector 
    try {
      node = document.querySelector(msg.selector);
    } catch (e) { 
      console.log("Selector invalid, attempting text fallback..."); 
    }

    // Case B: Text Search Fallback (If DOM changed but content exists)
    // Useful for single-page apps (SPA) or chat logs that re-render
    if (!node && msg.fullText) {
      // Get all elements. Heavy on huge pages.
      const allElements = document.getElementsByTagName("*");
      for (let el of allElements) {
        // Strict match to ensure we don't jump to the wrong place
        if (el.innerText === msg.fullText) {
          node = el;
          break; 
        }
      }
    }

    if (node) {
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      
      node.style.transition = "outline 0.3s";
      const originalOutline = node.style.outline;
      node.style.outline = "4px solid #facc15"; 
      
      setTimeout(() => {
        node.style.outline = originalOutline;
      }, 1500);

      sendResponse({ status: "found" });
    } else {
      // Case C: Element is truly gone
      sendResponse({ status: "missing" });
    }
    return true; 
  }
});