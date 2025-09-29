import React from "react";
import { LoaderIcon } from "../../assets/Icons";

export const UploadingView = ({ fileName, uploadProgress }) => (
  <div className="w-full text-center">
    <div className="flex items-center justify-center mb-4">
      <LoaderIcon />
      <h2 className="text-2xl font-semibold text-white">Uploading...</h2>
    </div>
    <p className="text-white mb-4">{fileName}</p>
    <div className="w-full bg-white rounded-full h-4 overflow-hidden">
      <div
        className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
        style={{ width: `${uploadProgress}%` }}
      ></div>
    </div>
  </div>
);
