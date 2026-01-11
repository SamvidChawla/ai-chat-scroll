// --- STATE ---
let contextTarget = null;

document.addEventListener("contextmenu", (e) => {
  contextTarget = e.target;
}, true);

// --- HELPER: Visual Toast ---
function showToast(text) {
  const div = document.createElement("div");
  div.textContent = text;
  Object.assign(div.style, {
    position: "fixed", bottom: "20px", right: "20px", 
    background: "#22c55e", color: "#fff", padding: "10px 20px", 
    borderRadius: "8px", boxShadow: "0 4px 6px rgba(0,0,0,0.1)", 
    zIndex: "2147483647", fontSize: "14px", opacity: "0", transition: "opacity 0.3s"
  });
  document.body.appendChild(div);
  requestAnimationFrame(() => div.style.opacity = "1");
  setTimeout(() => { div.style.opacity = "0"; setTimeout(() => div.remove(), 300); }, 2000);
}

// --- HELPER: Selector ---
function generateSelector(el) {
  if (!el) return null;
  if (el.tagName.toLowerCase() === "html") return "html";
  const path = [];
  while (el.nodeType === Node.ELEMENT_NODE) {
    let selector = el.nodeName.toLowerCase();
    if (el.id) { selector += "#" + el.id; path.unshift(selector); break; } 
    else {
      let sib = el, nth = 1;
      while (sib = sib.previousElementSibling) { if (sib.nodeName.toLowerCase() == selector) nth++; }
      if (nth != 1) selector += `:nth-of-type(${nth})`;
    }
    path.unshift(selector);
    el = el.parentNode;
  }
  return path.join(" > ");
}

// --- MAIN LISTENER ---
chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {

  // 1. BOOKMARK
  if (msg.action === "bookmark-element") {
    const el = contextTarget || document.activeElement;
    if (!el) return;

    const key = location.origin + location.pathname;
    const selector = generateSelector(el);
    const rawText = el.innerText || el.textContent || "";
    const cleanText = rawText.slice(0, 50).replace(/\s+/g, ' ').trim() || "[No Text]";
    const fullText = rawText.trim();
    const timestamp = Date.now();

    chrome.storage.local.get({ bookmarks: {} }, (data) => {
      const bookmarks = data.bookmarks;
      if (!bookmarks[key]) bookmarks[key] = [];
      if (!bookmarks[key].some(b => b.selector === selector)) {
        bookmarks[key].push({ id: timestamp, selector, text: cleanText, fullText });
        chrome.storage.local.set({ bookmarks });
        showToast("Bookmark Saved! 🔖");
      } else {
        showToast("Already Bookmarked");
      }
    });
  }

  // 2. SCROLL
  if (msg.action === "scroll-to-element") {
    let node = null;
    
    // Search Strategies
    try { node = document.querySelector(msg.selector); } catch (e) {}
    if (!node && msg.fullText) {
      const allElements = document.getElementsByTagName("*");
      for (let el of allElements) {
        if (el.innerText === msg.fullText) { node = el; break; }
      }
    }

    if (node) {
      // --- SUCCESS CASE ---
      node.scrollIntoView({ behavior: "smooth", block: "center" });
      
      const originalOutline = node.style.outline;
      const originalTransition = node.style.transition;
      node.style.transition = "outline 0.3s";
      node.style.outline = "4px solid #facc15"; 
      
      setTimeout(() => {
        node.style.outline = originalOutline;
        node.style.transition = originalTransition;
      }, 1500);

      sendResponse({ status: "found" });
    } else {
      if (window !== window.top) {
        return; 
      }
      
      // Only the main page is allowed to report "missing"
      sendResponse({ status: "missing" });
    }
    return true; 
  }
});