import React, { useState, useRef, useEffect } from "react";
import * as mobilenet from "@tensorflow-models/mobilenet";
import "@tensorflow/tfjs";

import WebcamControls from './WebcamControls';
import WebcamView from './WebcamView';
import ImageView from './ImageView';
import ManualAnalysis from './ManualAnalysis';
import AnalysisButton from './AnalysisButton';
import Predictions from './Predictions';

const ImageClassifier = () => {
  const [model, setModel] = useState(null);
  const [predictions, setPredictions] = useState([]);
  const [imageSrc, setImageSrc] = useState(null);
  const [usingWebcam, setUsingWebcam] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const [status, setStatus] = useState("Ready. Upload image or start webcam.");
  
  // Manual analysis states
  const [showManualInput, setShowManualInput] = useState(false);
  const [hideManualButton, setHideManualButton] = useState(false);
  const [manualData, setManualData] = useState({
    mainSubject: "",
    objectInHand: "",
    sceneDescription: "",
    confidence: "High",
    aiAccuracy: ""
  });
  const [savedAnalysis, setSavedAnalysis] = useState(null);

  const videoRef = useRef(null);
  const imageRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  /* ---------------- LOAD MODEL ---------------- */
  useEffect(() => {
    const loadModel = async () => {
      setStatus("Loading AI model...");
      const loadedModel = await mobilenet.load({ version: 2, alpha: 0.5 });
      setModel(loadedModel);
      setStatus("Model loaded successfully");
    };
    loadModel();
  }, []);

  /* ---------------- START / STOP WEBCAM ---------------- */
  const toggleWebcam = async () => {
    // STOP
    if (usingWebcam) {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      clearInterval(intervalRef.current);
      setUsingWebcam(false);
      setVideoReady(false);
      setPredictions([]);
      setStatus("Webcam stopped");
      return;
    }

    // START
    try {
      setStatus("Requesting camera access...");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" }
      });

      streamRef.current = stream;
      setUsingWebcam(true);
      setHideManualButton(false);
      setImageSrc(null);
    } catch (err) {
      setStatus("Camera access denied or unavailable");
      console.error(err);
    }
  };

  // Attach stream to video element after it renders
  useEffect(() => {
    if (usingWebcam && streamRef.current && videoRef.current) {
      videoRef.current.srcObject = streamRef.current;

      videoRef.current.onloadedmetadata = async () => {
        try {
          await videoRef.current.play();
          setVideoReady(true);
          setStatus("Webcam active – live classification running");
        } catch (err) {
          console.log("Autoplay blocked:", err);
          setStatus("Click Start Video to enable camera");
        }
      };
    }
  }, [usingWebcam]);

  /* ---------------- MANUAL PLAY BUTTON ---------------- */
  const forcePlay = async () => {
    if (!videoRef.current) {
      setStatus("Video element not ready");
      return;
    }
    try {
      await videoRef.current.play();
      setVideoReady(true);
      setStatus("Webcam active – live classification running");
    } catch (e) {
      console.error("Play failed:", e);
      setStatus("Browser blocked video playback: " + e.message);
    }
  };

  /* ---------------- LIVE CLASSIFICATION ---------------- */
  useEffect(() => {
    if (!model || !usingWebcam || !videoReady) return;

    intervalRef.current = setInterval(async () => {
      if (videoRef.current?.readyState >= 2) {
        const results = await model.classify(videoRef.current, 5);
        setPredictions(results);
      }
    }, 1500);

    return () => clearInterval(intervalRef.current);
  }, [model, usingWebcam, videoReady]);

  /* ---------------- IMAGE UPLOAD ---------------- */
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (usingWebcam) toggleWebcam();

    const src = URL.createObjectURL(file);
    setImageSrc(src);
    setPredictions([]);
    setShowManualInput(false);
    setSavedAnalysis(null);
    setHideManualButton(true);
    setStatus("Analyzing image...");
  };

  const classifyImage = async () => {
    if (model && imageRef.current) {
      const results = await model.classify(imageRef.current, 5);
      setPredictions(results);
      setStatus("Analysis complete");
    }
  };

  /* ---------------- MANUAL ANALYSIS ---------------- */
  const analyzeImage = () => {
    setShowManualInput(true);
    setSavedAnalysis(null);
    setManualData({
      objectInHand: "",
      aiAccuracy: ""
    });
  };

  const submitAnalysis = () => {
    setSavedAnalysis({
      objectInHand: manualData.objectInHand,
      aiAccuracy: manualData.aiAccuracy,
      aiPredictions: predictions
    });
    setShowManualInput(false);
  };

  return (
    <div className="image-classifier-container">
      <h2>Image Classifier + Webcam</h2>
      <h3>{status}</h3>

      <WebcamControls 
        usingWebcam={usingWebcam}
        onToggleWebcam={toggleWebcam}
        onImageUpload={handleImageUpload}
      />

      {usingWebcam && (
        <WebcamView 
          videoRef={videoRef}
          videoReady={videoReady}
          onStartVideo={forcePlay}
        />
      )}

      <ImageView 
        imageSrc={imageSrc}
        imageRef={imageRef}
        onImageLoad={classifyImage}
      />

      <AnalysisButton 
        usingWebcam={usingWebcam}
        imageSrc={imageSrc}
        hideManualButton={hideManualButton}
        onAnalyzeImage={analyzeImage}
      />

      <ManualAnalysis 
        showManualInput={showManualInput}
        manualData={manualData}
        onManualDataChange={setManualData}
        onAnalyzeImage={submitAnalysis}
        hideManualButton={hideManualButton}
        savedAnalysis={savedAnalysis}
      />

      <Predictions 
        predictions={predictions}
        usingWebcam={usingWebcam}
      />
    </div>
  );
};

export default ImageClassifier;
