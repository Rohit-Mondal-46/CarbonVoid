import { useEffect, useState } from "react";

export default function CarbonModeToggle() {
  const [ecoMode, setEcoMode] = useState(false);

  useEffect(() => {
    if (ecoMode) {
      document.documentElement.classList.add("eco-mode");
    } else {
      document.documentElement.classList.remove("eco-mode");
    }
  }, [ecoMode]);

  return (
    <div className="flex flex-col items-center gap-2 transition-all duration-300 ease-in-out">
      <div className="flex items-center gap-2">
        <span className="text-sm text-white">Normal</span>
        <label className="relative inline-block w-11 h-6">
          <input
            type="checkbox"
            className="sr-only peer"
            checked={ecoMode}
            onChange={() => setEcoMode(!ecoMode)}
          />
          <div className="w-11 h-6 bg-gray-400 peer-checked:bg-green-500 rounded-full transition-colors duration-300"></div>
          <div className="absolute top-0.5 left-0.5 h-5 w-5 bg-white rounded-full transition-all duration-300 peer-checked:translate-x-5"></div>
        </label>
        <span className="text-sm text-white">Eco</span>
      </div>

      {ecoMode && (
        <p className="text-green-400 text-xs animate-pulse">
          🌱 Eco mode on — estimated 15% screen energy saved!
        </p>
      )}
    </div>
  );
}
