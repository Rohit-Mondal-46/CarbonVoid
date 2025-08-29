
// background.js - Fixed version
chrome.action.onClicked.addListener(() => {
  // Get the current window first, then open the sidepanel
  chrome.windows.getCurrent((window) => {
    if (window && window.id) {
      chrome.sidePanel.open({ windowId: window.id });
    } else {
      // Fallback: try to open without specifying windowId
      chrome.sidePanel.open();
    }
  });
});

// Alternative approach using chrome.tabs.getCurrent
chrome.action.onClicked.addListener(() => {
  chrome.tabs.getCurrent((tab) => {
    if (tab && tab.windowId) {
      chrome.sidePanel.open({ windowId: tab.windowId });
    } else {
      // Fallback: try to open without specifying windowId
      chrome.sidePanel.open();
    }
  });
});

// Even simpler approach that should work in most cases
chrome.action.onClicked.addListener(() => {
  try {
    chrome.sidePanel.open();
  } catch (error) {
    console.log("Error opening sidepanel:", error);
    // Fallback: open options page or show notification
    chrome.runtime.openOptionsPage();
  }
});

// Listen for extension installation
chrome.runtime.onInstalled.addListener(() => {
  console.log("CarbonVoid Digital Footprint Monitor Extension Installed");
  // Initialize any default storage values if needed
  chrome.storage.local.set({ 
    unreadCount: 0, 
    lastUpdated: null,
    goal: 20,
    autoRefresh: true,
    darkMode: false,
    periodicCheckingEnabled: false,
    streamingStats: {
      streamingEnergy: 0,
      streamingCarbon: 0,
      callEnergy: 0,
      callCarbon: 0,
      totalMinutes: 0,
      dailySessions: 0,
      sessions: [] // Added missing sessions array
    }
  });
});

// Streaming monitoring class
class StreamingTracker {
  constructor() {
    this.activeSessions = new Map();
    this.dailyStats = {
      streamingEnergy: 0,
      streamingCarbon: 0,
      callEnergy: 0,
      callCarbon: 0,
      totalMinutes: 0,
      dailySessions: 0,
      sessions: [] // Added missing sessions array
    };
    
    this.loadDailyStats();
    this.setupTabMonitoring();
  }

  async loadDailyStats() {
    try {
      const data = await chrome.storage.local.get(['streamingStats']);
      if (data.streamingStats) {
        this.dailyStats = { ...this.dailyStats, ...data.streamingStats };
        // Ensure sessions array exists
        if (!this.dailyStats.sessions) {
          this.dailyStats.sessions = [];
        }
      }
    } catch (error) {
      console.error('Error loading streaming stats:', error);
    }
  }

  async saveDailyStats() {
    try {
      await chrome.storage.local.set({ streamingStats: this.dailyStats });
    } catch (error) {
      console.error('Error saving streaming stats:', error);
    }
  }

  startSession(tabId, platform, startTime) {
    this.activeSessions.set(tabId, {
      platform,
      startTime,
      tabId,
      isCall: ['zoom', 'teams', 'google_meet', 'webex', 'meet'].includes(platform)
    });
    
    console.log(`CarbonVoid: Started monitoring ${platform} in tab ${tabId}`);
  }

  async endSession(tabId, data) {
    const session = this.activeSessions.get(tabId);
    if (!session) return;

    this.activeSessions.delete(tabId);
    
    // Update daily stats
    this.dailyStats.totalMinutes += data.duration;
    this.dailyStats.dailySessions += 1;
    
    if (session.isCall) {
      this.dailyStats.callEnergy += data.energy;
      this.dailyStats.callCarbon += data.carbon;
    } else {
      this.dailyStats.streamingEnergy += data.energy;
      this.dailyStats.streamingCarbon += data.carbon;
    }

    // Add to sessions history
    this.dailyStats.sessions.push({
      platform: session.platform,
      duration: data.duration,
      energy: data.energy,
      carbon: data.carbon,
      endTime: Date.now(),
      isCall: session.isCall
    });

    await this.saveDailyStats();
    
    // Send update to popup if open
    try {
      await chrome.runtime.sendMessage({
        type: 'streamingUpdate',
        stats: this.dailyStats
      });
    } catch (error) {
      // Ignore if no popup open
    }
  }

  getActiveSessions() {
    return Array.from(this.activeSessions.entries()).map(([tabId, session]) => ({
      tabId,
      platform: session.platform,
      duration: (Date.now() - session.startTime) / 60000,
      isCall: session.isCall
    }));
  }

  getSuggestions() {
    const suggestions = [];
    const totalCarbon = this.dailyStats.callCarbon + this.dailyStats.streamingCarbon;
    
    if (this.dailyStats.callCarbon > 1000) { // More than 1kg CO2
      suggestions.push({
        type: 'audio_only',
        message: 'Consider audio-only calls for meetings when video isn\'t essential',
        potentialSavings: Math.round(this.dailyStats.callCarbon * 0.8), // 80% reduction
        icon: '🎧'
      });
    }
    
    if (this.dailyStats.streamingCarbon > 2000) { // More than 2kg CO2
      suggestions.push({
        type: 'streaming_quality',
        message: 'Try lowering video quality when watching streaming content',
        potentialSavings: Math.round(this.dailyStats.streamingCarbon * 0.4), // 40% reduction
        icon: '📺'
      });
    }

    if (totalCarbon > 3000 && this.dailyStats.dailySessions > 5) {
      suggestions.push({
        type: 'break_time',
        message: 'Take regular breaks from screen time to reduce energy consumption',
        potentialSavings: Math.round(totalCarbon * 0.2), // 20% reduction
        icon: '⏰'
      });
    }

    return suggestions;
  }

  setupTabMonitoring() {
    // Monitor tab closures
    chrome.tabs.onRemoved.addListener((tabId) => {
      if (this.activeSessions.has(tabId)) {
        const session = this.activeSessions.get(tabId);
        const duration = (Date.now() - session.startTime) / 60000;
        const impact = this.calculateImpact(duration, session.platform);
        
        this.endSession(tabId, {
          duration: duration,
          energy: impact.energyConsumption,
          carbon: impact.carbonEmissions,
          platform: session.platform
        });
      }
    });

    // Monitor tab navigation
    chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
      if (changeInfo.status === 'loading' && this.activeSessions.has(tabId)) {
        const session = this.activeSessions.get(tabId);
        const duration = (Date.now() - session.startTime) / 60000;
        const impact = this.calculateImpact(duration, session.platform);
        
        this.endSession(tabId, {
          duration: duration,
          energy: impact.energyConsumption,
          carbon: impact.carbonEmissions,
          platform: session.platform
        });
      }
    });
  }

  calculateImpact(durationMinutes, platform) {
    // Carbon impact factors (kWh per hour)
    const factors = {
      youtube: 0.08,    // 80Wh per hour for 720p
      netflix: 0.12,    // 120Wh per hour for HD
      zoom: 0.15,       // 150Wh per hour for video call
      teams: 0.16,      // 160Wh per hour
      meet: 0.14,       // 140Wh per hour
      google_meet: 0.14,// 140Wh per hour
      webex: 0.15,      // 150Wh per hour
      unknown: 0.10     // Default
    };

    const hours = durationMinutes / 60;
    const energyConsumption = hours * (factors[platform] || factors.unknown);
    
    // Convert to carbon (average grid: 0.475 kgCO2/kWh)
    const carbonEmissions = energyConsumption * 475; // Convert to grams
    
    return { energyConsumption, carbonEmissions };
  }
}

// Initialize streaming tracker
const streamingTracker = new StreamingTracker();

// Function to get unread email count with retry capability
// Function to get Gmail unread count
async function getUnreadCount(retry = true) {
  try {
    // Get the stored access token
    const result = await chrome.storage.local.get(['accessToken']);
    
    if (!result.accessToken) {
      throw new Error('No access token available - please sign in again');
    }

    // Get Gmail access token from our backend using our stored token
    const tokenResponse = await fetch(`${API_BASE_URL}/api/auth/gmail-token`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${result.accessToken}`
      }
    });

    if (!tokenResponse.ok) {
      if (tokenResponse.status === 401 && retry) {
        // Our token might be expired, clear stored data and ask user to re-authenticate
        await chrome.storage.local.remove(['authenticated', 'accessToken', 'user']);
        throw new Error("Session expired. Please sign in again.");
      }
      throw new Error("Failed to get Gmail access token");
    }

    const tokenData = await tokenResponse.json();
    const gmailAccessToken = tokenData.gmailAccessToken;

    // Use the Gmail token to call Gmail API
    const response = await fetch(
      "https://www.googleapis.com/gmail/v1/users/me/messages?q=is:unread",
      {
        headers: {
          Authorization: "Bearer " + gmailAccessToken,
        },
      }
    );
    
    if (!response.ok) {
      if (response.status === 401 || response.status === 403) {
        if (retry) {
          console.log("Gmail token invalid, retrying...");
          return getUnreadCount(false);
        }
      }
      throw new Error(`Gmail API error: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    const count = data.resultSizeEstimate || 0;
    
    // Store the count for later use
    chrome.storage.local.set({ 
      unreadCount: count, 
      lastUpdated: Date.now() 
    });
    
    return count;
  } catch (error) {
    console.error('Error getting unread count:', error);
    throw error;
  }
}

// Check if user is authenticated
// Function to check if user is authenticated with our backend
async function checkAuthStatus() {
  try {
    // Check if we have stored user info and token in extension storage
    const result = await chrome.storage.local.get(['authenticated', 'accessToken', 'user']);
    
    if (result.authenticated && result.accessToken && result.user) {
      // Verify the token is still valid
      const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${result.accessToken}`
        }
      });
      
      if (response.ok) {
        return { authenticated: true, user: result.user };
      } else {
        // Token is invalid, clear stored data
        await chrome.storage.local.remove(['authenticated', 'accessToken', 'user']);
        return { authenticated: false };
      }
    } else {
      return { authenticated: false };
    }
  } catch (error) {
    console.error('Auth check failed:', error);
    return { authenticated: false };
  }
}

// Authenticate user
const API_BASE_URL = 'http://localhost:3000';

function authenticate() {
  return new Promise((resolve) => {
    // Open OAuth flow in a new tab with extension state parameter
    const authUrl = `${API_BASE_URL}/api/auth/google?state=extension_auth`;
    
    chrome.tabs.create({ 
      url: authUrl,
      active: true 
    }, (tab) => {
      const tabId = tab.id;
      
      // Listen for the tab to navigate to our callback URL
      const onUpdated = (updatedTabId, changeInfo, updatedTab) => {
        if (updatedTabId === tabId && changeInfo.url) {
          // Check if we've completed the OAuth flow (reached dashboard or auth success)
          if (changeInfo.url.includes('/dashboard') || 
              changeInfo.url.includes('auth=success') ||
              changeInfo.url.includes('/extension-auth.html')) {
            
            // Remove the tab update listener
            chrome.tabs.onUpdated.removeListener(onUpdated);
            chrome.tabs.onRemoved.removeListener(onRemoved);
            
            // Close the auth tab
            chrome.tabs.remove(tabId);
            
            // Now fetch the auth data from our backend using cookies
            fetchAuthDataFromBackend()
              .then((authData) => {
                if (authData.success) {
                  // Store authentication data in extension storage
                  chrome.storage.local.set({
                    authenticated: true,
                    user: authData.user,
                    accessToken: authData.accessToken
                  }).then(() => {
                    resolve({ success: true });
                  }).catch((error) => {
                    console.error('Error storing auth data:', error);
                    resolve({ success: false, error: 'Failed to store authentication data' });
                  });
                } else {
                  resolve({ success: false, error: authData.error || 'Authentication failed' });
                }
              })
              .catch((error) => {
                console.error('Error fetching auth data:', error);
                resolve({ success: false, error: 'Failed to retrieve authentication data' });
              });
          }
        }
      };
      
      chrome.tabs.onUpdated.addListener(onUpdated);
      
      // Handle tab closure (user canceled)
      const onRemoved = (removedTabId) => {
        if (removedTabId === tabId) {
          chrome.tabs.onUpdated.removeListener(onUpdated);
          chrome.tabs.onRemoved.removeListener(onRemoved);
          resolve({ success: false, error: 'Authentication was canceled' });
        }
      };
      
      chrome.tabs.onRemoved.addListener(onRemoved);
    });
  });
}

// Helper function to fetch auth data from backend after OAuth completion
async function fetchAuthDataFromBackend() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/auth/extension-auth`, {
      method: 'GET',
      credentials: 'include' // Include cookies from the OAuth flow
    });
    
    if (response.ok) {
      const data = await response.json();
      return {
        success: true,
        user: data.user,
        accessToken: data.accessToken
      };
    } else {
      return {
        success: false,
        error: 'Failed to get authentication data'
      };
    }
  } catch (error) {
    console.error('Error fetching auth data:', error);
    return {
      success: false,
      error: 'Network error while fetching authentication data'
    };
  }
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

// Reset daily stats at midnight
function scheduleDailyReset() {
  const now = new Date();
  const midnight = new Date(now);
  midnight.setHours(24, 0, 0, 0);
  
  const timeUntilMidnight = midnight - now;
  
  setTimeout(() => {
    streamingTracker.dailyStats = {
      streamingEnergy: 0,
      streamingCarbon: 0,
      callEnergy: 0,
      callCarbon: 0,
      totalMinutes: 0,
      dailySessions: 0,
      sessions: [] // Ensure sessions array is included
    };
    streamingTracker.saveDailyStats();
    scheduleDailyReset();
    
    // Notify popup about reset
    chrome.runtime.sendMessage({
      type: 'dailyStatsReset'
    }).catch(() => {}); // Ignore if no popup open
    
  }, timeUntilMidnight);
}

// Start the daily reset scheduler
scheduleDailyReset();

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Email-related messages
  if (request.type === "getUnreadCount") {
    getUnreadCount()
      .then((count) => sendResponse({ count }))
      .catch((err) => {
        console.error("Error getting unread count:", err);
        sendResponse({ error: err.message || "Unknown error" });
      });
    return true;
  }
  
  if (request.type === "checkAuthStatus") {
    checkAuthStatus()
      .then((result) => sendResponse(result))
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
  
  // Streaming-related messages
  if (request.type === "getStreamingStats") {
    sendResponse({
      stats: streamingTracker.dailyStats,
      suggestions: streamingTracker.getSuggestions(),
      activeSessions: streamingTracker.getActiveSessions()
    });
    return true;
  }
  
  if (request.type === "streamingStarted") {
    streamingTracker.startSession(sender.tab.id, request.platform, request.startTime);
    sendResponse({ success: true });
    return true;
  }
  
  if (request.type === "streamingEnded") {
    const impact = streamingTracker.calculateImpact(request.duration, request.platform);
    streamingTracker.endSession(sender.tab.id, {
      ...request,
      ...impact
    });
    sendResponse({ success: true });
    return true;
  }
  
  if (request.type === "suggestAudioOnly") {
    // Send message to content script to show audio suggestion
    chrome.tabs.sendMessage(sender.tab.id, {
      type: 'showAudioSuggestion'
    }).catch(() => {
      // Ignore if content script isn't loaded
    });
    sendResponse({ success: true });
    return true;
  }

  // New message type for getting active session
  if (request.type === "getActiveSession") {
    const activeSessions = streamingTracker.getActiveSessions();
    const activeSession = activeSessions.find(session => session.tabId === sender.tab.id);
    sendResponse({ 
      active: !!activeSession,
      session: activeSession 
    });
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

// Initialize badge on extension load
chrome.storage.local.get(['unreadCount'], (result) => {
  // Check if result exists and has unreadCount property
  if (result && result.unreadCount > 0) {
    chrome.action.setBadgeText({ text: result.unreadCount.toString() });
    chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
  }
});

// Monitor tab activity for streaming platforms
const STREAMING_PLATFORMS = [
  'youtube.com',
  'netflix.com',
  'zoom.us',
  'teams.microsoft.com',
  'meet.google.com',
  'webex.com'
];

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    const url = new URL(tab.url);
    const isStreamingPlatform = STREAMING_PLATFORMS.some(platform => 
      url.hostname.includes(platform)
    );
    
    if (isStreamingPlatform && !streamingTracker.activeSessions.has(tabId)) {
      // Give the page time to load before starting monitoring
      setTimeout(() => {
        const platform = STREAMING_PLATFORMS.find(p => url.hostname.includes(p));
        const platformName = platform.replace('.com', '').replace('.us', '').replace('microsoft.', '').replace('google.', '');
        streamingTracker.startSession(tabId, platformName, Date.now());
      }, 3000);
    }
  }
});

// Handle tab activation (switch between tabs)
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab.url) {
      const url = new URL(tab.url);
      const isStreamingPlatform = STREAMING_PLATFORMS.some(platform => 
        url.hostname.includes(platform)
      );
      
      if (isStreamingPlatform && !streamingTracker.activeSessions.has(activeInfo.tabId)) {
        const platform = STREAMING_PLATFORMS.find(p => url.hostname.includes(p));
        const platformName = platform.replace('.com', '').replace('.us', '').replace('microsoft.', '').replace('google.', '');
        streamingTracker.startSession(activeInfo.tabId, platformName, Date.now());
      }
    }
  });
});

console.log('CarbonVoid background script loaded with streaming monitoring');