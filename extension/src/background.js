chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    logBasicActivity(tab.url);
  }
});

function logBasicActivity(url) {
  const data = {
    url,
    timestamp: new Date().toISOString()
  };

  // Uncomment if you're ready to send it to a server
  // fetch("", {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json" },
  //   body: JSON.stringify(data)
  // }).then(res => console.log("Basic activity sent:", url));
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  console.log("[Background] Received message:", message);

  if (message.type === 'youtubeStats') {
    chrome.storage.local.set({ youtubeStats: message.data }, () => {
      console.log("[Background] YouTube stats saved.");
      sendResponse({ status: "success", saved: message.data });
    });
    return true; // Required for async response
  }
  
});
