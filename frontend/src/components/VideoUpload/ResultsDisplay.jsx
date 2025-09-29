import React from "react";

export const ResultsDisplay = ({ result }) => {
  console.log(result);
  if (!result || !result.species) {
    return null;
  }

  const speciesName = result.species
    .replace(/_/g, " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
  const count = result.max_count;

  return (
    <div className="bg-white bg-opacity-20 backdrop-blur-md rounded-lg p-4 text-black text-left shadow-lg transition-transform transform hover:scale-105">
      <h3 className="text-xl font-bold">{speciesName}</h3>
      <p className="text-md">
        From: <span className="font-semibold">{result.start}s</span>
      </p>
      <p className="text-md">
        To: <span className="font-semibold">{result.end}s</span>
      </p>
      <p className="text-md">
        Max Count: <span className="font-semibold">{count}</span>
      </p>
    </div>
  );
};
