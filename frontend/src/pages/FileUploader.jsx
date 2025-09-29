import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { API_BASE_URL, MAX_UPLOAD_SIZE } from "../config";
import backgroundImage from "../assets/background.jpg";
import "../index.css";
import { UploadingView } from "../components/VideoUpload/UploadingView";
import { ProcessingView } from "../components/VideoUpload/ProcessingView";
import { IdleView } from "../components/VideoUpload/IdleView";
import { ErrorView } from "../components/VideoUpload/ErrorView";
import { SuccessView } from "../components/VideoUpload/SuccessView";

export function FileUploader() {
  const [file, setFile] = useState(null);
  const [status, setStatus] = useState("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [jobId, setJobId] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [finalResult, setFinalResult] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState("");

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!jobId) return;
    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/results/${jobId}`);
        setAnalysisProgress(response.data.progress);
        setStatusMessage(response.data.progress_status);

        if (response.data.status === "finished") {
          clearInterval(intervalId);

          let resultData = response.data.result;

          if (typeof resultData === "string") {
            try {
              resultData = JSON.parse(resultData);
            } catch (e) {
              console.error("Failed to parse result JSON string:", e);
              resultData = null;
            }
          }

          if (Array.isArray(resultData)) {
            setFinalResult(resultData);
          } else {
            console.warn(
              "Result data is not an array, defaulting to empty:",
              resultData
            );
            setFinalResult([]);
          }

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
    return () => clearInterval(intervalId);
  }, [jobId]);

  const handleFile = (selectedFile) => {
    setFileError("");
    if (!selectedFile) return;
    if (!selectedFile.type.startsWith("video/")) {
      setFileError("Invalid file type. Please select a video.");
      return;
    }
    if (selectedFile.size > MAX_UPLOAD_SIZE) {
      const maxSizeMB = MAX_UPLOAD_SIZE / 1024 / 1024;
      setFileError(`File is too large. Maximum size is ${maxSizeMB} MB.`);
      return;
    }
    handleReset(true);
    setFile(selectedFile);
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

  const handleReset = (keepFile = false) => {
    if (!keepFile) setFile(null);
    setStatus("idle");
    setUploadProgress(0);
    setJobId(null);
    setAnalysisProgress(0);
    setFinalResult(null);
    setStatusMessage("");
    setFileError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  async function handleFileUpload() {
    if (!file) return;
    setStatus("uploading");
    setUploadProgress(0);
    setFileError("");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(API_BASE_URL, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        onUploadProgress: (progressEvent) => {
          const total = progressEvent.total || 0;
          const progress = total
            ? Math.round((progressEvent.loaded * 100) / total)
            : 0;
          setUploadProgress(progress);
        },
      });
      setUploadProgress(100);
      setJobId(response.data.job_id);
      setStatus("processing");
    } catch (error) {
      if (error.response && error.response.status === 413) {
        setFileError("File is too large. Maximum size is 100 MB.");
      } else {
        setFileError("An error occurred during upload. Please try again.");
      }
      setStatus("idle");
    }
  }

  const triggerFileSelect = () => fileInputRef.current?.click();

  const pulsatingAnimationStyle = `
    @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.7; } }
    .pulsating-text { animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  `;

  return (
    <>
      <style>{pulsatingAnimationStyle}</style>
      <div
        className="min-h-screen w-full flex flex-col items-center justify-center bg-cover bg-left-bottom bg-no-repeat bg-fixed"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      >
        <div className="fixed inset-0 bg-black opacity-60"></div>
        <div className="relative z-10 w-full max-w-2xl mx-auto rounded-lg p-8">
          <input
            type="file"
            id="video-file-input"
            ref={fileInputRef}
            name="file"
            accept="video/*"
            onChange={handleFileChange}
            className="hidden"
          />

          {status === "idle" && (
            <IdleView
              file={file}
              fileError={fileError}
              isDragging={isDragging}
              handleDragEnter={handleDragEnter}
              handleDragLeave={handleDragLeave}
              handleDragOver={handleDragOver}
              handleDrop={handleDrop}
              triggerFileSelect={triggerFileSelect}
              handleFileUpload={handleFileUpload}
            />
          )}

          {status === "uploading" && (
            <UploadingView
              fileName={file?.name}
              uploadProgress={uploadProgress}
            />
          )}
          {status === "processing" && (
            <ProcessingView
              analysisProgress={analysisProgress}
              statusMessage={statusMessage}
            />
          )}
          {status === "success" && (
            <SuccessView
              finalResult={finalResult}
              handleReset={() => handleReset(false)}
            />
          )}

          {status === "error" && (
            <ErrorView handleReset={() => handleReset(false)} />
          )}
        </div>
      </div>
    </>
  );
}
