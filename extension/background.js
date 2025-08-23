
// background.js

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("Gmail Unread Counter Extension Installed");
});

// Function to get unread email count
async function getUnreadCount() {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: true }, async (token) => {
      if (chrome.runtime.lastError || !token) {
        return reject(chrome.runtime.lastError);
      }

      try {
        const response = await fetch(
          "https://www.googleapis.com/gmail/v1/users/me/messages?q=is:unread",
          {
            headers: {
              Authorization: "Bearer " + token,
            },
          }
        );
        
        if (!response.ok) {
          // If we get an auth error, remove the invalid token
          if (response.status === 401) {
            chrome.identity.removeCachedAuthToken({ token: token });
          }
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        resolve(data.resultSizeEstimate || 0);
      } catch (err) {
        reject(err);
      }
    });
  });
}

// Check if user is authenticated
function checkAuthStatus() {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: false }, (token) => {
      resolve(!!token && !chrome.runtime.lastError);
    });
  });
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getUnreadCount") {
    getUnreadCount()
      .then((count) => sendResponse({ count }))
      .catch((err) => sendResponse({ error: err.message || "Unknown error" }));
    return true; // keep channel open for async response
  }
  
  if (request.type === "checkAuthStatus") {
    checkAuthStatus()
      .then((authenticated) => sendResponse({ authenticated }))
      .catch(() => sendResponse({ authenticated: false }));
    return true;
  }
});

