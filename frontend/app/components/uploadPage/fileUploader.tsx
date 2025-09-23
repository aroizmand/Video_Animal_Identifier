import { useState, type ChangeEvent, useEffect } from "react";
import axios from "axios";
import { Results, type ResultEvent } from "./results";

type UploadStatus = "idle" | "uploading" | "processing" | "success" | "error";

export function FileUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<UploadStatus>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [jobId, setJobId] = useState(null);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [finalResult, setFinalResult] = useState<ResultEvent[] | null>(null);
  const [statusMessage, setStatusMessage] = useState();

  useEffect(() => {
    if (!jobId) {
      return;
    }

    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(
          `https://video-animal-identifier-backend.onrender.com/results/${jobId}`
        );

        setAnalysisProgress(response.data.progress);
        setStatusMessage(response.data.progress_status);
        console.log(response.data.progress_status);
        console.log(response.data.result);

        if (
          response.data.status === "finished" ||
          response.data.status === "failed"
        ) {
          clearInterval(intervalId);
          setFinalResult(response.data.result);
          setStatus("success");
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

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    if (e.target.files) {
      setFile(e.target.files[0]);
    }
  }

  function handleReset() {
    setUploadProgress(0);
    setJobId(null);
    setFinalResult(null);
    setFile(null);
    setAnalysisProgress(0);
    setStatus("idle");
  }

  async function handleFileUpload() {
    if (!file) return;
    setStatus("uploading");
    setUploadProgress(0);

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(
        "https://video-animal-identifier-backend.onrender.com",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
          onUploadProgress: (ProgressEvent) => {
            const progress = ProgressEvent.total
              ? Math.round((ProgressEvent.loaded * 100) / ProgressEvent.total)
              : 0;
            setUploadProgress(progress);
          },
        }
      );

      setUploadProgress(100);
      setJobId(response.data.job_id);
      setStatus("processing");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-4">
      <input type="file" onChange={handleFileChange} />
      {file && (
        <div className="mb-4 text-sm">
          <p>File Name: {file.name}</p>
          <p>Size: {(file.size / 1024).toFixed(2)} KB</p>
          <p>Type: {file.type}</p>
        </div>
      )}
      {status === "uploading" && (
        <div className="space-y-2">
          <div
            className="h-2.5 rounded-full bg-blue-600 transition-all duration-300"
            style={{ width: `${uploadProgress}%` }}
          ></div>
          <p className="text-sm">{uploadProgress}% uploaded</p>
        </div>
      )}
      {file && status !== "uploading" && (
        <button onClick={handleFileUpload}>Upload</button>
      )}
      {status === "processing" && (
        <div className="space-y-2">
          <p className="text-sm">{statusMessage}</p>
        </div>
      )}
      {/*This single block handles all "success" scenarios.*/}
      {status === "success" && (
        <div className="w-full text-center">
          {/* You can have a common header for the success state */}
          <div className="flex items-center justify-center mb-4">
            <h2 className="text-2xl font-semibold text-gray-700">
              Analysis Complete!
            </h2>
          </div>

          {/* The container for the main content */}
          <div className="space-y-4">
            {/* Now, use a conditional (ternary operator) to decide what to show inside.
              First, check that finalResult exists and has items in it.
            */}
            {finalResult && finalResult.length > 0 ? (
              // If there ARE results, map over the array and display them.
              finalResult.map((event, index) => (
                <Results key={index} result={event} />
              ))
            ) : (
              // Otherwise, if the result is empty or null, show the "no sightings" message.
              <p className="text-gray-600">
                No animal sightings were found in this video.
              </p>
            )}
          </div>

          {/* A common "reset" button for the success state */}
          <button onClick={handleReset} className="mt-6 ...">
            Analyze Another Video
          </button>
        </div>
      )}
      {status === "error" && (
        <p className="mt-2 text-sm text-red-600">
          Upload Failed. Please try again.
        </p>
      )}
    </div>
  );
}
