import React, { useState } from 'react';
import './VideoUploader.css';

import FileUpload from './FileUpload';
import FileInfo from './FileInfo';
import UploadButton from './UploadButton';
import ProgressBar from './ProgressBar';
import ErrorMessage from './ErrorMessage';
import Results from './Results';

const VideoUploader = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);

  const API_URL = "https://ai-classification-system.onrender.com";

  const handleFileSelect = ({ file, error: fileError }) => {
    if (fileError) {
      setError(fileError);
      return;
    }
    
    setSelectedFile(file);
    setError(null);
    setResult(null);
    setProgress(0);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setError("Please select a video file first");
      return;
    }

    setUploading(true);
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("num_frames", "10");
    formData.append("aggregation_method", "average");

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 5 : prev));
      }, 1000);

      const response = await fetch(`${API_URL}/predict-video`, {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      console.error("Upload error:", err);
      setError(err.message || "Failed to upload video. Make sure the backend server is running on port 8000.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="video-uploader-container">
      <h2 className="video-uploader-title">Video Classification</h2>
      <p className="video-uploader-subtitle">Upload a video to classify its content using AI</p>

      <FileUpload selectedFile={selectedFile} onFileSelect={handleFileSelect} />
      <FileInfo selectedFile={selectedFile} />
      
      {selectedFile && (
        <UploadButton 
          uploading={uploading} 
          onUpload={handleUpload} 
          disabled={uploading} 
        />
      )}

      <ProgressBar progress={progress} />
      <ErrorMessage error={error} />
      <Results result={result} />
    </div>
  );
};

export default VideoUploader;
