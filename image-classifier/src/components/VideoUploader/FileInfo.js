import React from 'react';

const FileInfo = ({ selectedFile }) => {
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  if (!selectedFile) return null;

  return (
    <div className="file-info">
      <div className="file-detail">
        <strong>File:</strong> {selectedFile.name}
      </div>
      <div className="file-detail">
        <strong>Size:</strong> {formatFileSize(selectedFile.size)}
      </div>
      <div className="file-detail">
        <strong>Type:</strong> {selectedFile.type || "video/unknown"}
      </div>
    </div>
  );
};

export default FileInfo;
