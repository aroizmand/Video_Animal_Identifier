import React from "react";

export const ErrorView = ({ handleReset }) => (
  <div className="w-full text-center">
    <h2 className="text-2xl font-semibold text-red-700">An Error Occurred</h2>
    <p className="text-red-600 my-4">
      The upload or analysis failed. Please try again.
    </p>
    <button
      onClick={handleReset}
      className="mt-6 w-full max-w-md inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700"
    >
      Try Again
    </button>
  </div>
);
