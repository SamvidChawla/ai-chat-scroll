const listEl = document.getElementById("bookmark-list");

// 1. Identify Context
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentTab = tabs[0];
  
  // Guard: Restricted pages (chrome://)
  if (!currentTab?.url) {
    listEl.innerHTML = "<li style='text-align:center;color:#666'>Cannot use on this page</li>";
    return;
  }

  const urlObj = new URL(currentTab.url);
  const key = urlObj.origin + urlObj.pathname;

  // 2. Load
  loadBookmarks(key, (bookmarks) => {
    if (!bookmarks || !bookmarks.length) {
      listEl.innerHTML = "<li style='text-align:center;color:#666'>No bookmarks yet.</li>";
      return;
    }

    // 3. Render
    bookmarks.forEach(b => {
      const li = document.createElement("li");
      
      // Label
      const span = document.createElement("span");
      span.textContent = b.text;
      span.title = b.fullText; // Tooltip
      
      span.addEventListener("click", () => {
        // Send scroll request to all frames in tab (browser handles routing usually)
        chrome.tabs.sendMessage(currentTab.id, { 
          action: "scroll-to-element", 
          selector: b.selector,
          fullText: b.fullText 
        }, (response) => {
          
          if (chrome.runtime.lastError) {
             console.error("Link error:", chrome.runtime.lastError.message);
             return;
          }

          if (response?.status === "missing") {
            if (confirm("Element not found (page changed?). Delete bookmark?")) {
              deleteBookmark(b.id, key);
              li.remove();
            }
          }
        });
      });

      li.appendChild(span);

      const delBtn = document.createElement("button");
      delBtn.innerHTML = "&times;";
      delBtn.className = "del-btn";
      delBtn.title = "Remove";
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        deleteBookmark(b.id, key);
        li.remove();
        if (listEl.children.length === 0) listEl.innerHTML = "<li style='text-align:center;color:#666'>No bookmarks yet.</li>";
      });

      li.appendChild(delBtn);
      listEl.appendChild(li);
    });
  });
});