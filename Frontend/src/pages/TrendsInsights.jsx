import React, { useState, useEffect } from 'react';
import { Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { useUser } from '../contexts/AuthContext';
import axios from 'axios';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

const TrendsInsights = () => {
  const { user } = useUser();
  const [timeRange, setTimeRange] = useState('daily');
  const [mainChartData, setMainChartData] = useState(null);
  const [appChartsData, setAppChartsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usingDemoData, setUsingDemoData] = useState(false);
  const [totalEmission, setTotalEmission] = useState(0);

  // Generate random YouTube data for 2 days
  const generateRandomYouTubeData = () => {
    const labels = ['Yesterday', 'Today'];
    
    // More realistic YouTube usage patterns
    const yesterdayHours = (Math.random() * 3 + 0.5).toFixed(1); // 0.5-3.5 hours
    const todayHours = (Math.random() * 3 + 0.5).toFixed(1); // 0.5-3.5 hours
    
    // Convert hours to CO2 (approx 100g CO2 per hour of YouTube)
    const yesterdayEmission = (yesterdayHours * 0.1).toFixed(2);
    const todayEmission = (todayHours * 0.1).toFixed(2);
    setTotalEmission((parseFloat(yesterdayEmission) + parseFloat(todayEmission)).toFixed(2));

    return {
      labels,
      datasets: [{
        label: 'YouTube CO₂ Emissions (kg)',
        data: [yesterdayEmission, todayEmission],
        backgroundColor: [
          'rgba(255, 99, 132, 0.7)',
          'rgba(255, 159, 64, 0.7)'
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(255, 159, 64, 1)'
        ],
        borderWidth: 1,
        borderRadius: 6,
      }]
    };
  };

  // Generate YouTube-only service data
  const generateYouTubeServiceData = () => {
    const emission = (Math.random() * 0.5 + 0.1).toFixed(2);
    return [{
      category: 'Streaming Services',
      data: {
        labels: ['YouTube'],
        datasets: [{
          label: 'Carbon Emission (kg)',
          data: [emission],
          backgroundColor: ['rgba(255, 99, 132, 0.7)'],
          borderColor: '#ffffff',
          borderWidth: 1,
        }]
      }
    }];
  };

  // Fetch or generate time-based emissions data
  const fetchTimeBasedEmissions = async () => {
    try {
      // Simulate API call for YouTube data
      const response = await axios.get(
        `http://localhost:3000/api/emissions/${user.id}/youtube/${timeRange}`
      );
      const data = response.data;
      const total = (parseFloat(data.yesterday) + parseFloat(data.today)).toFixed(2);
      setTotalEmission(total);
      
      setMainChartData({
        labels: ['Yesterday', 'Today'],
        datasets: [{
          label: 'YouTube CO₂ Emissions (kg)',
          data: [data.yesterday, data.today],
          backgroundColor: [
            'rgba(255, 99, 132, 0.7)',
            'rgba(255, 159, 64, 0.7)'
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(255, 159, 64, 1)'
          ],
          borderWidth: 1,
          borderRadius: 6,
        }]
      });
      setUsingDemoData(false);
    } catch (err) {
      console.error("Using demo YouTube data:", err);
      setMainChartData(generateRandomYouTubeData());
      setUsingDemoData(true);
    }
  };

  // Fetch or generate YouTube service data
  const fetchServiceWiseEmissions = async () => {
    try {
      // Simulate API call for YouTube-only service data
      const response = await axios.get(
        `http://localhost:3000/api/emissions/${user.id}/youtube/services`
      );
      const youtubeData = response.data;
      
      setAppChartsData([{
        category: 'Streaming Services',
        data: {
          labels: ['YouTube'],
          datasets: [{
            label: 'Carbon Emission (kg)',
            data: [youtubeData.emission],
            backgroundColor: ['rgba(255, 99, 132, 0.7)'],
            borderColor: '#ffffff',
            borderWidth: 1,
          }]
        }
      }]);
      setUsingDemoData(false);
    } catch (err) {
      console.error("Using demo YouTube service data:", err);
      setAppChartsData(generateYouTubeServiceData());
      setUsingDemoData(true);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when component mounts or timeRange/user changes
  useEffect(() => {
    if (user) {
      setLoading(true);
      setError(null);
      Promise.all([fetchTimeBasedEmissions(), fetchServiceWiseEmissions()])
        .catch(err => {
          setError('Failed to load YouTube data');
          console.error(err);
        });
    }
  }, [timeRange, user]);

  // Chart options
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          boxWidth: 12,
          padding: 20,
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'Daily YouTube Carbon Emissions',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        cornerRadius: 8
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          display: true,
          color: 'rgba(0, 0, 0, 0.05)'
        },
        title: {
          display: true,
          text: 'Carbon Emission (kg)',
          font: {
            size: 14,
            weight: 'bold'
          }
        },
        ticks: {
          stepSize: 0.2
        }
      },
      x: {
        grid: {
          display: false
        }
      }
    },
    animation: {
      duration: 1000
    }
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          boxWidth: 12,
          padding: 20,
          font: {
            size: 14
          }
        }
      },
      title: {
        display: true,
        text: 'YouTube Contribution to Streaming Emissions',
        font: {
          size: 16,
          weight: 'bold'
        },
        padding: {
          bottom: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 12
        },
        padding: 10,
        cornerRadius: 8
      }
    },
    animation: {
      animateScale: true,
      animateRotate: true
    }
  };

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Sign In Required</h2>
          <p className="text-gray-600 mb-6">Please sign in to view your YouTube carbon data</p>
          <div className="w-16 h-16 mx-auto border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Loading Your Data</h2>
          <p className="text-gray-600 mb-6">Analyzing your YouTube carbon footprint</p>
          <div className="w-16 h-16 mx-auto border-t-4 border-b-4 border-blue-500 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Data Loading Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => {
              setError(null);
              setLoading(true);
              Promise.all([fetchTimeBasedEmissions(), fetchServiceWiseEmissions()]);
            }} 
            className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Carbon Insights</h1>
            <p className="text-gray-600 mt-2">Track your carbon footprint</p>
          </div>
          
          {usingDemoData && (
            <div className="mt-4 md:mt-0 bg-yellow-100 border-l-4 border-yellow-400 p-3 rounded-r-lg flex items-center">
              <svg className="w-5 h-5 text-yellow-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <span className="text-sm text-yellow-700">fetching..</span>
            </div>
          )}
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Emissions</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{totalEmission} kg</p>
              </div>
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Today's Emission</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{mainChartData?.datasets[0].data[0] || '0.00'} kg</p>
              </div>
              <div className="w-12 h-12 bg-green-50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
                </svg>
              </div>
            </div>
          </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Yesterday's Emission</p>
                <p className="text-2xl font-bold text-gray-800 mt-1">{mainChartData?.datasets[0].data[1] || '0.00'} kg</p>
              </div>
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
            </div>
          </div>
          
          
        </div>

        {/* Main Chart Section */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Daily YouTube Carbon Emissions</h2>
            <div className="mt-4 md:mt-0 flex space-x-2">
              <button
                onClick={() => setTimeRange('daily')}
                className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                  timeRange === 'daily' 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Daily View
              </button>
            </div>
          </div>
          
          <div className="h-80">
            {mainChartData ? (
              <Bar data={mainChartData} options={barOptions} />
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">No YouTube data available</p>
              </div>
            )}
          </div>
        </div>

        {/* Pie Chart Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">YouTube Contribution</h2>
            <div className="h-64">
              {appChartsData.length > 0 ? (
                <Pie data={appChartsData[0].data} options={pieOptions} />
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">No YouTube service data available</p>
                </div>
              )}
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Emission Insights</h2>
            <div className="space-y-4">
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Watch in lower resolution</p>
                  <p className="text-sm text-gray-500">480p uses 50% less energy than 1080p</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Enable Dark Mode</p>
                  <p className="text-sm text-gray-500">Reduces display energy usage by up to 15%</p>
                </div>
              </div>
              
              <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
                  </svg>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Download for offline</p>
                  <p className="text-sm text-gray-500">Single download is better than multiple streams</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrendsInsights;