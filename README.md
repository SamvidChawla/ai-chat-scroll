# AI Chat Scroll (v0.3)

AI Chat Scroll is a browser extension that allows users to bookmark specific DOM elements on any webpage and later scroll back to them.
Bookmarks are stored locally and scoped per page.
It is especially useful for ChatGPT , Gemini and other such conversational AI websites
---

## Features

- Bookmark any element using right-click
- Scroll back to bookmarked elements
- Works inside iframes
- Visual toast notification on save
- Per-page bookmark isolation
- No backend, no network usage

---

## Browser Support

- Google Chrome
- Microsoft Edge
- Most Chromium-based browser supporting Manifest V3

---

## Installation (Developer Mode)

1. Clone or download this repository
2. Open your browser and navigate to:
3. Enable **Developer Mode**
4. Click **Load unpacked**
5. Select the project root directory

The extension icon will appear in the toolbar.

---

## Usage

### Bookmark an Element

1. Open any webpage
2. Right-click on the element you want to save
3. Click **Bookmark this element**
4. A toast notification confirms the bookmark

---

### Jump to a Bookmark

1. Click the extension icon
2. Click a bookmark from the list
3. The page scrolls to the saved element and highlights it

---

### Delete a Bookmark

- Click the **×** button next to a bookmark in the popup

---

## How Bookmarks Work

Each bookmark stores:
- A generated CSS selector for the element
- A text snapshot of the element
- A timestamp ID

When scrolling:
1. The extension first tries to locate the element using the selector
2. If that fails, it falls back to text matching
3. If still not found, the bookmark is considered stale

---

## Project Structure

```
AI-Chat-Scroll/
├── manifest.json
├── background.js
├── popup.html
├── popup.js
├── storage/
│ └── storage.js
└── content/
  └── observer.js
```

---

## Permissions Used

| Permission     | Reason                                      |
|---------------|---------------------------------------------|
| `storage`     | Save bookmarks locally                      |
| `contextMenus`| Add right-click menu option                 |
| `activeTab`   | Interact with the current tab               |

---

## Notes

- Bookmarks are stored **per URL path**
- Bookmarks may become invalid if the page structure changes
- Restricted pages (`chrome://`, `edge://`) are not supported

---

## Disclaimer

This extension is provided on an **“as is”** basis, without warranties or guarantees of any kind.

It is shared as a **portfolio and demonstration project** to showcase browser extension development concepts. The author makes no claims regarding suitability for production environments and assumes no responsibility for issues arising from its use.

Use at your own discretion.
