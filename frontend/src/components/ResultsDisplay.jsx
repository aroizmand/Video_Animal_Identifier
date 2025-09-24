import React from "react";

export function Results({ result }) {
  return (
    <div className="p-4 border border-gray-200 rounded-lg bg-gray-50 text-left">
      <p className="font-semibold text-lg text-indigo-700 capitalize">
        {result.species}
      </p>
      <div className="grid grid-cols-3 gap-4 mt-2 text-sm text-gray-600">
        <p>
          <span className="font-medium">Start:</span> {result.start}s
        </p>
        <p>
          <span className="font-medium">End:</span> {result.end}s
        </p>
        <p>
          <span className="font-medium">Max Count:</span> {result.max_count}
        </p>
      </div>
    </div>
  );
}
