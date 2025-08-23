
document.addEventListener("DOMContentLoaded", async () => {
  const emailDiv = document.getElementById("userEmail");

  

  document.getElementById("open-dashboard").addEventListener("click", () => {
    chrome.tabs.create({ url: "http://localhost:5173" });
  });

  chrome.storage.local.get(['youtubeStats'], (result) => {
    if (result.youtubeStats) {
      document.getElementById('youtube-stats').style.display = 'block';
      document.getElementById('duration').textContent = result.youtubeStats.durationMinutes;
      document.getElementById('data-used').textContent = result.youtubeStats.dataUsedMb;
      document.getElementById('resolution').textContent = result.youtubeStats.resolution;
    }
  });
});