import React from 'react';

const FileUpload = ({ selectedFile, onFileSelect }) => {
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const validTypes = ['video/mp4', 'video/avi', 'video/quicktime', 'video/x-matroska', 'video/webm'];
      const validExtensions = ['.mp4', '.avi', '.mov', '.mkv', '.webm', '.flv', '.wmv'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!validTypes.includes(file.type) && !validExtensions.includes(fileExtension)) {
        onFileSelect({ error: "Please select a valid video file (MP4, AVI, MOV, MKV, WEBM, FLV, WMV)" });
        return;
      }
      
      // Validate file size (max 500MB)
      if (file.size > 500 * 1024 * 1024) {
        onFileSelect({ error: "File size too large. Maximum allowed is 500MB." });
        return;
      }
      
      onFileSelect({ file });
    }
  };

  return (
    <div className="upload-area">
      <input
        type="file"
        accept="video/*,.mp4,.avi,.mov,.mkv,.webm,.flv,.wmv"
        onChange={handleFileSelect}
        className="file-input"
        id="video-upload"
      />
      <label htmlFor="video-upload" className="upload-label">
        <div className="upload-icon">📹</div>
        <div className="upload-text">
          {selectedFile ? selectedFile.name : "Click to select video or drag & drop"}
        </div>
        <div className="upload-hint">
          Supported: MP4, AVI, MOV, MKV, WEBM (Max 500MB)
        </div>
      </label>
    </div>
  );
};

export default FileUpload;
