const listEl = document.getElementById("bookmark-list");

//URL of the ACTIVE TAB
chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
  const currentTab = tabs[0];
  if (!currentTab?.url) return;

  // Create the key
  const urlObj = new URL(currentTab.url);
  const key = urlObj.origin + urlObj.pathname;

  loadBookmarks(key, (bookmarks) => {
    if (!bookmarks || !bookmarks.length) {
      listEl.innerHTML = "<li>No bookmarks for this page.</li>";
      return;
    }

    bookmarks.forEach(b => {
      const li = document.createElement("li");
      
      const span = document.createElement("span");
      span.textContent = b.text;
      span.style.cursor = "pointer";
      span.style.fontWeight = "bold";
      
      span.addEventListener("click", () => {
        chrome.tabs.sendMessage(currentTab.id, { 
          action: "scroll-to-element", 
          id: b.id 
        });
      });

      li.appendChild(span);

      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", (e) => {
        e.stopPropagation(); // Prevent triggering the scroll
        deleteBookmark(b.id, key);
        li.remove();
        if (listEl.children.length === 0) {
            listEl.innerHTML = "<li>No bookmarks for this page.</li>";
        }
      });

      li.appendChild(delBtn);
      listEl.appendChild(li);
    });
  });
});