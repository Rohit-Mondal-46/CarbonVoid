// import React, { useState } from 'react';
// import axios from 'axios';

// const CarbonReport = () => {
//   const [videoHours, setVideoHours] = useState('');
//   const [cloudStorage, setCloudStorage] = useState('');
//   const [videoCalls, setVideoCalls] = useState('');
//   const [carbonReport, setCarbonReport] = useState(null);
//   const [loading, setLoading] = useState(false);

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const userData = {
//       videoHours,
//       cloudStorage,
//       videoCalls,
//     };

//     try {
//       const response = await axios.post('http://localhost:5000/api/getCarbonReport', userData);
//       setCarbonReport(response.data.carbonReport);
//       setLoading(false);
//     } catch (error) {
//       console.error('Error generating carbon report', error);
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="carbon-report-container">
//       <h1>Personalized Carbon Footprint Report</h1>

//       <form onSubmit={handleSubmit}>
//         <div>
//           <label>
//             Hours of Video Streaming (e.g., YouTube):
//             <input
//               type="number"
//               value={videoHours}
//               onChange={(e) => setVideoHours(e.target.value)}
//               required
//               placeholder="Enter hours of YouTube streaming"
//             />
//           </label>
//         </div>
//         <br />

//         <div>
//           <label>
//             Cloud Storage Used (in GB):
//             <input
//               type="number"
//               value={cloudStorage}
//               onChange={(e) => setCloudStorage(e.target.value)}
//               required
//               placeholder="Enter cloud storage usage in GB"
//             />
//           </label>
//         </div>
//         <br />

//         <div>
//           <label>
//             Hours of Video Calls:
//             <input
//               type="number"
//               value={videoCalls}
//               onChange={(e) => setVideoCalls(e.target.value)}
//               required
//               placeholder="Enter hours of video calls"
//             />
//           </label>
//         </div>
//         <br />

//         <button type="submit" disabled={loading}>
//           {loading ? 'Generating Report...' : 'Generate Report'}
//         </button>
//       </form>

//       {loading && <p>Loading...</p>}

//       {carbonReport && (
//         <div>
//           <h2>Your Carbon Footprint Report</h2>
//           <pre>{carbonReport}</pre>
//         </div>
//       )}
//     </div>
//   );
// };

// export default CarbonReport;