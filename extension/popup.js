

// popup.js

// Global variables
let unreadCount = 42;
const goal = 20; // Daily goal for unread emails
let refreshInterval;

// DOM Content Loaded event
document.addEventListener('DOMContentLoaded', function() {
  initializeTabs();
  initializeUI();
  setupEventListeners();
  startPeriodicUpdates();
});

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
  const btn = document.getElementById('refreshBtn');
  const originalText = btn.innerHTML;
  
  // Show loading state
  btn.innerHTML = '<span class="label-icon">SYNCING</span> Refreshing...';
  btn.disabled = true;
  document.body.classList.add('loading');
  
  // Simulate API call delay
  setTimeout(() => {
    fetchEmailData()
      .then(() => {
        updateUI();
      })
      .catch(error => {
        console.error('Error refreshing data:', error);
        updateStatus('Error', '#ef4444');
      })
      .finally(() => {
        // Reset button
        btn.innerHTML = originalText;
        btn.disabled = false;
        document.body.classList.remove('loading');
      });
  }, 1500);
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
  }
}

// Handle auto-refresh toggle
function handleAutoRefreshToggle(event) {
  if (event.target.checked) {
    startPeriodicUpdates();
  } else {
    stopPeriodicUpdates();
  }
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
}

// Fetch email data (simulated)
function fetchEmailData() {
  return new Promise((resolve) => {
    // Simulate API call
    setTimeout(() => {
      // Randomly increase or decrease unread count
      const change = Math.floor(Math.random() * 10) - 3; // -3 to +6
      unreadCount = Math.max(0, unreadCount + change);
      resolve(unreadCount);
    }, 800);
  });
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
  
  // Update status
  updateStatus('Active', '#10b981');
  
  // Update category badges with mock data
  updateCategoryBadges();
}

// Update status badge
function updateStatus(status, color) {
  const statusBadge = document.getElementById('statusBadge');
  statusBadge.textContent = status;
  statusBadge.style.background = color;
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
  if (document.getElementById('autoRefresh').checked) {
    refreshInterval = setInterval(() => {
      // Random small changes to unread count
      const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
      unreadCount = Math.max(0, unreadCount + change);
      updateUI();
    }, 10000);
  }
}

// Stop periodic updates
function stopPeriodicUpdates() {
  if (refreshInterval) {
    clearInterval(refreshInterval);
    refreshInterval = null;
  }
}


