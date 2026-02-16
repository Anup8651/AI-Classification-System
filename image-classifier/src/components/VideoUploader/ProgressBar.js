import React from 'react';

const ProgressBar = ({ progress }) => {
  if (progress === 0) return null;

  return (
    <div className="progress-container">
      <div className="progress-bar">
        <div
          className="progress-fill"
          style={{
            width: `${progress}%`,
          }}
        />
      </div>
      <div className="progress-text">{progress}% - Processing video frames...</div>
    </div>
  );
};

export default ProgressBar;
