import { useState, useEffect } from "react";
import axios from "axios";
import { API_BASE_URL } from "../assets/constants";

export function useJobPolling(jobId) {
  const [analysisStatus, setAnalysisStatus] = useState("idle");
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");
  const [finalResult, setFinalResult] = useState(null);

  useEffect(() => {
    if (!jobId) {
      return;
    }

    setAnalysisStatus("processing");
    setStatusMessage("Waiting in queue...");
    setAnalysisProgress(0);

    const intervalId = setInterval(async () => {
      try {
        const response = await axios.get(`${API_BASE_URL}/results/${jobId}`);
        const data = response.data;

        setAnalysisProgress(data.progress || 0);
        setStatusMessage(data.progress_status || "Processing...");

        if (data.status === "finished") {
          clearInterval(intervalId);
          setFinalResult(data.result);
          setAnalysisStatus("success");
        } else if (data.status === "failed") {
          clearInterval(intervalId);
          setAnalysisStatus("error");
        }
      } catch (error) {
        console.error("Polling error:", error);
        clearInterval(intervalId);
        setAnalysisStatus("error");
      }
    }, 3000);

    return () => {
      clearInterval(intervalId);
    };
  }, [jobId]);

  return { analysisStatus, analysisProgress, statusMessage, finalResult };
}
