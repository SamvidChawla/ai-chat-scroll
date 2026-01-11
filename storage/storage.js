function saveBookmark(id, url) {
  chrome.storage.local.get({ bookmarks: {} }, (data) => {
    const bookmarks = data.bookmarks;
    if (!bookmarks[url]) bookmarks[url] = [];
    if (!bookmarks[url].includes(id)) bookmarks[url].push(id);
    chrome.storage.local.set({ bookmarks });
  });
}

function loadBookmarks(url, callback) {
  chrome.storage.local.get({ bookmarks: {} }, (data) => {
    callback(data.bookmarks[url] || []);
  });
}

function deleteBookmark(id, url) {
  chrome.storage.local.get({ bookmarks: {} }, (data) => {
    const bookmarks = data.bookmarks;
    if (bookmarks[url]) {
      bookmarks[url] = bookmarks[url].filter(b => b !== id);
      chrome.storage.local.set({ bookmarks });
    }
  });
}
