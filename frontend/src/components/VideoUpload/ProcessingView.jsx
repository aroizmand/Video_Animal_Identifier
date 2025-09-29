import React from "react";
import { LoaderIcon } from "../../assets/Icons";

export const ProcessingView = ({ analysisProgress, statusMessage }) => (
  <div className="w-full text-center">
    <div className="flex items-center justify-center mb-4">
      <LoaderIcon />
      <h2 className="text-2xl font-semibold text-white">
        Analysis in Progress
      </h2>
    </div>

    <div className="w-full bg-white rounded-full h-4 overflow-hidden">
      <div
        className="h-4 rounded-full transition-all duration-300"
        style={{
          width: `${analysisProgress}%`,
          backgroundColor: "#C29945",
        }}
      ></div>
    </div>
    <p className="text-white mt-4 pulsating-text">{statusMessage}</p>
  </div>
);
