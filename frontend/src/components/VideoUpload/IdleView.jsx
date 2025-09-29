import React from "react";
import { MAX_UPLOAD_SIZE } from "../../config";

export const IdleView = ({
  file,
  fileError,
  isDragging,
  handleDragEnter,
  handleDragLeave,
  handleDragOver,
  handleDrop,
  triggerFileSelect,
  handleFileUpload,
}) => (
  <div className="w-full text-center">
    <div
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`mx-auto max-w-lg min-h-96 rounded-2xl flex flex-col items-center justify-center p-8 transition-all duration-300 ${
        isDragging
          ? "border-4 border-dashed border-white bg-opacity-40"
          : "border-2 border-dashed border-gray-400 bg-opacity-20"
      }`}
      style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
    >
      <p className="font-semibold text-white text-lg mt-4">
        {file ? file.name : "Drag and drop a video file"}
      </p>

      <p className="text-gray-300 text-sm mt-2">
        Maximum file size: {MAX_UPLOAD_SIZE / 1024 / 1024} MB
      </p>

      <p className="text-white my-4">or</p>

      <button
        onClick={triggerFileSelect}
        className="w-full max-w-xs inline-flex items-center justify-center px-4 py-2 text-white font-semibold rounded-md shadow-sm cursor-pointer hover:bg-opacity-80 transition-colors"
        style={{ backgroundColor: "#735423" }}
      >
        Select a File
      </button>
    </div>

    {fileError && (
      <p className="text-red-400 mt-4 font-semibold">{fileError}</p>
    )}

    <button
      onClick={handleFileUpload}
      disabled={!file || !!fileError}
      className="mt-6 w-full max-w-md inline-flex items-center justify-center px-4 py-2 text-white font-semibold rounded-md shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
      style={{ backgroundColor: "#337037" }}
    >
      Analyze Video
    </button>
  </div>
);
