
// popup.js - Enhanced with streaming monitoring (FIXED VERSION)
// Global variables
let unreadCount = 0;
let goal = 20; // Daily goal for unread emails
let refreshInterval;
let isAuthenticated = false;

// Initialize streamingStats with proper structure
let streamingStats = {
  streamingEnergy: 0,
  streamingCarbon: 0,
  callEnergy: 0,
  callCarbon: 0,
  totalMinutes: 0,
  dailySessions: 0,
  sessions: [] // Added missing sessions array
};

let activeSessions = [];
let streamingUpdateInterval;

// Real-time streaming monitoring variables
let isMonitoring = false;
let currentSession = null;
let monitoringInterval = null;
let platformConfig = {
  youtube: { baseEnergy: 0.12, carbonFactor: 475, icon: '📺' },
  netflix: { baseEnergy: 0.15, carbonFactor: 475, icon: '🎬' },
  zoom: { baseEnergy: 0.18, carbonFactor: 475, icon: '💼' },
  teams: { baseEnergy: 0.20, carbonFactor: 475, icon: '🏢' },
  meet: { baseEnergy: 0.16, carbonFactor: 475, icon: '📹' },
  webex: { baseEnergy: 0.19, carbonFactor: 475, icon: '🔗' },
  default: { baseEnergy: 0.15, carbonFactor: 475, icon: '🎥' }
};

// DOM Content Loaded event
document.addEventListener('DOMContentLoaded', function() {
  initializeTabs();
  loadMockData();
  setupEventListeners();
  checkAuthStatus();
  loadSavedData();
  checkActiveSessions();
});

// Tab functionality
function initializeTabs() {
  const tabs = document.querySelectorAll('.tab');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      const tabId = tab.getAttribute('data-tab');
      
      // Update active tab
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      
      // Show active content
      tabContents.forEach(content => {
        content.classList.remove('active');
        if (content.id === `${tabId}Tab`) {
          content.classList.add('active');
        }
      });
    });
  });
}

// Mock data for demonstration
function loadMockData() {
  // Email data
  const unreadCountElement = document.getElementById('unreadCount');
  const carbonStatElement = document.getElementById('carbonStat');
  const emailProgressFill = document.getElementById('emailProgressFill');
  const emailProgressPercent = document.getElementById('emailProgressPercent');
  
  if (unreadCountElement) unreadCountElement.textContent = '42';
  if (carbonStatElement) carbonStatElement.textContent = '168g CO₂';
  if (emailProgressFill) emailProgressFill.style.width = '65%';
  if (emailProgressPercent) emailProgressPercent.textContent = '65%';
  
  // Streaming data
  const streamingMinutes = document.getElementById('streamingMinutes');
  const streamingEnergy = document.getElementById('streamingEnergy');
  const streamingCarbon = document.getElementById('streamingCarbon');
  const streamingProgressFill = document.getElementById('streamingProgressFill');
  const streamingProgressPercent = document.getElementById('streamingProgressPercent');
  
  if (streamingMinutes) streamingMinutes.textContent = '127';
  if (streamingEnergy) streamingEnergy.textContent = '0.42';
  if (streamingCarbon) streamingCarbon.textContent = '199g';
  if (streamingProgressFill) streamingProgressFill.style.width = '53%';
  if (streamingProgressPercent) streamingProgressPercent.textContent = '53%';
  
  // Dashboard data
  const totalCarbon = document.getElementById('totalCarbon');
  const emailCount = document.getElementById('emailCount');
  const streamingTime = document.getElementById('streamingTime');
  const progressFill = document.getElementById('progressFill');
  const progressPercent = document.getElementById('progressPercent');
  
  if (totalCarbon) totalCarbon.textContent = '367g';
  if (emailCount) emailCount.textContent = '42';
  if (streamingTime) streamingTime.textContent = '127m';
  if (progressFill) progressFill.style.width = '42%';
  if (progressPercent) progressPercent.textContent = '42%';
  
  // Update category badges
  document.querySelectorAll('.category-badge').forEach((badge, index) => {
    const counts = [15, 22, 8, 5, 2];
    if (badge) {
      badge.textContent = counts[index];
      
      // Color code based on count
      if (counts[index] > 15) {
        badge.style.background = '#fef2f2';
        badge.style.color = '#ef4444';
      } else if (counts[index] > 5) {
        badge.style.background = '#fffbeb';
        badge.style.color = '#f59e0b';
      } else {
        badge.style.background = '#f0fdf4';
        badge.style.color = '#10b981';
      }
    }
  });
}

// Set up event listeners
function setupEventListeners() {
  // Refresh buttons
  const refreshEmailBtn = document.getElementById('refreshEmailBtn');
  if (refreshEmailBtn) {
    refreshEmailBtn.addEventListener('click', function() {
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
      setTimeout(() => {
        loadMockData();
        this.innerHTML = '<i class="fas fa-sync"></i> Refresh Email Data';
      }, 1500);
    });
  }
  
  const refreshStreamingBtn = document.getElementById('refreshStreamingBtn');
  if (refreshStreamingBtn) {
    refreshStreamingBtn.addEventListener('click', function() {
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
      setTimeout(() => {
        loadMockData();
        this.innerHTML = '<i class="fas fa-sync"></i> Refresh Streaming Data';
      }, 1500);
    });
  }
  
  const refreshAllBtn = document.getElementById('refreshAllBtn');
  if (refreshAllBtn) {
    refreshAllBtn.addEventListener('click', function() {
      this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
      setTimeout(() => {
        loadMockData();
        this.innerHTML = '<i class="fas fa-sync-alt"></i> Refresh All Data';
      }, 1500);
    });
  }
  
  // Other button actions
  const viewReportBtn = document.getElementById('viewReportBtn');
  if (viewReportBtn) {
    viewReportBtn.addEventListener('click', function() {
      handleViewReport();
    });
  }
  
  const analyzeBtn = document.getElementById('analyzeBtn');
  if (analyzeBtn) {
    analyzeBtn.addEventListener('click', function() {
      handleAnalyze();
    });
  }
  
  const suggestionsBtn = document.getElementById('suggestionsBtn');
  if (suggestionsBtn) {
    suggestionsBtn.addEventListener('click', function() {
      alert('Personalized suggestions would be shown here.');
    });
  }
  
  const audioSuggestionBtn = document.getElementById('audioSuggestionBtn');
  if (audioSuggestionBtn) {
    audioSuggestionBtn.addEventListener('click', function() {
      suggestAudioForActiveCalls();
    });
  }
  
  // Streaming monitoring buttons
  const startMonitoringBtn = document.getElementById('startMonitoringBtn');
  if (startMonitoringBtn) {
    startMonitoringBtn.addEventListener('click', startMonitoring);
  }
  
  const stopMonitoringBtn = document.getElementById('stopMonitoringBtn');
  if (stopMonitoringBtn) {
    stopMonitoringBtn.addEventListener('click', stopMonitoring);
  }
  
  // Platform selection
  document.querySelectorAll('.platform-item').forEach(item => {
    item.addEventListener('click', () => {
      const platform = item.getAttribute('data-platform');
      selectPlatform(platform);
    });
  });
  
  // Settings toggles
  const autoDetect = document.getElementById('autoDetect');
  if (autoDetect) {
    autoDetect.addEventListener('change', saveSettings);
  }
  
  const desktopNotifications = document.getElementById('desktopNotifications');
  if (desktopNotifications) {
    desktopNotifications.addEventListener('change', saveSettings);
  }
  
  const realTimeTracking = document.getElementById('realTimeTracking');
  if (realTimeTracking) {
    realTimeTracking.addEventListener('change', saveSettings);
  }
  
  const customizeGoalsBtn = document.getElementById('customizeGoalsBtn');
  if (customizeGoalsBtn) {
    customizeGoalsBtn.addEventListener('click', customizeGoals);
  }
}

// Check authentication status
function checkAuthStatus() {
  chrome.runtime.sendMessage(
    { type: "checkAuthStatus" },
    (response) => {
      // Handle case where response is undefined (extension context invalidated)
      if (chrome.runtime.lastError || !response) {
        console.error('Error checking auth status:', chrome.runtime.lastError);
        showAuthUI();
        setupAuthEventListeners();
        return;
      }
      
      isAuthenticated = response.authenticated;
      if (isAuthenticated) {
        showAppUI();
        startPeriodicUpdates();
        startStreamingUpdates();
      } else {
        showAuthUI();
        setupAuthEventListeners();
      }
    }
  );
}

// Show authentication UI
function showAuthUI() {
  const authUI = document.getElementById('authUI');
  const appUI = document.getElementById('appUI');
  if (authUI) authUI.classList.remove('hidden');
  if (appUI) appUI.classList.add('hidden');
}

// Show main app UI
function showAppUI() {
  const authUI = document.getElementById('authUI');
  const appUI = document.getElementById('appUI');
  if (authUI) authUI.classList.add('hidden');
  if (appUI) appUI.classList.remove('hidden');
  updateStatus('Active', '#10b981');
}

// Set up authentication event listeners
function setupAuthEventListeners() {
  const authBtn = document.getElementById('googleAuthBtn');
  const errorMessage = document.getElementById('errorMessage');
  
  if (!authBtn) return;
  
  authBtn.addEventListener('click', function() {
    // Show loading state
    authBtn.innerHTML = '<div class="loading-spinner"></div> Authenticating...';
    authBtn.disabled = true;
    if (errorMessage) errorMessage.style.display = 'none';
    
    // Authenticate with Google
    chrome.runtime.sendMessage(
      { type: "authenticate" },
      (response) => {
        // Handle case where response is undefined
        if (chrome.runtime.lastError || !response) {
          console.error('Authentication error:', chrome.runtime.lastError);
          authBtn.innerHTML = 'Sign in with Google';
          authBtn.disabled = false;
          if (errorMessage) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = 'Authentication failed. Please try again.';
          }
          return;
        }
        
        if (response.success) {
          isAuthenticated = true;
          showAppUI();
          startPeriodicUpdates();
          startStreamingUpdates();
          handleRefresh(); // Fetch data immediately after auth
        } else {
          // Auth failed
          authBtn.innerHTML = 'Sign in with Google';
          authBtn.disabled = false;
          if (errorMessage) {
            errorMessage.style.display = 'block';
            errorMessage.textContent = response.error || 'Authentication failed. Please try again.';
          }
        }
      }
    );
  });
}

// Handle refresh button click
function handleRefresh() {
  if (!isAuthenticated) {
    alert('Please authenticate with Google first');
    return;
  }
  
  const btn = document.getElementById('refreshBtn');
  if (!btn) return;
  
  const originalText = btn.innerHTML;
  
  // Show loading state
  btn.innerHTML = '<span class="label-icon">SYNCING</span> Refreshing...';
  btn.disabled = true;
  document.body.classList.add('loading');
  
  // Get unread count from background script
  chrome.runtime.sendMessage(
    { type: "getUnreadCount" },
    (response) => {
      // Handle case where response is undefined
      if (chrome.runtime.lastError || !response) {
        console.error('Error fetching unread count:', chrome.runtime.lastError);
        updateStatus('Error', '#ef4444');
        alert('Error fetching emails. Please try again.');
        
        // Reset button
        btn.innerHTML = originalText;
        btn.disabled = false;
        document.body.classList.remove('loading');
        return;
      }
      
      if (response.error) {
        console.error('Error fetching unread count:', response.error);
        updateStatus('Error', '#ef4444');
        alert('Error fetching emails: ' + response.error);
        
        // If it's an auth error, show auth UI again
        if (response.error.includes('auth') || response.error.includes('401')) {
          isAuthenticated = false;
          showAuthUI();
          setupAuthEventListeners();
        }
      } else {
        unreadCount = response.count;
        updateUI();
        updateStatus('Updated', '#10b981');
      }
      
      // Reset button
      btn.innerHTML = originalText;
      btn.disabled = false;
      document.body.classList.remove('loading');
    }
  );
}

// Handle view report button click
function handleViewReport() {
  // Show comprehensive report including streaming data
  const totalCarbon = (unreadCount * 4) + (streamingStats.callCarbon + streamingStats.streamingCarbon);
  const reportHtml = `
    <div style="padding: 20px; max-width: 400px;">
      <h2>CarbonVoid Daily Report</h2>
      <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin: 10px 0;">
        <h3>📧 Email Impact</h3>
        <p>Unread emails: ${unreadCount}</p>
        <p>Carbon footprint: ${unreadCount * 4}g CO₂</p>
      </div>
      <div style="background: #f0fdf4; padding: 15px; border-radius: 8px; margin: 10px 0;">
        <h3>🎥 Streaming & Calls Impact</h3>
        <p>Total minutes: ${Math.round(streamingStats.totalMinutes)}min</p>
        <p>Video calls: ${Math.round(streamingStats.callCarbon)}g CO₂</p>
        <p>Streaming: ${Math.round(streamingStats.streamingCarbon)}g CO₂</p>
        <p>Total: ${Math.round(streamingStats.callCarbon + streamingStats.streamingCarbon)}g CO₂</p>
      </div>
      <div style="background: #fffbeb; padding: 15px; border-radius: 8px; margin: 10px 0;">
        <h3>📊 Total Daily Impact</h3>
        <p style="font-size: 1.2em; font-weight: bold;">
          ${Math.round(totalCarbon)}g CO₂ total
        </p>
        <p>Equivalent to driving ${(totalCarbon / 12000).toFixed(2)}km in a car</p>
      </div>
    </div>
  `;
  
  // In a real implementation, you'd use a proper modal
  alert(reportHtml);
}

// Handle analyze button click
function handleAnalyze() {
  const suggestions = generateStreamingSuggestions();
  if (suggestions.length > 0) {
    const analysisHtml = `
      <div style="padding: 15px;">
        <h3>💡 Carbon Reduction Suggestions</h3>
        ${suggestions.map(suggestion => `
          <div style="background: #f0fdf4; padding: 10px; margin: 8px 0; border-radius: 6px; border-left: 4px solid #10b981;">
            <strong>${suggestion.icon} ${suggestion.message}</strong>
            <p style="margin: 5px 0 0 0; font-size: 0.9em;">
              Potential savings: ${suggestion.potentialSavings}g CO₂
            </p>
          </div>
        `).join('')}
      </div>
    `;
    alert(analysisHtml);
  } else {
    alert('No significant carbon savings opportunities detected yet. Keep using the extension to get personalized suggestions!');
  }
}

// Handle customize goals button click
function customizeGoals() {
  const newLimit = prompt('Enter daily carbon limit (grams of CO₂):', '500');
  if (newLimit && !isNaN(newLimit) && newLimit > 0) {
    const carbonLimitBadge = document.getElementById('carbonLimitBadge');
    if (carbonLimitBadge) {
      carbonLimitBadge.textContent = `${newLimit}g CO₂`;
    }
    // Save to storage
    chrome.storage.local.set({ dailyCarbonLimit: parseInt(newLimit) });
  }
}

// Update the UI with current data
function updateUI() {
  const unreadCountElement = document.getElementById('unreadCount');
  if (unreadCountElement) unreadCountElement.textContent = unreadCount;
  
  // Calculate progress (inverse since we want to reduce unread emails)
  const progress = Math.max(0, Math.min(100, 100 - (unreadCount / goal * 100)));
  const progressFill = document.getElementById('progressFill');
  if (progressFill) progressFill.style.width = `${progress}%`;
  
  const progressText = document.getElementById('progressText');
  if (progressText) progressText.textContent = `${Math.round(progress)}% towards your goal`;
  
  // Calculate carbon impact (mock calculation)
  const carbonImpact = unreadCount * 4; // 4g CO₂ per email
  const carbonStat = document.getElementById('carbonStat');
  if (carbonStat) carbonStat.textContent = `${carbonImpact}g CO₂`;
  
  // Update last updated time
  const now = new Date();
  const lastUpdated = document.getElementById('lastUpdated');
  if (lastUpdated) lastUpdated.textContent = `Last updated: ${now.toLocaleTimeString()}`;
  
  // Update category badges with mock data
  updateCategoryBadges();
}

// Update status badge
function updateStatus(status, color) {
  const statusBadge = document.getElementById('statusBadge');
  if (statusBadge) {
    statusBadge.textContent = status;
    statusBadge.style.background = color;
  }
}

// Update category badges
function updateCategoryBadges() {
  const categories = [
    { name: 'Primary', count: Math.floor(unreadCount * 0.3) },
    { name: 'Promotions', count: Math.floor(unreadCount * 0.4) },
    { name: 'Social', count: Math.floor(unreadCount * 0.2) },
    { name: 'Updates', count: Math.floor(unreadCount * 0.1) },
    { name: 'Forums', count: Math.floor(unreadCount * 0.05) }
  ];
  
  document.querySelectorAll('.category').forEach((categoryEl, index)=> {
    if (categories[index]) {
      const badge = categoryEl.querySelector('.category-badge');
      if (badge) {
        badge.textContent = categories[index].count;
        
        // Color code based on count
        if (categories[index].count > 15) {
          badge.style.background = '#fef2f2';
          badge.style.color = '#ef4444';
        } else if (categories[index].count > 5) {
          badge.style.background = '#fffbeb';
          badge.style.color = '#f59e0b';
        } else {
          badge.style.background = '#f0fdf4';
          badge.style.color = '#10b981';
        }
      }
    }
  });
}

// Start periodic updates
function startPeriodicUpdates() {
  // Clear any existing interval
  stopPeriodicUpdates();
  
  // Set up new interval only if auto-refresh is enabled
  const autoRefreshCheckbox = document.getElementById('autoRefresh');
  if (autoRefreshCheckbox && autoRefreshCheckbox.checked) {
    refreshInterval = setInterval(() => {
      handleRefresh();
    }, 5 * 60 * 1000); // 5 minutes
  }
}

// Stop periodic updates
function stopPeriodicUpdates() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}

// Load saved settings
function loadSettings() {
  chrome.storage.local.get(['goal', 'autoRefresh', 'darkMode'], (result) => {
    if (result.goal) {
      goal = result.goal;
      const dailyGoalBadge = document.getElementById('dailyGoalBadge');
      if (dailyGoalBadge) {
        dailyGoalBadge.textContent = `${goal} emails`;
      }
    }
    
    if (result.autoRefresh !== undefined) {
      const autoRefreshCheckbox = document.getElementById('autoRefresh');
      if (autoRefreshCheckbox) {
        autoRefreshCheckbox.checked = result.autoRefresh;
        if (result.autoRefresh) {
          startPeriodicUpdates();
        }
      }
    }
    
    if (result.darkMode) {
      const darkModeCheckbox = document.getElementById('darkMode');
      if (darkModeCheckbox) {
        darkModeCheckbox.checked = result.darkMode;
        // handleDarkModeToggle({ target: { checked: result.darkMode } });
      }
    }
  });
}

// ================= STREAMING MONITORING FUNCTIONS =================

// Platform selection
function selectPlatform(platform) {
  // Remove active class from all platforms
  document.querySelectorAll('.platform-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Add active class to selected platform
  const selectedPlatform = document.querySelector(`[data-platform="${platform}"]`);
  if (selectedPlatform) {
    selectedPlatform.classList.add('active');
  }
  
  // If already monitoring, switch platform
  if (isMonitoring && currentSession) {
    currentSession.platform = platform;
    updatePlatformIcon(platform);
  }
}

// Start monitoring
function startMonitoring() {
  if (isMonitoring) return;
  
  const selectedPlatform = document.querySelector('.platform-item.active');
  const platform = selectedPlatform ? selectedPlatform.getAttribute('data-platform') : 'default';
  
  currentSession = {
    platform: platform,
    startTime: Date.now(),
    duration: 0,
    energy: 0,
    carbon: 0,
    bitrate: Math.random() * 5 + 1 // Simulated bitrate between 1-6 Mbps
  };
  
  isMonitoring = true;
  updateUI();
  
  // Show live session card
  const liveSessionCard = document.getElementById('liveSessionCard');
  if (liveSessionCard) {
    liveSessionCard.style.display = 'block';
  }
  updatePlatformIcon(platform);
  
  // Start monitoring interval
  monitoringInterval = setInterval(updateMonitoring, 1000); // Update every second
  
  // Send message to background script to start monitoring
  chrome.runtime.sendMessage({
    type: "startMonitoring",
    platform: platform
  });
}

// Stop monitoring - FIXED VERSION
function stopMonitoring() {
  if (!isMonitoring) return;
  
  clearInterval(monitoringInterval);
  isMonitoring = false;
  
  // Save session to statistics - FIXED: Ensure sessions array exists
  if (currentSession) {
    // Initialize sessions array if it doesn't exist
    if (!streamingStats.sessions) {
      streamingStats.sessions = [];
    }
    
    streamingStats.sessions.push(currentSession);
    streamingStats.totalMinutes += currentSession.duration / 60;
    streamingStats.totalEnergy += currentSession.energy;
    streamingStats.totalCarbon += currentSession.carbon;
    
    saveData();
    updateDashboard();
  }
  
  currentSession = null;
  
  // Hide live session card
  const liveSessionCard = document.getElementById('liveSessionCard');
  if (liveSessionCard) {
    liveSessionCard.style.display = 'none';
  }
  
  // Send message to background script to stop monitoring
  chrome.runtime.sendMessage({ type: "stopMonitoring" });
}

// Update monitoring in real-time
function updateMonitoring() {
  if (!currentSession) return;
  
  const now = Date.now();
  const elapsedSeconds = (now - currentSession.startTime) / 1000;
  currentSession.duration = elapsedSeconds;
  
  // Calculate energy and carbon based on platform
  const config = platformConfig[currentSession.platform] || platformConfig.default;
  const energyPerSecond = config.baseEnergy / 3600; // Convert kWh per hour to per second
  currentSession.energy += energyPerSecond;
  currentSession.carbon = currentSession.energy * config.carbonFactor;
  
  // Update UI
  updateLiveSession();
  updateDashboard();
}

// Update live session display
function updateLiveSession() {
  if (!currentSession) return;
  
  const minutes = Math.floor(currentSession.duration / 60);
  const seconds = Math.floor(currentSession.duration % 60);
  
  const livePlatformName = document.getElementById('livePlatformName');
  const liveDuration = document.getElementById('liveDuration');
  const liveCarbon = document.getElementById('liveCarbon');
  const liveBitrate = document.getElementById('liveBitrate');
  
  if (livePlatformName) livePlatformName.textContent = 
    currentSession.platform.charAt(0).toUpperCase() + currentSession.platform.slice(1);
  if (liveDuration) liveDuration.textContent = `${minutes}m ${seconds}s`;
  if (liveCarbon) liveCarbon.textContent = `${Math.round(currentSession.carbon)}g`;
  if (liveBitrate) liveBitrate.textContent = `${currentSession.bitrate.toFixed(1)} Mbps`;
}

// Update dashboard statistics - FIXED WITH NULL CHECKS
function updateDashboard() {
  // Update streaming tab elements only if they exist
  const streamingMinutes = document.getElementById('streamingMinutes');
  const streamingEnergy = document.getElementById('streamingEnergy');
  const streamingCarbon = document.getElementById('streamingCarbon');
  
  if (streamingMinutes) streamingMinutes.textContent = Math.round(streamingStats.totalMinutes + (currentSession ? currentSession.duration / 60 : 0));
  if (streamingEnergy) streamingEnergy.textContent = (streamingStats.totalEnergy + (currentSession ? currentSession.energy : 0)).toFixed(2);
  if (streamingCarbon) streamingCarbon.textContent = Math.round(streamingStats.totalCarbon + (currentSession ? currentSession.carbon : 0));
  
  // Update dashboard elements only if they exist
  const totalCarbon = document.getElementById('totalCarbon');
  const streamingTime = document.getElementById('streamingTime');
  const energyUsed = document.getElementById('energyUsed');
  const progressFill = document.getElementById('progressFill');
  const progressPercent = document.getElementById('progressPercent');
  
  if (totalCarbon) totalCarbon.textContent = `${Math.round(streamingStats.totalCarbon + (currentSession ? currentSession.carbon : 0))}g`;
  if (streamingTime) streamingTime.textContent = `${Math.round(streamingStats.totalMinutes + (currentSession ? currentSession.duration / 60 : 0))}m`;
  if (energyUsed) energyUsed.textContent = `${(streamingStats.totalEnergy + (currentSession ? currentSession.energy : 0)).toFixed(2)} kWh`;
  
  // Update progress (example: goal of 500g CO₂)
  if (progressFill && progressPercent) {
    const totalCarbonValue = streamingStats.totalCarbon + (currentSession ? currentSession.carbon : 0);
    const progress = Math.min(100, (totalCarbonValue / 500) * 100);
    progressFill.style.width = `${progress}%`;
    progressPercent.textContent = `${Math.round(progress)}%`;
  }
}

// Update platform icon
function updatePlatformIcon(platform) {
  const config = platformConfig[platform] || platformConfig.default;
  const livePlatformIcon = document.getElementById('livePlatformIcon');
  if (livePlatformIcon) {
    livePlatformIcon.textContent = config.icon;
  }
}

// Check for active sessions
function checkActiveSessions() {
  chrome.runtime.sendMessage({ type: "getActiveSession" }, (response) => {
    if (response && response.active) {
      // Resume monitoring if there's an active session
      currentSession = response.session;
      isMonitoring = true;
      const liveSessionCard = document.getElementById('liveSessionCard');
      if (liveSessionCard) {
        liveSessionCard.style.display = 'block';
      }
      updatePlatformIcon(currentSession.platform);
      monitoringInterval = setInterval(updateMonitoring, 1000);
      updateUI();
    }
  });
}

// Save data to storage
function saveData() {
  chrome.storage.local.set({ 
    streamingStats: streamingStats,
    lastUpdated: Date.now()
  });
}

// Load saved data - FIXED VERSION
function loadSavedData() {
  chrome.storage.local.get(['streamingStats', 'settings'], (result) => {
    if (result.streamingStats) {
      streamingStats = result.streamingStats;
      
      // Ensure sessions array exists in loaded data
      if (!streamingStats.sessions) {
        streamingStats.sessions = [];
      }
      
      updateDashboard();
    }
    
    if (result.settings) {
      // Load saved settings
      const autoDetect = document.getElementById('autoDetect');
      const desktopNotifications = document.getElementById('desktopNotifications');
      const realTimeTracking = document.getElementById('realTimeTracking');
      
      if (autoDetect) autoDetect.checked = result.settings.autoDetect !== false;
      if (desktopNotifications) desktopNotifications.checked = result.settings.desktopNotifications !== false;
      if (realTimeTracking) realTimeTracking.checked = result.settings.realTimeTracking !== false;
    }
  });
}

// Save settings
function saveSettings() {
  const autoDetect = document.getElementById('autoDetect');
  const desktopNotifications = document.getElementById('desktopNotifications');
  const realTimeTracking = document.getElementById('realTimeTracking');
  
  if (autoDetect && desktopNotifications && realTimeTracking) {
    const settings = {
      autoDetect: autoDetect.checked,
      desktopNotifications: desktopNotifications.checked,
      realTimeTracking: realTimeTracking.checked
    };
    
    chrome.storage.local.set({ settings: settings });
  }
}

function loadStreamingStats() {
  chrome.runtime.sendMessage(
    { type: "getStreamingStats" },
    (response) => {
      // Handle case where response is undefined
      if (chrome.runtime.lastError || !response) {
        console.error('Error loading streaming stats:', chrome.runtime.lastError);
        return;
      }
      
      if (response.stats) {
        streamingStats = response.stats;
        
        // Ensure sessions array exists
        if (!streamingStats.sessions) {
          streamingStats.sessions = [];
        }
        
        activeSessions = response.activeSessions || [];
        // Only update streaming UI if elements exist
        if (document.getElementById('streamingMinutes')) {
          updateStreamingUI(response.stats, response.suggestions);
        }
      }
    }
  );
}

function updateStreamingUI(stats, suggestions) {
  // Update metrics if elements exist
  const minutesElement = document.getElementById('streamingMinutes');
  const energyElement = document.getElementById('streamingEnergy');
  const carbonElement = document.getElementById('streamingCarbon');
  
  if (minutesElement) minutesElement.textContent = Math.round(stats.totalMinutes);
  if (energyElement) energyElement.textContent = (stats.callEnergy + stats.streamingEnergy).toFixed(2);
  if (carbonElement) carbonElement.textContent = Math.round(stats.callCarbon + stats.streamingCarbon);
  
  // Update progress (goal: max 120 minutes of video)
  const progressElement = document.getElementById('streamingProgressFill');
  const progressTextElement = document.getElementById('streamingProgressPercent');
  if (progressElement && progressTextElement) {
    const progress = Math.min(100, (stats.totalMinutes / 120) * 100);
    progressElement.style.width = `${progress}%`;
    progressTextElement.textContent = `${Math.round(progress)}%`;
    
    // Color coding based on usage
    if (progress > 75) {
      progressElement.style.background = '#ef4444';
    } else if (progress > 50) {
      progressElement.style.background = '#f59e0b';
    } else {
      progressElement.style.background = '#10b981';
    }
  }
  
  // Update suggestions if element exists
  const suggestionsContainer = document.getElementById('streamingSuggestions');
  if (suggestionsContainer) {
    updateSuggestionsUI(suggestions);
  }
}

function updateSuggestionsUI(suggestions) {
  const container = document.getElementById('streamingSuggestions');
  if (!container) return;
  
  if (!suggestions || suggestions.length === 0) {
    container.innerHTML = '<p class="placeholder">No suggestions yet. Start a video call or streaming session to get tips.</p>';
    return;
  }
  
  container.innerHTML = suggestions.map(suggestion => `
    <div class="suggestion-item">
      <div class="suggestion-icon">${suggestion.icon || '💡'}</div>
      <div class="suggestion-content">
        <strong>${suggestion.message}</strong>
        <p>Potential savings: ${suggestion.potentialSavings}g CO₂</p>
      </div>
    </div>
  `).join('');
}

function getPlatformIcon(platform) {
  const icons = {
    youtube: '📺',
    netflix: '🎬',
    zoom: '💼',
    teams: '🏢',
    meet: '📹',
    webex: '🔗',
    unknown: '🎥'
  };
  return icons[platform] || icons.unknown;
}

function generateStreamingSuggestions() {
  const suggestions = [];
  const totalCarbon = streamingStats.callCarbon + streamingStats.streamingCarbon;
  
  if (streamingStats.callCarbon > 1000) {
    suggestions.push({
      icon: '🎧',
      message: 'Switch to audio-only for non-essential video calls',
      potentialSavings: Math.round(streamingStats.callCarbon * 0.8)
    });
  }
  
  if (streamingStats.streamingCarbon > 2000) {
    suggestions.push({
      icon: '⚙️',
      message: 'Reduce streaming quality from HD to SD',
      potentialSavings: Math.round(streamingStats.streamingCarbon * 0.4)
    });
  }
  
  if (totalCarbon > 3000) {
    suggestions.push({
      icon: '⏰',
      message: 'Take screen breaks every 45 minutes',
      potentialSavings: Math.round(totalCarbon * 0.2)
    });
  }
  
  return suggestions;
}

function suggestAudioForActiveCalls() {
  const activeCalls = activeSessions.filter(session => session.isCall);
  if (activeCalls.length > 0) {
    activeCalls.forEach(call => {
      chrome.runtime.sendMessage({
        type: "suggestAudioOnly",
        tabId: call.tabId
      });
    });
    alert(`Sent audio suggestions to ${activeCalls.length} active call(s)`);
  } else {
    alert('No active video calls detected');
  }
}

function startStreamingUpdates() {
  // Listen for real-time updates from background
  chrome.runtime.onMessage.addListener((request) => {
    if (request.type === 'streamingUpdate') {
      streamingStats = request.stats;
      
      // Ensure sessions array exists
      if (!streamingStats.sessions) {
        streamingStats.sessions = [];
      }
      
      // Only update if streaming UI elements exist
      if (document.getElementById('streamingMinutes')) {
        updateStreamingUI(request.stats, generateStreamingSuggestions());
      }
    }
    
    if (request.type === 'dailyStatsReset') {
      // Reset UI when daily stats are cleared
      streamingStats = {
        streamingEnergy: 0,
        streamingCarbon: 0,
        callEnergy: 0,
        callCarbon: 0,
        totalMinutes: 0,
        dailySessions: 0,
        sessions: [] // Ensure sessions array is included
      };
      activeSessions = [];
      // Only update if streaming UI elements exist
      if (document.getElementById('streamingMinutes')) {
        updateStreamingUI(streamingStats, []);
      }
    }
  });
  
  // Periodic refresh of streaming stats
  streamingUpdateInterval = setInterval(() => {
    loadStreamingStats();
  }, 10000); // Update every 10 seconds
}

function stopStreamingUpdates() {
  if (streamingUpdateInterval) {
    clearInterval(streamingUpdateInterval);
    streamingUpdateInterval = null;
  }
}

// Initialize streaming when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', startStreamingUpdates);
} else {
  startStreamingUpdates();
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === "streamingDetected") {
    if (!isMonitoring) {
      // Auto-start monitoring if enabled
      const autoDetect = document.getElementById('autoDetect');
      if (autoDetect && autoDetect.checked) {
        selectPlatform(request.platform);
        startMonitoring();
      }
    }
  }
  
  if (request.type === "streamingEnded") {
    if (isMonitoring && currentSession && currentSession.platform === request.platform) {
      stopMonitoring();
    }
  }
  
  if (request.type === "dailyReset") {
    // Reset daily stats with proper structure
    streamingStats = {
      streamingEnergy: 0,
      streamingCarbon: 0,
      callEnergy: 0,
      callCarbon: 0,
      totalMinutes: 0,
      dailySessions: 0,
      sessions: [] // Ensure sessions array is included
    };
    updateDashboard();
    saveData();
  }
  
  return true; // Keep the message channel open for async response
});