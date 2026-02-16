import React from 'react';

const WebcamView = ({ videoRef, videoReady, onStartVideo }) => {
  return (
    <>
      <div style={{ position: "relative", width: 300, height: 300, margin: "auto" }}>
        <video
          ref={videoRef}
          muted
          playsInline
          autoPlay
          width="300"
          height="300"
          style={{ borderRadius: 12, background: "#000" }}
        />

        {!videoReady && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "#222",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#aaa",
              borderRadius: 12
            }}
          >
            Waiting for video...
          </div>
        )}
      </div>

      {!videoReady && (
        <button
          onClick={onStartVideo}
          style={{
            marginTop: 10,
            padding: "8px 16px",
            background: "#ff9800",
            border: "none",
            borderRadius: 6,
            color: "#fff",
            cursor: "pointer"
          }}
        >
          Start Video
        </button>
      )}
    </>
  );
};

export default WebcamView;
