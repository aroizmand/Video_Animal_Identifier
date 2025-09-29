import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { Results } from "../components/ResultsDisplay";
import { API_BASE_URL } from "../assets/constants";
import backgroundImage from "../assets/background.jpg";
import "../index.css";

const LoaderIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="white"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="animate-spin mr-3 h-6 w-6"
  >
    <path d="M21 12a9 9 0 1 1-6.219-8.56" />
  </svg>
);
const ResultIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="#5DC264"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="h-12 w-12 text-green-500"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export function FileUploader() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [jobId, setJobId] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [finalResult, setFinalResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/results/${jobId}`);

        setAnalysisProgress(response.data.progress);
        setStatusMessage(response.data.progress_status);

        if (response.data.status === "finished") {
          clearInterval(intervalId);
          setFinalResult(response.data.result);
          setStatus("success");
        } else if (response.data.status === "failed") {
          clearInterval(intervalId);
          setStatus("error");
        }
      } catch (error) {
        console.error("Polling error:", error);
        clearInterval(intervalId);
        setStatus("error");
      }
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [jobId]);

  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      handleReset();
      setFile(selectedFile);
    } else {
      alert("Please select a valid video file.");
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
      e.dataTransfer.clearData();
    }
  };

  const handleReset = () => {
    setFile(null);
    setStatus("idle");
    setUploadProgress(0);
    setJobId(null);
    setAnalysisProgress(0);
    setFinalResult(null);
    setStatusMessage("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  async function handleFileUpload() {
    if (!file) return;
    setStatus("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(API_BASE_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (ProgressEvent) => {
          const total = ProgressEvent.total || 0;
          const progress = total
            ? Math.round((ProgressEvent.loaded * 100) / total)
            : 0;
          setUploadProgress(progress);
        },
      });

      setUploadProgress(100);
      setJobId(response.data.job_id);
      setStatus("processing");
    } catch {
      setStatus("error");
    }
  }
  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  return (
    <div
      className="min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-left-bottom bg-no-repeat bg-fixed"
      style={{
        backgroundImage: `url(${backgroundImage})`,
      }}
    >
      <div className="fixed inset-0 bg-black opacity-60"></div>

      <div className="relative z-10 w-full max-w-2xl mx-auto rounded-lg p-8">
        {/* Idle State */}
        {status === "idle" && (
          <div className="w-full text-center ">
            <div
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`mx-auto max-w-lg h-96 rounded-2xl flex flex-col items-center justify-center p-8 transition-all duration-300 ${
                isDragging
                  ? "border-4 border-dashed border-white bg-opacity-40"
                  : "border-2 border-dashed border-gray-400 bg-opacity-20"
              }`}
              style={{ backgroundColor: "rgba(255, 255, 255, 0.2)" }}
            >
              <p className="font-semibold text-white text-lg mt-4">
                {file ? file.name : "Drag and drop a video file"}
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
            <button
              onClick={handleFileUpload}
              disabled={!file}
              className="mt-6 w-full max-w-md inline-flex items-center justify-center px-4 py-2 text-white font-semibold rounded-md shadow-sm disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
              style={{ backgroundColor: "#337037" }}
            >
              Analyze Video
            </button>
            <input
              type="file"
              id="video-file-input"
              ref={fileInputRef}
              name="file"
              accept="video/*"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        )}

        {/* Uploading State */}
        {status === "uploading" && (
          <div className="w-full text-center">
            <div className="flex items-center justify-center mb-4">
              <LoaderIcon />
              <h2 className="text-2xl font-semibold text-white">
                Uploading...
              </h2>
            </div>
            <p className="text-white mb-4">{file?.name}</p>
            <div className="w-full bg-white rounded-full h-4 overflow-hidden">
              <div
                className="bg-indigo-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          </div>
        )}

        {/* Processing State */}
        {status === "processing" && (
          <div className="w-full text-center">
            <div className="flex items-center justify-center mb-4">
              <LoaderIcon />
              <h2 className="text-2xl font-semibold text-white">
                Analysis in Progress
              </h2>
            </div>

            <div className="w-full bg-white rounded-full h-4 overflow-hidden">
              <div
                className=" h-4 rounded-full transition-all duration-300"
                style={{
                  width: `${analysisProgress}%`,
                  backgroundColor: "#C29945",
                }}
              ></div>
            </div>
            <p className="text-white mt-4 pulsating-text">{statusMessage}</p>
          </div>
        )}

        {/* Success State */}
        {status === "success" && (
          <div className="w-full text-center">
            <div className="flex items-center justify-center mb-4 space-x-4">
              <ResultIcon />
              <h2 className="text-2xl font-semibold text-white">
                Analysis Complete!
              </h2>
            </div>
            <div className="space-y-4 mt-6">
              {finalResult && finalResult.length > 0 ? (
                finalResult.map((event, index) => (
                  <Results key={index} result={event} />
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
        )}

        {/* Error State */}
        {status === "error" && (
          <div className="w-full text-center">
            <h2 className="text-2xl font-semibold text-red-700">
              An Error Occurred
            </h2>
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
        )}
      </div>
    </div>
  );
}
