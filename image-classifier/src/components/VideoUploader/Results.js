import React from 'react';

const Results = ({ result }) => {
  if (!result || !result.success) return null;

  return (
    <div className="results-container">
      <h3 className="results-title">🎯 Classification Results</h3>

      {/* Primary Prediction */}
      {result.classification?.primary_prediction && (
        <div className="primary-prediction">
          <div className="prediction-label">Primary Classification</div>
          <div className="primary-class-name">
            {result.classification.primary_prediction.class_name}
          </div>
          <div className="confidence-badge">
            {result.classification.primary_prediction.confidence_percent}% Confidence
          </div>
          <div className="detected-info">
            Detected in {result.classification.primary_prediction.frames_detected} frames
          </div>
        </div>
      )}

      {/* Video Info */}
      <VideoInfo videoInfo={result.video_info} />

      {/* Alternative Predictions */}
      {result.classification?.alternative_predictions?.length > 0 && (
        <AlternativePredictions predictions={result.classification.alternative_predictions} />
      )}

      {/* Frame Analysis */}
      {result.frame_analysis?.frame_predictions?.length > 0 && (
        <FrameAnalysis frames={result.frame_analysis.frame_predictions} />
      )}

      {/* Confidence Breakdown */}
      {result.classification?.confidence_breakdown && (
        <ConfidenceBreakdown breakdown={result.classification.confidence_breakdown} />
      )}
    </div>
  );
};

const VideoInfo = ({ videoInfo }) => {
  if (!videoInfo) return null;

  return (
    <div className="video-info">
      <h4 className="section-title">📹 Video Information</h4>
      <div className="info-grid">
        <div className="info-item">
          <strong>Duration:</strong> {videoInfo.duration_seconds}s
        </div>
        <div className="info-item">
          <strong>FPS:</strong> {videoInfo.fps}
        </div>
        <div className="info-item">
          <strong>Total Frames:</strong> {videoInfo.total_frames}
        </div>
        <div className="info-item">
          <strong>Analyzed:</strong> {videoInfo.frames_analyzed} frames
        </div>
      </div>
    </div>
  );
};

const AlternativePredictions = ({ predictions }) => {
  return (
    <div className="alternatives-section">
      <h4 className="section-title">📋 Alternative Classifications</h4>
      <div className="alternatives-list">
        {predictions.map((pred, index) => (
          <div key={index} className="alternative-item">
            <div className="alt-rank">#{index + 2}</div>
            <div className="alt-name">{pred.class_name}</div>
            <div className="alt-confidence">{pred.confidence_percent}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const FrameAnalysis = ({ frames }) => {
  return (
    <div className="frame-section">
      <h4 className="section-title">🎞️ Frame-by-Frame Analysis</h4>
      <div className="frame-list">
        {frames.map((frame, index) => (
          <div key={index} className="frame-item">
            <div className="frame-timestamp">
              {frame.timestamp}s
            </div>
            <div className="frame-prediction">
              {frame.top_prediction?.class_name}
            </div>
            <div className="frame-confidence">
              {frame.top_prediction?.confidence_percent}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ConfidenceBreakdown = ({ breakdown }) => {
  return (
    <div className="confidence-section">
      <h4 className="section-title">📊 Confidence Distribution</h4>
      <div className="confidence-grid">
        <div className="confidence-box very-high">
          <div className="confidence-value">
            {breakdown.very_high}
          </div>
          <div className="confidence-label">Very High (80%+)</div>
        </div>
        <div className="confidence-box high">
          <div className="confidence-value">
            {breakdown.high}
          </div>
          <div className="confidence-label">High (60-80%)</div>
        </div>
        <div className="confidence-box medium">
          <div className="confidence-value">
            {breakdown.medium}
          </div>
          <div className="confidence-label">Medium (40-60%)</div>
        </div>
        <div className="confidence-box low">
          <div className="confidence-value">
            {breakdown.low}
          </div>
          <div className="confidence-label">Low (&lt;40%)</div>
        </div>
      </div>
    </div>
  );
};

export default Results;
