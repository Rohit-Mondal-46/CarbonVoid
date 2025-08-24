
// popup.js
// Global variables
let unreadCount = 0;
let goal = 20; // Daily goal for unread emails
let refreshInterval;
let isAuthenticated = false;

// DOM Content Loaded event
document.addEventListener('DOMContentLoaded', function() {
  checkAuthStatus();
});

// Check authentication status
function checkAuthStatus() {
  chrome.runtime.sendMessage(
    { type: "checkAuthStatus" },
    (response) => {
      isAuthenticated = response.authenticated;
      if (isAuthenticated) {
        showAppUI();
        initializeTabs();
        initializeUI();
        setupEventListeners();
        startPeriodicUpdates();
      } else {
        showAuthUI();
        setupAuthEventListeners();
      }
    }
  );
}

// Show authentication UI
function showAuthUI() {
  document.getElementById('authUI').classList.remove('hidden');
  document.getElementById('appUI').classList.add('hidden');
}

// Show main app UI
function showAppUI() {
  document.getElementById('authUI').classList.add('hidden');
  document.getElementById('appUI').classList.remove('hidden');
  updateStatus('Active', '#10b981');
}

// Set up authentication event listeners
function setupAuthEventListeners() {
  const authBtn = document.getElementById('googleAuthBtn');
  const errorMessage = document.getElementById('errorMessage');
  
  authBtn.addEventListener('click', function() {
    // Show loading state
    authBtn.innerHTML = '<div class="loading-spinner"></div> Authenticating...';
    authBtn.disabled = true;
    errorMessage.style.display = 'none';
    
    // Authenticate with Google
    chrome.runtime.sendMessage(
      { type: "authenticate" },
      (response) => {
        if (response.success) {
          isAuthenticated = true;
          showAppUI();
          initializeTabs();
          initializeUI();
          setupEventListeners();
          startPeriodicUpdates();
          handleRefresh(); // Fetch data immediately after auth
        } else {
          // Auth failed
          authBtn.innerHTML = `
            <svg class="google-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
            </svg>
            Sign in with Google
          `;
          authBtn.disabled = false;
          errorMessage.style.display = 'block';
          errorMessage.textContent = response.error || 'Authentication failed. Please try again.';
        }
      }
    );
  });
}

// Initialize tab functionality
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

// Initialize UI with data
function initializeUI() {
  updateUI();
  loadSettings();
}

// Set up event listeners
function setupEventListeners() {
  // Refresh button
  document.getElementById('refreshBtn').addEventListener('click', handleRefresh);
  
  // View report button
  document.getElementById('viewReportBtn').addEventListener('click', handleViewReport);
  
  // Analyze button
  document.getElementById('analyzeBtn').addEventListener('click', handleAnalyze);
  
  // Customize goals button
  document.getElementById('customizeGoalsBtn').addEventListener('click', handleCustomizeGoals);
  
  // Settings toggles
  document.getElementById('autoRefresh').addEventListener('change', handleAutoRefreshToggle);
  document.getElementById('darkMode').addEventListener('change', handleDarkModeToggle);
}

// Handle refresh button click
function handleRefresh() {
  if (!isAuthenticated) {
    alert('Please authenticate with Google first');
    return;
  }
  
  const btn = document.getElementById('refreshBtn');
  const originalText = btn.innerHTML;
  
  // Show loading state
  btn.innerHTML = '<span class="label-icon">SYNCING</span> Refreshing...';
  btn.disabled = true;
  document.body.classList.add('loading');
  
  // Get unread count from background script
  chrome.runtime.sendMessage(
    { type: "getUnreadCount" },
    (response) => {
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
  alert('Detailed report feature would open here in a real implementation.');
}

// Handle analyze button click
function handleAnalyze() {
  alert('Subscription analysis would run here in a real implementation.');
}

// Handle customize goals button click
function handleCustomizeGoals() {
  const newGoal = prompt('Enter new daily unread goal:', goal);
  if (newGoal && !isNaN(newGoal) && newGoal > 0) {
    goal = parseInt(newGoal);
    document.getElementById('dailyGoalBadge').textContent = `${goal} emails`;
    updateUI();
    
    // Save to storage
    chrome.storage.local.set({ goal: goal });
  }
}

// Handle auto-refresh toggle
function handleAutoRefreshToggle(event) {
  if (event.target.checked) {
    startPeriodicUpdates();
  } else {
    stopPeriodicUpdates();
  }
  
  // Save setting to storage
  chrome.storage.local.set({ autoRefresh: event.target.checked });
}

// Handle dark mode toggle
function handleDarkModeToggle(event) {
  if (event.target.checked) {
    document.documentElement.style.setProperty('--gray-light', '#1f2937');
    document.documentElement.style.setProperty('--gray-dark', '#f3f4f6');
    document.body.style.background = '#1f2937';
    document.body.style.color = '#f3f4f6';
  } else {
    document.documentElement.style.setProperty('--gray-light', '#f4f6f9');
    document.documentElement.style.setProperty('--gray-dark', '#374151');
    document.body.style.background = '#f4f6f9';
    document.body.style.color = '#374151';
  }
  
  // Save setting to storage
  chrome.storage.local.set({ darkMode: event.target.checked });
}

// Update the UI with current data
function updateUI() {
  document.getElementById('unreadCount').textContent = unreadCount;
  
  // Calculate progress (inverse since we want to reduce unread emails)
  const progress = Math.max(0, Math.min(100, 100 - (unreadCount / goal * 100)));
  document.getElementById('progressFill').style.width = `${progress}%`;
  document.getElementById('progressText').textContent = 
    `${Math.round(progress)}% towards your goal`;
  
  // Calculate carbon impact (mock calculation)
  const carbonImpact = unreadCount * 4; // 4g CO₂ per email
  document.getElementById('carbonStat').textContent = `${carbonImpact}g CO₂`;
  
  // Update last updated time
  const now = new Date();
  document.getElementById('lastUpdated').textContent = 
    `Last updated: ${now.toLocaleTimeString()}`;
  
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
  
  document.querySelectorAll('.category').forEach((categoryEl, index) => {
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
        handleDarkModeToggle({ target: { checked: result.darkMode } });
      }
    }
  });
}