const generateId = (() => {
  let counter = 0;
  return () => `ai-msg-${++counter}`;
})();

const observerCallback = (mutations) => {
  mutations.forEach((mutation) => {
    mutation.addedNodes.forEach((node) => {
      if (node.nodeType === Node.ELEMENT_NODE) {
        if (!node.dataset.aiId) {
          node.dataset.aiId = generateId();
          console.log("Node assigned ID:", node.dataset.aiId, node);
        }
      }
    });
  });
};

const targetNode = document.body;

const config = {
  childList: true,
  subtree: true
};

const observer = new MutationObserver(observerCallback);
observer.observe(targetNode, config);

