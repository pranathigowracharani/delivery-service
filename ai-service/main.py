import cv2
# import mediapipe as mp
import numpy as np
import base64
import io
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from deepface import DeepFace
import uvicorn
from typing import List
import json
import logging
import os

# Configure logging to file
logging.basicConfig(
    filename='debug.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)
logger.info("AI Service starting up...")

app = FastAPI(title="Facial Recognition AI Microservice")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# MediaPipe initialization and EAR calculation removed as blink feature was disabled

# Initialize OpenCV Haar Cascade for robust detection
face_cascade = cv2.CascadeClassifier('haarcascade_frontalface_default.xml')

def detect_and_crop_face(image: np.ndarray):
    """Manually detects and crops face using Haar Cascade as a robust alternative."""
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    faces = face_cascade.detectMultiScale(gray, 1.1, 4)
    if len(faces) == 0:
        return None, None
    
    # Get the largest face
    x, y, w, h = max(faces, key=lambda f: f[2] * f[3])
    face_area = {'x': int(x), 'y': int(y), 'w': int(w), 'h': int(h)}
    
    # Add margin
    margin = 0.2
    y1 = max(0, int(y - h * margin))
    y2 = min(image.shape[0], int(y + h * (1 + margin)))
    x1 = max(0, int(x - w * margin))
    x2 = min(image.shape[1], int(x + w * (1 + margin)))
    
    return image[y1:y2, x1:x2], face_area

def isolate_face_only(image: np.ndarray, face_area: dict) -> str:
    """Crops the face and converts to base64 for visual feedback."""
    x, y, w, h = face_area['x'], face_area['y'], face_area['w'], face_area['h']
    # Add a small margin
    margin = 0.2
    y1 = max(0, int(y - h * margin))
    y2 = min(image.shape[0], int(y + h * (1 + margin)))
    x1 = max(0, int(x - w * margin))
    x2 = min(image.shape[1], int(x + w * (1 + margin)))
    
    face_img = image[y1:y2, x1:x2]
    _, buffer = cv2.imencode('.jpg', face_img)
    return base64.b64encode(buffer).decode('utf-8')

def decode_image(image_bytes: bytes) -> np.ndarray:
    nparr = np.frombuffer(image_bytes, np.uint8)
    img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    return img

@app.post("/extract")
async def extract_embedding(file: UploadFile = File(...)):
    """Extracts embedding and returns a 'Clean' isolated face image."""
    try:
        contents = await file.read()
        image = decode_image(contents)
        
        if image is None:
            raise HTTPException(status_code=400, detail="Invalid image file")
        
        # Detect and align face using OpenCV backend (matches the provided XML)
        try:
            objs = DeepFace.represent(
                img_path=image, 
                model_name="Facenet512", 
                detector_backend="opencv", 
                enforce_detection=True,
                align=True
            )
        except Exception as e:
            print(f"DeepFace Detection Failed: {str(e)}")
            # Fallback to manual Haar Cascade crop
            cropped_face, face_area = detect_and_crop_face(image)
            if cropped_face is not None:
                print("Using manual Haar Cascade crop fallback...")
                objs = DeepFace.represent(
                    img_path=cropped_face,
                    model_name="Facenet512",
                    detector_backend="skip", # Use the pre-cropped face
                    enforce_detection=False,
                    align=True
                )
                # Adjust face area back to original coordinates
                objs[0]["facial_area"] = face_area
            else:
                return {"success": False, "message": "No face detected by AI or Haar Cascade"}
        
        if not objs:
            return {"success": False, "message": "No face detected"}
            
        embedding = objs[0]["embedding"]
        face_area = objs[0]["facial_area"]
        
        # Return the isolated face image for visual feedback
        isolated_face_b64 = isolate_face_only(image, face_area)
        
        return {
            "success": True,
            "embedding": embedding,
            "isolated_face": isolated_face_b64,
            "face_detected": True
        }
    except Exception as e:
        return {"success": False, "message": str(e)}

@app.post("/liveness")
async def check_liveness(file: UploadFile = File(...)):
    """Dummy endpoint - Liveness check (blink) has been disabled."""
    return {
        "success": True, 
        "message": "Liveness check disabled",
        "eyes_closed": False,
        "isolated_face": ""
    }

@app.post("/verify")
async def verify_face(
    file: UploadFile = File(...), 
    stored_embedding: str = Form(...)
):
    """Verifies probe against stored embedding with improved detection isolation."""
    try:
        contents = await file.read()
        logger.info(f"Verify request received. Image size: {len(contents)} bytes")
        image = decode_image(contents)
        
        # Detect and align face using OpenCV backend
        try:
            objs = DeepFace.represent(
                img_path=image, 
                model_name="Facenet512", 
                detector_backend="opencv", 
                enforce_detection=True,
                align=True
            )
        except Exception as e:
            print(f"DeepFace Verification Detection Failed: {str(e)}")
            cropped_face, face_area = detect_and_crop_face(image)
            if cropped_face is not None:
                print("Using manual Haar Cascade crop fallback for verification...")
                objs = DeepFace.represent(
                    img_path=cropped_face,
                    model_name="Facenet512",
                    detector_backend="skip",
                    enforce_detection=False,
                    align=True
                )
            else:
                return {"success": False, "message": "No face detected during verification"}
        
        if not objs:
            return {"success": False, "message": "No face detected"}
            
        probe_embedding = np.array(objs[0]["embedding"])
        stored_descriptor = np.array(json.loads(stored_embedding))
        
        # Fast Cosine Similarity
        similarity = np.dot(probe_embedding, stored_descriptor) / (
            np.linalg.norm(probe_embedding) * np.linalg.norm(stored_descriptor)
        )
        
        logger.info(f"DEBUG: Face similarity score: {similarity:.4f}")
        is_match = bool(similarity > 0.55) # Lowered threshold further for debugging
        
        result_msg = "Match Found" if is_match else f"No Match (Score: {similarity:.4f})"
        
        return {
            "success": True,
            "match": is_match,
            "similarity": float(similarity),
            "message": result_msg,
            "isolated_face": isolate_face_only(image, objs[0]["facial_area"])
        }
    except Exception as e:
        return {"success": False, "message": str(e)}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
