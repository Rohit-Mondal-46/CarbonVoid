const ACTIVITY_SERVICES = [
  "youtube",
  "netflix",
  "spotify",
  "google_drive",
  "web_browsing"
];

const STREAMING_SERVICES = ["youtube", "netflix"];

const EMISSION_FACTORS = {
  streaming: {
    youtube: { HD: 0.46, SD: 0.23, "4K": 1.52 },
    netflix: { HD: 0.42, SD: 0.21, "4K": 1.38 },
    spotify: { audio: 0.025 },
  },
  dataTransfer: 0.39,
  browsing: {
    average: 0.18,
    socialMedia: 0.25,
    search: 0.2,
  }
};

/**
 * Calculate emissions for an activity
 * @param {Object} activity
 * @param {string} activity.service
 * @param {number} activity.duration
 * @param {number} [activity.dataUsed]
 * @param {'SD'|'HD'|'4K'} [activity.resolution]
 */
function calculateEmissions(activity) {
  if (STREAMING_SERVICES.includes(activity.service)) {
    if (!activity.resolution) {
      throw new Error(`Resolution required for ${activity.service}`);
    }
  }

  let co2e = 0;

  switch (activity.service) {
    case "youtube":
    case "netflix": {
      const quality = activity.resolution || "HD";
      co2e =
        EMISSION_FACTORS.streaming[activity.service][quality] *
        activity.duration;
      break;
    }
    case "spotify":
      co2e = EMISSION_FACTORS.streaming.spotify.audio * activity.duration;
      break;
    case "google_drive":
      co2e = (activity.dataUsed || 0) * EMISSION_FACTORS.dataTransfer;
      break;
    case "web_browsing":
      co2e = EMISSION_FACTORS.browsing.average * activity.duration;
      break;
  }

  return parseFloat(co2e.toFixed(2));
}

/**
 * Validate that streaming resolution is provided
 * @param {string} service
 * @param {string} [resolution]
 */
function validateStreamingResolution(service, resolution) {
  if (STREAMING_SERVICES.includes(service) && !resolution) {
    throw new Error(`Resolution required for ${service}`);
  }
}

module.exports = {
  ACTIVITY_SERVICES,
  STREAMING_SERVICES,
  EMISSION_FACTORS,
  calculateEmissions,
  validateStreamingResolution,
};
