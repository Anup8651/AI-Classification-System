import React from 'react';

const Predictions = ({ predictions, usingWebcam }) => {
  if (predictions.length === 0) return null;

  if (usingWebcam) {
    // Webcam mode: show only top prediction
    return (
      <div style={{ marginTop: 20 }}>
        <p style={{ fontSize: 14, color: "#666", marginBottom: 5 }}>Detected:</p>
        <p style={{ fontSize: 18, fontWeight: "bold" }}>
          {predictions[0].className} — {(predictions[0].probability * 100).toFixed(1)}%
        </p>
      </div>
    );
  }

  // Upload mode: show full list
  return (
    <ul style={{ listStyle: "none", padding: 0, marginTop: 20 }}>
      {predictions.map((p, i) => (
        <li key={i}>
          <b>{p.className}</b> — {(p.probability * 100).toFixed(1)}%
        </li>
      ))}
    </ul>
  );
};

export default Predictions;
