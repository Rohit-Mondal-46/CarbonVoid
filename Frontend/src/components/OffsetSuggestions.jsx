import React from 'react';

const OffsetSuggestions = ({ offsetAmount }) => {
  return (
    <div className="border p-4">
      <h2 className="font-semibold">Suggested Offsets</h2>
      <p>You should offset {offsetAmount} kg of CO₂. Consider the following:</p>
      <ul>
        <li>Planting trees</li>
        <li>Purchasing renewable energy credits</li>
      </ul>
    </div>
  );
};

export default OffsetSuggestions;
