from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
import numpy as np
from PIL import Image
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

# Load models
xray_model = tf.keras.models.load_model("models/xray_detector_v2.keras")
leg_model = tf.keras.models.load_model("models/leg_xray_classifier.keras")
fracture_model = tf.keras.models.load_model("models/fracture_single.keras")

IMG_SIZE = (224, 224)

def preprocess_for_xray(image):
    image = image.convert("L")
    image = image.resize(IMG_SIZE)

    img_array = np.array(image) / 255.0
    img_array = np.stack([img_array, img_array, img_array], axis=-1)
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def preprocess_for_leg(image):
    image = image.convert("RGB")
    image = image.resize(IMG_SIZE)

    img_array = np.array(image) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

def preprocess_for_fracture(image):
    image = image.convert("RGB")
    image = image.resize(IMG_SIZE)

    img_array = np.array(image) / 255.0
    img_array = np.expand_dims(img_array, axis=0)
    return img_array

@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image uploaded"}), 400

    file = request.files["image"]

    try:
        image = Image.open(file.stream)
    except Exception:
        return jsonify({"error": "Invalid image file"}), 400

    report_id = f"AI-{str(uuid.uuid4().int)[:4]}"
    generated_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    # 1) X-ray check
    xray_input = preprocess_for_xray(image)
    xray_pred = float(xray_model.predict(xray_input, verbose=0)[0][0])
    print("xray_pred:", xray_pred)

    if xray_pred >= 0.60:
        pass
    elif xray_pred <= 0.40:
        return jsonify({
            "report_id": report_id,
            "generated_at": generated_at,
            "stage": "xray_check",
            "is_xray": False,
            "is_leg_xray": None,
            "message": "Uploaded image is not an X-ray",
            "xray_confidence": xray_pred,
            "leg_confidence": None,
            "fracture_prediction": None,
            "fracture_confidence": None,
            "recommendation": "Please upload a valid radiological X-ray image."
        })
    else:
        return jsonify({
            "report_id": report_id,
            "generated_at": generated_at,
            "stage": "xray_check",
            "is_xray": False,
            "is_leg_xray": None,
            "message": "Unclear image",
            "xray_confidence": xray_pred,
            "leg_confidence": None,
            "fracture_prediction": None,
            "fracture_confidence": None,
            "recommendation": "Please upload a clearer X-ray image."
        })

    # 2) Leg check
    leg_input = preprocess_for_leg(image)
    leg_pred = float(leg_model.predict(leg_input, verbose=0)[0][0])
    print("leg_pred:", leg_pred)

    # mapping: {'leg_xray': 0, 'not_leg_xray': 1}
    is_leg_xray = leg_pred < 0.5
    leg_confidence = float(1 - leg_pred if is_leg_xray else leg_pred)

    if not is_leg_xray:
        return jsonify({
            "report_id": report_id,
            "generated_at": generated_at,
            "stage": "leg_check",
            "is_xray": True,
            "is_leg_xray": False,
            "message": "Valid X-ray, but not a leg X-ray",
            "xray_confidence": xray_pred,
            "leg_confidence": leg_confidence,
            "fracture_prediction": None,
            "fracture_confidence": None,
            "recommendation": "Please upload a leg X-ray image for fracture analysis."
        })

    # 3) Fracture check
    fracture_input = preprocess_for_fracture(image)
    fracture_pred = float(fracture_model.predict(fracture_input, verbose=0)[0][0])
    print("fracture_pred:", fracture_pred)

    # CORRECTED RULE
    fractured = fracture_pred < 0.5

    fracture_prediction = "Fractured" if fractured else "Not Fractured"
    fracture_confidence = float(1 - fracture_pred if fractured else fracture_pred)

    recommendation = (
        "Potential fracture detected. Please consult an orthopedic specialist."
        if fractured
        else "No fracture detected by AI screening. Clinical confirmation is still recommended."
    )

    return jsonify({
        "report_id": report_id,
        "generated_at": generated_at,
        "stage": "fracture_check",
        "is_xray": True,
        "is_leg_xray": True,
        "message": "Valid leg X-ray image",
        "xray_confidence": xray_pred,
        "leg_confidence": leg_confidence,
        "fracture_prediction": fracture_prediction,
        "fracture_confidence": fracture_confidence,
        "fracture_raw_prediction": fracture_pred,
        "recommendation": recommendation
    })

if __name__ == "__main__":
    app.run(port=5001, debug=True)