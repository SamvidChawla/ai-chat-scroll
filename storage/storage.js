function loadBookmarks(key, callback) {
  chrome.storage.local.get({ bookmarks: {} }, (data) => {
    callback(data.bookmarks[key] || []);
  });
}

function deleteBookmark(id, key) {
  chrome.storage.local.get({ bookmarks: {} }, (data) => {
    const bookmarks = data.bookmarks;
    if (bookmarks[key]) {
      bookmarks[key] = bookmarks[key].filter(b => b.id !== id);
      chrome.storage.local.set({ bookmarks });
    }
  });
}