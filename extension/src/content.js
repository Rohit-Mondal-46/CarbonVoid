(() => {
  const site = location.hostname;
  const timestamp = new Date().toISOString();
  

  if (window.top !== window.self || window.location.href === 'about:blank') {
    console.log("Skipping execution in iframe or about:blank");
    return;
  }


  let category = null;
  
  if (site.includes("youtube.com")) {
    category = "streaming_youtube";

    let videoData = {
      durationMinutes: 0,
      dataUsedMb: 0,
      resolution: 'unknown',
      title: 'unknown'
    };

    const dataRates = {
      '3840x2160': 15.98,
      '2560x1440': 8.91,
      '1920x1080': 5.93,
      '1280x720': 2.97,
      'unknown': 3.0
    };

    function getVideoTitle() {
      try {
        // Use the exact selector that worked for you
        const titleElement = document.querySelector('h1.ytd-watch-metadata yt-formatted-string');
        
        if (titleElement) {
          return titleElement.textContent.trim();
        }
        
        // Fallback for other YouTube layouts
        return document.querySelector('#title h1')?.textContent.trim() || 'unknown';
        
      } catch (error) {
        console.error('Error getting title:', error);
        return 'unknown';
      }
    }

    function getVideoResolution(video) {
      return `${video.videoWidth}x${video.videoHeight}`;
    }

    function estimateDataUsage(resolution, durationMinutes) {
      const closest = Object.keys(dataRates).find(r => resolution.includes(r)) || 'unknown';
      return (dataRates[closest] * durationMinutes).toFixed(2);
    }

    function startTracking(video) {
      console.log("[CarbonCrumbs] Tracking video started.");

      let watchedSeconds = 0;
      videoData.title = getVideoTitle();
      setInterval(async () => {
        if (!video.paused && !video.ended) {
          watchedSeconds += 5;
          const durationMinutes = (watchedSeconds / 60).toFixed(2);

          if (videoData.resolution === 'unknown' || watchedSeconds <= 10) {
            videoData.resolution = getVideoResolution(video);
          }

          videoData.durationMinutes = durationMinutes;
          videoData.dataUsedMb = estimateDataUsage(videoData.resolution, durationMinutes);

          chrome.runtime.sendMessage({
            type: 'youtubeStats',
            data: videoData
          }, (response) => {
            console.log("[CarbonCrumbs] Data sent:", videoData);
            console.log("[Content] Response from background:", response);
          });
        }
      }, 5000);
    }

    const observer = new MutationObserver(() => {
      const video = document.querySelector('video');
      if (video && !video.__carbonCrumbsTracked) {
        video.__carbonCrumbsTracked = true;
        startTracking(video);
      }
    });

    observer.observe(document.body, { childList: true, subtree: true });

    const existingVideo = document.querySelector('video');
    if (existingVideo && !existingVideo.__carbonCrumbsTracked) {
      existingVideo.__carbonCrumbsTracked = true;
      startTracking(existingVideo);
    }

  } else if (
    site.includes("mail.google.com") ||
    site.includes("outlook.live.com")
  ) {
    category = "email";
  }

  let sessionStart = Date.now();

  window.addEventListener("beforeunload", () => {
    const duration = (Date.now() - sessionStart) / 1000;
    // fetch("", {
    //   method: "POST",
    //   headers: { "Content-Type": "application/json" },
    //   body: JSON.stringify({
    //     url: location.href,
    //     timestamp,
    //     duration,
    //     category
    //   })
    // });
  });
})();
