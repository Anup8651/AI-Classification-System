# import os
import os
import gc  # <--- ADD THIS LINE
# ... rest of your imports
# Hide annoying TensorFlow logs (oneDNN custom operations)
os.environ['TF_ENABLE_ONEDNN_OPTS'] = '0'

from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import cv2
import numpy as np
import tensorflow as tf
from tensorflow import keras
import tempfile
import logging
from typing import List, Dict
import shutil
from pathlib import Path

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Video Classification API",
    description="AI-powered video classification using TensorFlow and OpenCV",
    version="1.0.0"
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://ai-classification-system.vercel.app",
    "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global model variable
model = None
model_labels = None

def load_model():
    """Load MobileNetV2 model pre-trained on ImageNet"""
    global model, model_labels
    try:
        logger.info("Loading MobileNetV2 model...")
        model = keras.applications.MobileNetV2(weights="imagenet", include_top=True)
        
        # Load ImageNet labels
        if os.path.exists("imagenet_labels.txt"):
            with open("imagenet_labels.txt", "r") as f:
                model_labels = [line.strip() for line in f.readlines()]
        
        logger.info("Model loaded successfully!")
    except Exception as e:
        logger.error(f"Error loading model: {e}")
        model_labels = None

def create_imagenet_labels_file():
    """Create ImageNet labels file if it doesn't exist"""
    if not os.path.exists("imagenet_labels.txt"):
        try:
            # Download labels from keras
            labels_path = keras.utils.get_file(
                'ImageNetLabels.txt',
                'https://storage.googleapis.com/download.tensorflow.org/data/ImageNetLabels.txt'
            )
            with open(labels_path, 'r') as f:
                labels = f.read().splitlines()
            with open("imagenet_labels.txt", "w") as f:
                for label in labels:
                    f.write(label + "\n")
            logger.info("Created ImageNet labels file")
        except Exception as e:
            logger.warning(f"Could not create labels file: {e}")

@app.on_event("startup")
async def startup_event():
    """Initialize model on startup"""
    create_imagenet_labels_file()
    load_model()

def preprocess_frame(frame: np.ndarray) -> np.ndarray:
    """Preprocess frame for MobileNetV2"""
    # Resize to 224x224 (MobileNetV2 input size)
    frame_resized = cv2.resize(frame, (224, 224))
    # Convert BGR to RGB
    frame_rgb = cv2.cvtColor(frame_resized, cv2.COLOR_BGR2RGB)
    # Normalize to [0, 1]
    frame_normalized = frame_rgb / 255.0
    # Add batch dimension
    frame_batch = np.expand_dims(frame_normalized, axis=0)
    return frame_batch

def classify_frame(frame: np.ndarray) -> List[Dict]:
    """Classify a single frame using MobileNetV2"""
    global model
    
    if model is None:
        raise HTTPException(status_code=503, detail="Model not loaded")
    
    try:
        # Preprocess frame
        processed_frame = preprocess_frame(frame)
        
        # Make prediction
        predictions = model.predict(processed_frame, verbose=0)
        
        # Decode predictions
        decoded_predictions = keras.applications.mobilenet_v2.decode_predictions(
            predictions, top=5
        )[0]
        
        results = []
        for i, (imagenet_id, label, score) in enumerate(decoded_predictions):
            results.append({
                "rank": i + 1,
                "class_id": imagenet_id,  # FIXED: Removed int() wrapper here
                "class_name": label,
                "probability": float(score),
                "confidence_percent": round(float(score) * 100, 2)
            })
        
        return results
    except Exception as e:
        logger.error(f"Error classifying frame: {e}")
        raise HTTPException(status_code=500, detail=f"Classification error: {str(e)}")

 # Ensure this is at the top of your main.py

def extract_frames(video_path: str, num_frames: int = 10):
    """Extract and RESIZE frames immediately to save memory"""
    frames = []
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        raise HTTPException(status_code=400, detail="Cannot open video file")
    
    # Get video properties
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    duration = total_frames / fps if fps > 0 else 0
    
    logger.info(f"Video info: {total_frames} frames, {fps} FPS, {duration:.2f}s duration")
    
    if total_frames == 0:
        cap.release()
        raise HTTPException(status_code=400, detail="Video file is empty")
    
    # Calculate frame indices to extract
    if total_frames <= num_frames:
        frame_indices = list(range(total_frames))
    else:
        step = total_frames / num_frames
        frame_indices = [int(i * step) for i in range(num_frames)]
    
    for frame_idx in frame_indices:
        cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
        ret, frame = cap.read()
        if ret:
            # --- MEMORY OPTIMIZATION ---
            # Resize the frame IMMEDIATELY to 224x224 (MobileNet input size)
            # This saves over 80% RAM compared to full-res frames
            resized_frame = cv2.resize(frame, (224, 224))
            frames.append(resized_frame)
            
            # Explicitly delete the big raw frame and trigger cleanup
            del frame
            gc.collect() 
            # ---------------------------
    
    cap.release()
    
    if not frames:
        raise HTTPException(status_code=400, detail="Could not extract any frames")
    
    logger.info(f"Successfully extracted {len(frames)} optimized frames")
    return frames, total_frames, fps, duration
def aggregate_predictions(frame_predictions: List[List[Dict]], method: str = "average") -> Dict:
    """Aggregate predictions from multiple frames"""
    if not frame_predictions:
        return {}
    
    # Collect all class scores
    class_scores = {}
    class_names = {}
    
    for frame_result in frame_predictions:
        for pred in frame_result:
            class_id = pred["class_id"]
            class_name = pred["class_name"]
            probability = pred["probability"]
            
            if class_id not in class_scores:
                class_scores[class_id] = []
                class_names[class_id] = class_name
            
            class_scores[class_id].append(probability)
    
    # Calculate aggregated scores
    aggregated = []
    for class_id, scores in class_scores.items():
        if method == "average":
            aggregated_score = sum(scores) / len(scores)
        elif method == "max":
            aggregated_score = max(scores)
        elif method == "weighted":
            # Weight by position (earlier frames get higher weight)
            weights = [1.0 / (i + 1) for i in range(len(scores))]
            total_weight = sum(weights)
            aggregated_score = sum(s * w for s, w in zip(scores, weights)) / total_weight
        else:
            aggregated_score = sum(scores) / len(scores)
        
        aggregated.append({
            "class_id": class_id,
            "class_name": class_names[class_id],
            "aggregated_probability": aggregated_score,
            "confidence_percent": round(aggregated_score * 100, 2),
            "frames_detected": len(scores),
            "max_single_frame_prob": round(max(scores) * 100, 2)
        })
    
    # Sort by aggregated probability
    aggregated.sort(key=lambda x: x["aggregated_probability"], reverse=True)
    
    return {
        "top_prediction": aggregated[0] if aggregated else None,
        "all_predictions": aggregated[:10],  # Return top 10
        "aggregation_method": method,
        "total_unique_classes": len(aggregated)
    }

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "Video Classification API",
        "status": "running",
        "model_loaded": model is not None,
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "opencv_version": cv2.__version__,
        "tensorflow_version": tf.__version__
    }

@app.post("/predict-video")
async def predict_video(
    file: UploadFile = File(...),
    num_frames: int = 10,
    aggregation_method: str = "average"
):
    """
    Classify a video file
    """
    # Validate file type
    allowed_extensions = {'.mp4', '.avi', '.mov', '.mkv', '.flv', '.wmv', '.webm'}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400, 
            detail=f"Unsupported file format: {file_ext}. Allowed: {allowed_extensions}"
        )
    
    # Limit num_frames for performance
    num_frames = min(max(num_frames, 1), 30)
    
    # Validate aggregation method
    valid_methods = {"average", "max", "weighted"}
    if aggregation_method not in valid_methods:
        aggregation_method = "average"
    
    temp_file = None
    try:
        # Save uploaded file temporarily
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_file = tmp.name
        
        logger.info(f"Processing video: {file.filename} ({file.size} bytes)")
        
        # Extract frames
        frames, total_frames, fps, duration = extract_frames(temp_file, num_frames)
        
        # Classify each frame
        frame_predictions = []
        frame_details = []
        
        for i, frame in enumerate(frames):
            predictions = classify_frame(frame)
            frame_predictions.append(predictions)
            frame_details.append({
                "frame_index": i + 1,
                "timestamp": round((i / len(frames)) * duration, 2) if duration > 0 else 0,
                "top_prediction": predictions[0] if predictions else None
            })
            
            # --- MOVE THIS LINE INSIDE THE LOOP ---
            gc.collect()
            # ----------------------------------------
        # Aggregate predictions
        aggregated_result = aggregate_predictions(frame_predictions, aggregation_method)
        
        # Prepare response
        response = {
            "success": True,
            "filename": file.filename,
            "video_info": {
                "total_frames": total_frames,
                "fps": round(fps, 2),
                "duration_seconds": round(duration, 2),
                "frames_analyzed": len(frames)
            },
            "classification": {
                "aggregation_method": aggregation_method,
                "primary_prediction": aggregated_result["top_prediction"],
                "alternative_predictions": aggregated_result["all_predictions"][1:6],  # Top 5 alternatives
                "confidence_breakdown": {
                    "very_high": len([p for p in aggregated_result["all_predictions"] if p["confidence_percent"] >= 80]),
                    "high": len([p for p in aggregated_result["all_predictions"] if 60 <= p["confidence_percent"] < 80]),
                    "medium": len([p for p in aggregated_result["all_predictions"] if 40 <= p["confidence_percent"] < 60]),
                    "low": len([p for p in aggregated_result["all_predictions"] if p["confidence_percent"] < 40])
                }
            },
            "frame_analysis": {
                "summary": f"Analyzed {len(frames)} frames from video",
                "frame_predictions": frame_details[:5]  # Show first 5 frames
            }
        }
        
        return JSONResponse(content=response)
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing video: {e}")
        raise HTTPException(status_code=500, detail=f"Video processing error: {str(e)}")
    
    finally:
        # Cleanup temp file
        if temp_file and os.path.exists(temp_file):
            try:
                os.remove(temp_file)
                logger.info(f"Cleaned up temp file: {temp_file}")
            except Exception as e:
                logger.error(f"Error cleaning up temp file: {e}")

@app.post("/predict-frame")
async def predict_frame(file: UploadFile = File(...)):
    """Classify a single image/frame (for testing)"""
    allowed_extensions = {'.jpg', '.jpeg', '.png', '.bmp', '.webp'}
    file_ext = Path(file.filename).suffix.lower()
    
    if file_ext not in allowed_extensions:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported image format: {file_ext}"
        )
    
    temp_file = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=file_ext) as tmp:
            shutil.copyfileobj(file.file, tmp)
            temp_file = tmp.name
        
        # Read and classify
        frame = cv2.imread(temp_file)
        if frame is None:
            raise HTTPException(status_code=400, detail="Cannot read image file")
        
        predictions = classify_frame(frame)
        
        return JSONResponse(content={
            "success": True,
            "filename": file.filename,
            "predictions": predictions
        })
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error processing image: {e}")
        raise HTTPException(status_code=500, detail=f"Image processing error: {str(e)}")
    
    finally:
        if temp_file and os.path.exists(temp_file):
            os.remove(temp_file)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)