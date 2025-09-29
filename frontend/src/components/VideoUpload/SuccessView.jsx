import React from "react";
import { ResultIcon } from "../../assets/Icons";
import { ResultsDisplay } from "./ResultsDisplay";
export const SuccessView = ({ finalResult, handleReset }) => (
  <div className="w-full text-center">
    <div className="flex items-center justify-center mb-4 space-x-4">
      <ResultIcon />
      <h2 className="text-2xl font-semibold text-white">Analysis Complete!</h2>
    </div>
    <div className="space-y-4 mt-6">
      {finalResult && finalResult.length > 0 ? (
        finalResult.map((event, index) => (
          <ResultsDisplay key={index} result={event} />
        ))
      ) : (
        <p className="text-white">
          No animal sightings were found in this video.
        </p>
      )}
    </div>
    <button
      onClick={handleReset}
      className="mt-8 w-full max-w-md inline-flex items-center justify-center px-4 py-2 bg-indigo-600 text-white font-semibold rounded-md shadow-sm hover:bg-indigo-700 cursor-pointer"
    >
      Analyze Another Video
    </button>
  </div>
);
