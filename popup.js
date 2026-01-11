const listEl = document.getElementById("bookmark-list");

chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentTab = tabs[0];
  
  if (!currentTab || !currentTab.url) {
    listEl.innerHTML = "<li>Cannot access this page (restricted URL).</li>";
    return;
  }

  // key normalization: match the logic used in content/observer.js
  const urlObj = new URL(currentTab.url);
  const key = urlObj.origin + urlObj.pathname;

  // Fetch bookmarks specific to this page context
  loadBookmarks(key, (bookmarks) => {
    if (!bookmarks || !bookmarks.length) {
      listEl.innerHTML = "<li>No bookmarks for this page.</li>";
      return;
    }

    bookmarks.forEach(b => {
      const li = document.createElement("li");
      
      const span = document.createElement("span");
      span.textContent = b.text;
      span.title = "Jump to: " + b.text; // Tooltip for better UX
      
      span.addEventListener("click", () => {
        // Send navigation request to the Content Script
        // We pass both selector (primary) and fullText (fallback)
        chrome.tabs.sendMessage(currentTab.id, { 
          action: "scroll-to-element", 
          selector: b.selector,
          fullText: b.fullText 
        }, (response) => {
          
          // ERROR HANDLING: Connection Issues
          if (chrome.runtime.lastError) {
             console.error("Connection failed:", chrome.runtime.lastError.message);
             alert("Connection lost. Please refresh the web page and try again.");
             return;
          }

          // ERROR HANDLING: Element Missing
          // Content script couldn't find the node via selector OR text search.
          if (response && response.status === "missing") {
            const confirmDel = confirm(
              "Target not found.\n\nThe content may have been deleted or the page structure changed significantly.\n\nClean up this bookmark?"
            );
            
            if (confirmDel) {
              deleteBookmark(b.id, key);
              li.remove();
              if (listEl.children.length === 0) {
                 listEl.innerHTML = "<li>No bookmarks for this page.</li>";
              }
            }
          }
        });
      });

      li.appendChild(span);

      const delBtn = document.createElement("button");
      delBtn.innerHTML = "&times;"; // HTML Entity for 'multiplication sign' (cleaner X)
      delBtn.className = "del-btn";
      delBtn.title = "Delete bookmark";
      
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Critical: prevent bubbling to the <span> click handler (scroll)
        
        deleteBookmark(b.id, key);
        li.remove();
        
        // Re-check empty state after deletion
        if (listEl.children.length === 0) {
            listEl.innerHTML = "<li>No bookmarks for this page.</li>";
        }
      });

      li.appendChild(delBtn);
      listEl.appendChild(li);
    });
  });
});