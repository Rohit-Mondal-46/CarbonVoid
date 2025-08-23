import axios from 'axios';

const API_URL = 'http://localhost:3000/api/declutters/declutter';

// Generate random declutter suggestions and carbon stats
const generateRandomData = () => {
  // Random suggestions data
  const randomSuggestions = [
    {
      _id: '2',
      title: 'Optimize video streaming',
      description: 'Lower video quality when HD isn\'t necessary',
      impact: 'Saves ~0.5kg CO₂ per month',
      actionLink: 'https://example.com/video-optimization'
    },
    {
      _id: '4',
      title: 'Use dark mode',
      description: 'Switch to dark mode on your devices',
      impact: 'Reduces energy consumption by ~15%',
      actionLink: 'https://example.com/dark-mode'
    },
    {
      _id: '5',
      title: 'Schedule device updates',
      description: 'Set updates to happen during off-peak hours',
      impact: 'Lowers network strain and energy use',
      actionLink: 'https://example.com/smart-updates'
    }
  ];

  // Select 3 random suggestions
  const selectedSuggestions = [...randomSuggestions]
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  // Random stats data
  const randomStats = {
    videoStreaming: (Math.random() * 5 + 1).toFixed(2),
    cloudStorage: (Math.random() * 3 + 0.5).toFixed(2),
    videoCalls: (Math.random() * 2 + 0.3).toFixed(2)
  };

  return {
    suggestions: selectedSuggestions,
    stats: randomStats,
    isDemoData: true
  };
};

// Fetch declutter suggestions and carbon stats
export const fetchDeclutterAndStats = async () => {
  try {
    const response = await axios.get(`${API_URL}/declutterAndStats`);
    return {
      ...response.data,
      isDemoData: false
    };
  } catch (error) {
    console.error('Error fetching declutter suggestions and stats, using random data instead:', error);
    return generateRandomData();
  }
};