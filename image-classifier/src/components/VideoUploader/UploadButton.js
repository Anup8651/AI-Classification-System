import React from 'react';

const UploadButton = ({ uploading, onUpload, disabled }) => {
  return (
    <button
      onClick={onUpload}
      disabled={disabled}
      className="upload-button"
    >
      {uploading ? "Analyzing Video..." : "🔍 Classify Video"}
    </button>
  );
};

export default UploadButton;
