import React from 'react';

const ManualAnalysis = ({ 
  showManualInput, 
  manualData, 
  onManualDataChange, 
  onAnalyzeImage, 
  hideManualButton,
  savedAnalysis 
}) => {
  const submitAnalysis = () => {
    onAnalyzeImage();
  };

  if (savedAnalysis) {
    return (
      <div style={{ 
        background: "#e3f2fd", 
        padding: 15, 
        borderRadius: 12, 
        marginBottom: 20,
        textAlign: "left",
        border: "2px solid #2196f3"
      }}>
        <h4 style={{ marginTop: 0, color: "#1565c0" }}>Your Manual Analysis:</h4>
        <p><b>Object in hand:</b> {savedAnalysis.objectInHand || "Not specified"}</p>
        <p><b>AI Accuracy:</b> {savedAnalysis.aiAccuracy || "Not rated"}</p>
        
        <h4 style={{ color: "#d32f2f", marginTop: 15 }}>AI Predictions (for comparison):</h4>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {savedAnalysis.aiPredictions.map((p, i) => (
            <li key={i} style={{ marginBottom: 5 }}>
              <b>{p.className}</b> — {(p.probability * 100).toFixed(1)}%
            </li>
          ))}
        </ul>
        
        {savedAnalysis.aiAccuracy === "INCORRECT" && (
          <p style={{ color: "#d32f2f", fontWeight: "bold", marginTop: 10 }}>
            ⚠️ AI gave FAKE/WRONG analysis! You correctly identified: {savedAnalysis.objectInHand}
          </p>
        )}
      </div>
    );
  }

  if (showManualInput) {
    return (
      <div style={{ 
        background: "#f5f5f5", 
        padding: 15, 
        borderRadius: 12, 
        marginBottom: 20,
        textAlign: "left"
      }}>
        <h4 style={{ marginTop: 0, color: "#333" }}>Manual Analysis:</h4>
        
        <div style={{ marginBottom: 10 }}>
          <label><b>Object in hand:</b></label>
          <input 
            type="text"
            value={manualData.objectInHand}
            onChange={(e) => onManualDataChange({...manualData, objectInHand: e.target.value})}
            placeholder="Enter object name or 'unclear' if not visible"
            style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 4, border: "1px solid #ccc" }}
          />
        </div>
        
        <div style={{ marginBottom: 10 }}>
          <label><b>AI Prediction Accuracy:</b></label>
          <select 
            value={manualData.aiAccuracy}
            onChange={(e) => onManualDataChange({...manualData, aiAccuracy: e.target.value})}
            style={{ width: "100%", padding: 8, marginTop: 4, borderRadius: 4, border: "1px solid #ccc" }}
          >
            <option value="">Select...</option>
            <option value="CORRECT">CORRECT - AI matches my analysis</option>
            <option value="INCORRECT">INCORRECT - AI is wrong</option>
            <option value="PARTIAL">PARTIAL - AI is close but not exact</option>
          </select>
        </div>
        
        <button
          onClick={submitAnalysis}
          style={{
            marginTop: 10,
            padding: "10px 20px",
            background: "#4caf50",
            color: "#fff",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            width: "100%"
          }}
        >
          Save Analysis
        </button>
      </div>
    );
  }

  return null;
};

export default ManualAnalysis;
