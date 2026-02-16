import React from 'react';

const AnalysisButton = ({ usingWebcam, imageSrc, hideManualButton, onAnalyzeImage }) => {
  if ((usingWebcam || imageSrc) && !hideManualButton) {
    return (
      <button
        onClick={onAnalyzeImage}
        style={{
          marginBottom: 20,
          padding: "10px 20px",
          background: "#673ab7",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        Analyze Image (Manual)
      </button>
    );
  }
  return null;
};

export default AnalysisButton;
