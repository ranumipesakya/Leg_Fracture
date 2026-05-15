from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image, ImageOps
from datetime import datetime
import uuid

# =====================================================
# FLASK APP SETUP
# =====================================================

app = Flask(__name__)
CORS(app)

# =====================================================
# CONFIGURATION & THRESHOLDS
# =====================================================

XRAY_MODEL_PATH = "models/xray_detector_v2.keras"
LEG_MODEL_PATH = "models/leg_xray_classifier.keras"
FRACTURE_MODEL_PATH = "models/fracture_single.keras"

XRAY_THRESHOLD = 0.40
LEG_THRESHOLD = 0.40
FRACTURE_THRESHOLD = 0.30

# Mapping setting:
# Set to True if your model output means "Probability of NOT FRACTURED"
# Set to False if your model output means "Probability of FRACTURED"
FRACTURE_OUTPUT_IS_NOT_FRACTURED = True

# =====================================================
# LOAD MODELS
# =====================================================

print("Loading models... please wait.")

xray_model = tf.keras.models.load_model(XRAY_MODEL_PATH)
leg_model = tf.keras.models.load_model(LEG_MODEL_PATH)
fracture_model = tf.keras.models.load_model(FRACTURE_MODEL_PATH)

print("Models loaded successfully.")
print(f"X-ray model input: {xray_model.input_shape}")
print(f"Leg model input:   {leg_model.input_shape}")
print(f"Fracture model input: {fracture_model.input_shape}")

# Automatically detect image sizes from models
XRAY_IMG_SIZE = (xray_model.input_shape[1], xray_model.input_shape[2])
LEG_IMG_SIZE = (leg_model.input_shape[1], leg_model.input_shape[2])
FRACTURE_IMG_SIZE = (fracture_model.input_shape[1], fracture_model.input_shape[2])

# =====================================================
# PREPROCESSING FUNCTIONS
# =====================================================

def preprocess_image(image, target_size, mode="RGB"):
    """Simple preprocessing pipeline for all models."""
    # 1. Fix EXIF orientation
    image = ImageOps.exif_transpose(image)
    
    # 2. Convert to required mode (RGB or Grayscale)
    image = image.convert(mode)
    
    # 3. Resize
    image = image.resize(target_size)
    
    # 4. Normalize to [0, 1]
    img_array = np.array(image, dtype=np.float32) / 255.0
    
    # If grayscale but model expects 3 channels (like some X-ray models)
    if mode == "L" and len(img_array.shape) == 2:
        img_array = np.stack([img_array, img_array, img_array], axis=-1)
        
    # 5. Expand batch dimension
    img_array = np.expand_dims(img_array, axis=0)
    
    return img_array

# =====================================================
# ROUTES
# =====================================================

@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Fracture Detection API is running",
        "status": "online",
        "fracture_threshold": FRACTURE_THRESHOLD
    })

@app.route("/predict", methods=["POST"])
def predict():
    # Basic check for uploaded image
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]
    
    try:
        image = Image.open(file.stream)
    except Exception:
        return jsonify({"error": "Invalid image file format"}), 400

    # Generate metadata
    report_id = f"REP-{str(uuid.uuid4().int)[:6]}"
    generated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    print(f"\n--- Processing New Request: {report_id} ---")

    # -----------------------------------------------------
    # STAGE 1: X-RAY DETECTION
    # -----------------------------------------------------
    print("Stage 1: Checking if image is an X-ray...")
    xray_input = preprocess_image(image, XRAY_IMG_SIZE, mode="L")
    xray_raw = float(xray_model.predict(xray_input, verbose=0)[0][0])
    
    is_xray = xray_raw >= XRAY_THRESHOLD
    xray_confidence = xray_raw if is_xray else (1.0 - xray_raw)
    
    print(f"X-ray raw output: {xray_raw:.4f} | Is X-ray: {is_xray}")

    if not is_xray:
        return jsonify({
            "report_id": report_id,
            "generated_at": generated_at,
            "stage": "xray_check",
            "is_xray": False,
            "is_leg_xray": None,
            "xray_confidence": round(xray_confidence, 4),
            "leg_confidence": None,
            "fracture_prediction": None,
            "fracture_confidence": None,
            "fracture_raw_prediction": None,
            "fracture_probability": None,
            "threshold_used": FRACTURE_THRESHOLD,
            "recommendation": "Please upload a valid X-ray image."
        })

    # -----------------------------------------------------
    # STAGE 2: LEG X-RAY CLASSIFICATION
    # -----------------------------------------------------
    print("Stage 2: Checking if X-ray is a Leg X-ray...")
    leg_input = preprocess_image(image, LEG_IMG_SIZE, mode="RGB")
    leg_raw = float(leg_model.predict(leg_input, verbose=0)[0][0])
    
    # Mapping for leg model: leg=0, not_leg=1
    is_leg_xray = leg_raw < LEG_THRESHOLD
    leg_confidence = (1.0 - leg_raw) if is_leg_xray else leg_raw
    
    print(f"Leg raw output: {leg_raw:.4f} | Is Leg: {is_leg_xray}")

    if not is_leg_xray:
        return jsonify({
            "report_id": report_id,
            "generated_at": generated_at,
            "stage": "leg_check",
            "is_xray": True,
            "is_leg_xray": False,
            "xray_confidence": round(xray_confidence, 4),
            "leg_confidence": round(leg_confidence, 4),
            "fracture_prediction": None,
            "fracture_confidence": None,
            "fracture_raw_prediction": None,
            "fracture_probability": None,
            "threshold_used": FRACTURE_THRESHOLD,
            "recommendation": "Please upload a Leg X-ray image."
        })

    # -----------------------------------------------------
    # STAGE 3: FRACTURE DETECTION
    # -----------------------------------------------------
    print("Stage 3: Detecting fracture...")
    fracture_input = preprocess_image(image, FRACTURE_IMG_SIZE, mode="RGB")
    raw_pred = float(fracture_model.predict(fracture_input, verbose=0)[0][0])
    
    # Handle mapping logic
    if FRACTURE_OUTPUT_IS_NOT_FRACTURED:
        fracture_probability = 1.0 - raw_pred
    else:
        fracture_probability = raw_pred
        
    is_fractured = fracture_probability >= FRACTURE_THRESHOLD
    
    if is_fractured:
        fracture_prediction = "Fractured"
        fracture_confidence = fracture_probability
        recommendation = "Potential fracture detected. Please consult an orthopedic specialist."
    else:
        fracture_prediction = "Not Fractured"
        fracture_confidence = 1.0 - fracture_probability
        recommendation = "No fracture detected by AI screening. Clinical confirmation is still recommended."

    print(f"Fracture raw: {raw_pred:.4f} | Prob: {fracture_probability:.4f} | Result: {fracture_prediction}")
    print(f"--- Processing Complete for {report_id} ---\n")

    # -----------------------------------------------------
    # FINAL JSON RESPONSE
    # -----------------------------------------------------
    return jsonify({
        "report_id": report_id,
        "generated_at": generated_at,
        "stage": "fracture_check",
        "is_xray": True,
        "is_leg_xray": True,
        "xray_confidence": round(xray_confidence, 4),
        "leg_confidence": round(leg_confidence, 4),
        "fracture_prediction": fracture_prediction,
        "fracture_confidence": round(fracture_confidence, 4),
        "fracture_raw_prediction": round(raw_pred, 4),
        "fracture_probability": round(fracture_probability, 4),
        "threshold_used": FRACTURE_THRESHOLD,
        "recommendation": recommendation
    })

# =====================================================
# RUN SERVER
# =====================================================

if __name__ == "__main__":
    # Note: debug=True allows for automatic reloading on code changes
    app.run(host="0.0.0.0", port=5001, debug=True)
