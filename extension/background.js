
// background.js
// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("CarbonVoid Gmail Monitor Extension Installed");
  // Initialize any default storage values if needed
  chrome.storage.local.set({ 
    unreadCount: 0, 
    lastUpdated: null,
    goal: 20,
    autoRefresh: true,
    darkMode: false,
    periodicCheckingEnabled: false
  });
});

// Function to get unread email count with retry capability
async function getUnreadCount(retry = true) {
  return new Promise((resolve, reject) => {
    chrome.identity.getAuthToken({ interactive: false }, async (token) => {
      // Handle OAuth2 not granted or revoked error
      if (chrome.runtime.lastError) {
        const errorMsg = chrome.runtime.lastError.message;
        if (errorMsg && (errorMsg.includes("OAuth2 not granted") || errorMsg.includes("revoked") || errorMsg.includes("access_denied"))) {
          return reject(new Error("Authentication required. Please sign in again."));
        }
        return reject(chrome.runtime.lastError);
      }
      
      if (!token) {
        return reject(new Error("No auth token available"));
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
          if (response.status === 401 || response.status === 403) {
            chrome.identity.removeCachedAuthToken({ token: token });
            // Retry once if this was the first attempt
            if (retry) {
              console.log("Auth token invalid, retrying with new token...");
              return getUnreadCount(false)
                .then(resolve)
                .catch(reject);
            }
          }
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
        
        const data = await response.json();
        const count = data.resultSizeEstimate || 0;
        
        // Store the count for later use
        chrome.storage.local.set({ 
          unreadCount: count, 
          lastUpdated: Date.now() 
        });
        
        resolve(count);
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
      // Handle OAuth2 not granted or revoked error silently
      if (chrome.runtime.lastError) {
        const errorMsg = chrome.runtime.lastError.message;
        if (errorMsg && (errorMsg.includes("OAuth2 not granted") || errorMsg.includes("revoked") || errorMsg.includes("access_denied"))) {
          return resolve(false);
        }
      }
      resolve(!!token && !chrome.runtime.lastError);
    });
  });
}

// Authenticate user
function authenticate() {
  return new Promise((resolve) => {
    chrome.identity.getAuthToken({ interactive: true }, (token) => {
      // Handle OAuth2 not granted or revoked error specifically
      if (chrome.runtime.lastError) {
        const errorMsg = chrome.runtime.lastError.message;
        if (errorMsg && (errorMsg.includes("OAuth2 not granted") || errorMsg.includes("revoked") || errorMsg.includes("access_denied"))) {
          return resolve({ 
            success: false, 
            error: "Authentication was canceled or access was revoked. Please check your Google Cloud Console settings." 
          });
        }
        return resolve({ 
          success: false, 
          error: chrome.runtime.lastError.message || "Authentication failed" 
        });
      }
      
      if (!token) {
        return resolve({ 
          success: false, 
          error: "No authentication token received" 
        });
      }
      
      resolve({ success: true });
    });
  });
}

// Periodically check for new emails (optional)
const CHECK_INTERVAL = 5 * 60 * 1000; // 5 minutes
let checkIntervalId = null;

function startPeriodicChecking() {
  if (!checkIntervalId) {
    checkIntervalId = setInterval(() => {
      getUnreadCount().catch(err => {
        console.log("Periodic check failed:", err.message);
      });
    }, CHECK_INTERVAL);
    
    // Store that periodic checking is enabled
    chrome.storage.local.set({ periodicCheckingEnabled: true });
  }
}

function stopPeriodicChecking() {
  if (checkIntervalId) {
    clearInterval(checkIntervalId);
    checkIntervalId = null;
    
    // Store that periodic checking is disabled
    chrome.storage.local.set({ periodicCheckingEnabled: false });
  }
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "getUnreadCount") {
    getUnreadCount()
      .then((count) => sendResponse({ count }))
      .catch((err) => {
        console.error("Error getting unread count:", err);
        sendResponse({ error: err.message || "Unknown error" });
      });
    return true; // keep channel open for async response
  }
  
  if (request.type === "checkAuthStatus") {
    checkAuthStatus()
      .then((authenticated) => sendResponse({ authenticated }))
      .catch(() => sendResponse({ authenticated: false }));
    return true;
  }
  
  if (request.type === "authenticate") {
    authenticate()
      .then((result) => sendResponse(result))
      .catch((error) => sendResponse({ 
        success: false, 
        error: error.message || "Authentication failed" 
      }));
    return true;
  }
  
  if (request.type === "startPeriodicChecking") {
    startPeriodicChecking();
    sendResponse({ success: true });
    return true;
  }
  
  if (request.type === "stopPeriodicChecking") {
    stopPeriodicChecking();
    sendResponse({ success: true });
    return true;
  }
});

// Optional: Listen for browser startup to resume periodic checking
chrome.runtime.onStartup.addListener(() => {
  // Restore periodic checking if it was enabled
  chrome.storage.local.get(['periodicCheckingEnabled'], (result) => {
    if (result && result.periodicCheckingEnabled) {
      startPeriodicChecking();
    }
  });
});

// Optional: Listen for storage changes to update badge
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local' && changes.unreadCount) {
    const unreadCount = changes.unreadCount.newValue;
    // Update extension badge with unread count
    if (unreadCount > 0) {
      chrome.action.setBadgeText({ text: unreadCount.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' }); // Red color for badge
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  }
});

// Initialize badge on extension load - FIXED THE ERROR HERE
chrome.storage.local.get(['unreadCount'], (result) => {
  // Check if result exists and has unreadCount property
  if (result && result.unreadCount > 0) {
    chrome.action.setBadgeText({ text: result.unreadCount.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
  }
});