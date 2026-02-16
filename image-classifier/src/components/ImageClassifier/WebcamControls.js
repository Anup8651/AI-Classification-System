import React from 'react';

const WebcamControls = ({ usingWebcam, onToggleWebcam, onImageUpload }) => {
  return (
    <div style={{ marginBottom: 20 }}>
      <button
        onClick={onToggleWebcam}
        style={{
          padding: "10px 20px",
          background: usingWebcam ? "#d32f2f" : "#1976d2",
          color: "#fff",
          border: "none",
          borderRadius: 6,
          marginRight: 15
        }}
      >
        {usingWebcam ? "Stop Webcam" : "Start Webcam"}
      </button>

      <label
        style={{
          padding: "10px 20px",
          background: "#388e3c",
          color: "#fff",
          borderRadius: 6,
          cursor: "pointer"
        }}
      >
        Upload Image
        <input type="file" hidden accept="image/*" onChange={onImageUpload} />
      </label>
    </div>
  );
};

export default WebcamControls;
