// content-script.js
class StreamingMonitor {
  constructor() {
    this.startTime = null;
    this.currentPlatform = this.detectPlatform();
    this.energyConsumption = 0; // kWh
    this.carbonEmissions = 0; // gCO2
  }

  detectPlatform() {
    const url = window.location.hostname;
    if (url.includes('youtube')) return 'youtube';
    if (url.includes('netflix')) return 'netflix';
    if (url.includes('zoom')) return 'zoom';
    if (url.includes('teams')) return 'teams';
    if (url.includes('meet.google')) return 'google_meet';
    if (url.includes('webex')) return 'webex';
    return 'unknown';
  }

  startMonitoring() {
    if (this.startTime) return;
    
    this.startTime = Date.now();
    console.log(`CarbonVoid: Started monitoring ${this.currentPlatform}`);
    
    // Send message to background script
    chrome.runtime.sendMessage({
      type: 'streamingStarted',
      platform: this.currentPlatform,
      startTime: this.startTime
    });

    // Monitor for video quality changes
    this.monitorVideoQuality();
  }

  stopMonitoring() {
    if (!this.startTime) return;
    
    const endTime = Date.now();
    const durationMinutes = (endTime - this.startTime) / 60000;
    
    this.calculateImpact(durationMinutes);
    
    chrome.runtime.sendMessage({
      type: 'streamingEnded',
      platform: this.currentPlatform,
      duration: durationMinutes,
      energy: this.energyConsumption,
      carbon: this.carbonEmissions
    });

    this.startTime = null;
  }

  calculateImpact(durationMinutes) {
    // Carbon impact factors (kWh per hour)
    const factors = {
      youtube: 0.08,    // 80Wh per hour for 720p
      netflix: 0.12,    // 120Wh per hour for HD
      zoom: 0.15,       // 150Wh per hour for video call
      teams: 0.16,      // 160Wh per hour
      google_meet: 0.14,// 140Wh per hour
      webex: 0.15,      // 150Wh per hour
      unknown: 0.10     // Default
    };

    const hours = durationMinutes / 60;
    this.energyConsumption = hours * (factors[this.currentPlatform] || factors.unknown);
    
    // Convert to carbon (average grid: 0.475 kgCO2/kWh)
    this.carbonEmissions = this.energyConsumption * 475; // Convert to grams
  }

  monitorVideoQuality() {
    // Monitor video elements for quality changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === 'attributes' && mutation.attributeName === 'src') {
          this.reportQualityChange();
        }
      });
    });

    const videoElements = document.querySelectorAll('video');
    videoElements.forEach(video => {
      observer.observe(video, { attributes: true });
    });
  }

  reportQualityChange() {
    chrome.runtime.sendMessage({
      type: 'qualityChange',
      platform: this.currentPlatform,
      timestamp: Date.now()
    });
  }
}

// Initialize monitor
const monitor = new StreamingMonitor();

// Start monitoring when page loads
if (['youtube', 'netflix'].includes(monitor.currentPlatform)) {
  setTimeout(() => monitor.startMonitoring(), 3000);
}

// Monitor for single page app navigation
let lastUrl = location.href;
new MutationObserver(() => {
  const url = location.href;
  if (url !== lastUrl) {
    lastUrl = url;
    monitor.stopMonitoring();
    monitor.currentPlatform = monitor.detectPlatform();
    if (['youtube', 'netflix'].includes(monitor.currentPlatform)) {
      setTimeout(() => monitor.startMonitoring(), 2000);
    }
  }
}).observe(document, { subtree: true, childList: true });

// Listen for messages from background
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getStreamingStatus') {
    sendResponse({
      isMonitoring: monitor.startTime !== null,
      platform: monitor.currentPlatform,
      duration: monitor.startTime ? (Date.now() - monitor.startTime) / 60000 : 0
    });
  }
  
  if (request.type === 'suggestAudioOnly') {
    showAudioSuggestion();
  }
});

function showAudioSuggestion() {
  const suggestion = document.createElement('div');
  suggestion.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: #fffbeb;
    border: 2px solid #f59e0b;
    border-radius: 8px;
    padding: 15px;
    z-index: 10000;
    max-width: 300px;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    font-family: Arial, sans-serif;
  `;
  
  suggestion.innerHTML = `
    <h3 style="margin: 0 0 10px 0; color: #92400e;">🎧 Carbon Saving Tip</h3>
    <p style="margin: 0 0 12px 0; color: #78350f;">
      Switch to audio-only to reduce your carbon footprint by up to 80%!
    </p>
    <button style="background: #10b981; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
      Got it!
    </button>
  `;
  
  document.body.appendChild(suggestion);
  
  suggestion.querySelector('button').addEventListener('click', () => {
    suggestion.remove();
  });
  
  setTimeout(() => {
    if (document.body.contains(suggestion)) {
      suggestion.remove();
    }
  }, 10000);
}